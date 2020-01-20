import React, { Component } from 'react';
import './App.css';
import Web3 from 'web3';
import Meme from '../abis/Meme.json'

//Progress on Video
// Last stopped: 1:25:17, Part 4

const ipfsClient = require('ipfs-http-client')
const ipfs = ipfsClient({host: 'ipfs.infura.io', port: 5001,  protocol: 'https' })

class App extends Component {

  async componentWillMount(){
    await this.loadWeb3()
    await this.loadBlockchainData()
  }


  // Get the account
  // Get the network
  // Get the Smart Contract
  //---> ABI: Meme.abi
  //---> Address: networkData.address
  // Get the Meme Hash

  async loadBlockchainData(){

    const web3 = window.web3
    const accounts = await web3.eth.getAccounts()
    this.setState({account: accounts[0]})
    const networkId = await web3.eth.net.getId()
    const networkData = Meme.networks[networkId]
    if(networkData){
      const abi = Meme.abi
      const address = networkData.address
      const contract = web3.eth.Contract(abi, address)
      this.setState({ contract })
      const memeHash = await contract.methods.get().call()
      this.setState({memeHash})
    }

    else{
      window.alert('Smart contract not deployed to specified network')
    }

  }
  constructor(props) {
    super(props);

    this.state = {
      account: '',
      buffer: null,
      contract: null,
      memeHash: ''
    };
  }

// Detect if the user is using Metamask or not
  async loadWeb3() {
    if(window.ethereum){
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    } if(window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)

    } else{
      window.alert('Please use Metamask!')
    }

  }




  captureFile = (event) => {
    event.preventDefault()

    // Process file for IPFS
    const file = event.target.files[0]
    const reader = new window.FileReader()
    reader.readAsArrayBuffer(file)
    reader.onloadend = () => {
      this.setState({buffer : Buffer(reader.result)})

    }
}


  //Example hash: QmQPjsXPQjJ54mfMB7V6zBnX8hxSWsQXeu7gtFyZp3oUUb
  //Example url: https://ipfs.infura.io/ipfs/QmQPjsXPQjJ54mfMB7V6zBnX8hxSWsQXeu7gtFyZp3oUUb

  onSubmit = (event) => {
  event.preventDefault()
  console.log("Submitting the form")
  ipfs.add(this.state.buffer, (error, result) => {
    console.log('ipfs result', result)
    const memeHash = result[0].hash
    this.setState({ memeHash })

    if(error){
      console.error(error)
      return
    }

    //Step 2: store file on blockchain...
    this.state.contract.methods.set(memeHash).send({ from: this.state.account }).then((r) => {
      this.setState({memeHash})
    })

  })
}

  render() {
    return (
      <div>
        <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
          
            Meme of the Day
          
          <ul className="navbar-nav px-3">
            <li className="nav-item text-nowrap d-none d-sm-none d-sm-block">
              <small className="text-white"> {this.state.account} </small>
            </li>
          </ul>
        </nav>
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto">
                <a href="https://www.youtube.com/watch?v=oHg5SJYRHA0" target="_blank">
                  <img src={`https://ipfs.infura.io/ipfs/${this.state.memeHash}`} width="700" height="500"/>
                </a>
                <p>&nbsp;</p>
                <h2> Change Meme </h2>
                <form onSubmit = {this.onSubmit}>
                  <input type='file' onChange={this.captureFile} />
                  <input type='submit' />
                </form>
                  <select name="cars" className='cars'>
                    <option value="volvo">Volvo</option>
                    <option value="saab">Saab</option>
                    <option value="fiat">Fiat</option>
                    <option value="audi">Audi</option>
                  </select>

              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
