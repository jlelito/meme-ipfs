import React, { useEffect, useState } from 'react';
import './App.css';
import { getWeb3 } from './../utils.js';
import Meme from '../abis/Meme.json'

function App() {

  const [web3, setWeb3] = useState(undefined);
  const [accounts, setAccounts] = useState(undefined);
  const [contract, setContract] = useState(undefined);
  const [meme, setMeme] = useState(undefined);
  const [buff, setBuffer] = useState(undefined);
  

  useEffect(() => {
    const init = async () => {
      console.log("STARTING INIT!");
      const web3 = await getWeb3();
      console.log(web3);
      const accounts = await web3.eth.getAccounts();
      console.log(accounts[0]);
      const networkId = await web3.eth.net.getId();
      console.log(networkId);
      const deployedNetwork = Meme.networks[networkId];
      const contract = new web3.eth.Contract(
        Meme.abi,
        deployedNetwork && deployedNetwork.address,
      );
      const meme = await contract.methods.get().call();
      
      
      setWeb3(web3);
      setAccounts(accounts);
      setContract(contract);
      setMeme(meme);
      
      console.log("DONE INIT");
     
      
    }
    init();
    if(meme === undefined){
      console.log("SETTING MEME");
      setMeme("QmQPjsXPQjJ54mfMB7V6zBnX8hxSWsQXeu7gtFyZp3oUUb");
      console.log(meme);
    }
    window.ethereum.on('accountsChanged', accounts => {
      setAccounts(accounts);
      window.location.reload();
    });
  }, [web3]);

  const ipfsClient = require('ipfs-http-client');
  const ipfs = ipfsClient({host: 'ipfs.infura.io', port: 5001,  protocol: 'https' });

  const isReady = () => {
    return (
      typeof contract !== 'undefined' 
      && typeof web3 !== 'undefined'
      && typeof accounts !== 'undefined'
    );
  }


  useEffect(() => {
    if(isReady()) {
      console.log(accounts[0]);
      
    } 
  
  }, [accounts, contract, web3]);



  function captureFile  (event) {
    event.preventDefault();

    // Process file for IPFS
    const file = event.target.files[0];
    const reader = new window.FileReader();
    reader.readAsArrayBuffer(file);
    reader.onloadend = () => {
      setBuffer({buff : Buffer(reader.result)});

    }
}


  //Example hash: QmQPjsXPQjJ54mfMB7V6zBnX8hxSWsQXeu7gtFyZp3oUUb
  //Example url: https://ipfs.infura.io/ipfs/QmQPjsXPQjJ54mfMB7V6zBnX8hxSWsQXeu7gtFyZp3oUUb

  async function onSubmit(event) {

  event.preventDefault();
  console.log("Submitting the form");
  ipfs.add(buff, (error, result) => {
    console.log('ipfs result', result);
    const memeHash = result[0].hash;
    setMeme({ memeHash });

    if(error){
      console.error(error);
      return
    }

    //Step 2: store file on blockchain...
      contract.methods.set(memeHash).send({ from: accounts[0] }).then((r) => {
      setMeme({memeHash});
    })

  })
}


if (!isReady()) {
  console.log("Not ready");
  return <div>Loading...</div>;
}



  
    return (
      <div>
        <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
          
            Meme of the Day
          
          <ul className="navbar-nav px-3">
            <li className="nav-item text-nowrap d-none d-sm-none d-sm-block">
              <small className="text-white"> {accounts[0]} </small>
            </li>
          </ul>
        </nav>
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto">
                <a href="https://www.youtube.com/watch?v=oHg5SJYRHA0" target="_blank">
                  <img src={`https://ipfs.infura.io/ipfs/${meme}`} width="700" height="500"/>
                </a>
                <p>&nbsp;</p>
                <h2> Change Meme </h2>
                <form onSubmit = {e => onSubmit(e)}>
                  <input type='file' onChange={e => captureFile(e)} />
                  <input type='submit' />
                </form>

              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }


export default App;
