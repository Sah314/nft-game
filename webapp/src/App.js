import React, {useEffect,useState} from 'react';
import { ethers } from 'ethers';
import './App.css';
import SelectCharacter from './Components/SelectCharacter/SelectCharacter.js';
import { CONTRACT_ADDRESS,ABI,transformCharacterData } from './constants';
import Arena from './Components/Arena';
import LoadingIndicator from './Components/LoadingIndicator'

const App = () => {
  
  const [currentAccount,setCurrentAccount] =useState(null);
  const [characterNFT,setCharacterNFT] = useState(null);

  const [isLoading,setIsLoading] = useState(false);

  const checkIfWalletConnected= async()=>{
    checkNetwork();
    try {
      
      const {ethereum} = window;
      
      if(!ethereum){
        console.log("Metamask not present!");
        setIsLoading(false);
        return;
      }
      else{
        console.log("We have the object",ethereum);
  
        const accounts = await ethereum.request({method:'eth_accounts'});
  
        if(accounts.length !==0){
          const account = accounts[0];
          console.log("Authorized Account found!", account);
          setCurrentAccount(account);
        }
        else{
          console.log("Authorized account not found!");
        }
      }

    } catch (error) {
      console.error(error);
    }
    setIsLoading(false);
  };


const renderContent =()=>{
    if(isLoading){
      return <LoadingIndicator/>
    }

    if(!currentAccount){
      return(<div className="connect-wallet-container">
      <img
        src="https://media.tenor.com/qcVUCfxHJFUAAAAC/vader.gif"
        alt="Vader gif"
      />
     
      <button className="cta-button connect-wallet-button" onClick={connectWalletAction}> Please connect your wallet!!</button>
    </div>)
    }
    else if(currentAccount && !characterNFT){
      return <SelectCharacter setCharacterNFT={setCharacterNFT}/>
    }

    else if(currentAccount && characterNFT){
      return <Arena characterNFT={characterNFT} currentAccount={currentAccount} setCharacterNFT={setCharacterNFT}/>
    }
};

  const connectWalletAction= async()=>{
    try {
      const {ethereum} = window;
      if(!ethereum){
        console.log("Not connected!");
        alert("Please connect to metamask");
        return;
      }

      const accounts = await ethereum.request({method:'eth_requestAccounts',});

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.error(error);
    }
  }

  const checkNetwork =async()=>{
    try{
      console.log("type of network version is: ",typeof(window.ethereum.networkVersion))
      if(window.ethereum.networkVersion !=="11155111"){
        alert("Please connect to sepolia!")
      }
    }
    catch(error){
    console.error(error);
    }
  }

  useEffect(() => {
    setIsLoading(true);
    checkNetwork();
    checkIfWalletConnected();
  }, []); 
  

  useEffect(()=>{
    const fetchNFTMetadata = async()=>{
      console.log("Checking for Character NFT on address:", currentAccount);

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const gameContract = new ethers.Contract(CONTRACT_ADDRESS,ABI,signer);

      const txn = await gameContract.checkIfUserHasNFT();
      if(txn.name){
        console.log("Congratulations you already have a NFT!");
        
        setCharacterNFT(transformCharacterData(txn));
      }
      else{
        console.log("You do not have a NFT");
      }
      setIsLoading(false);
    };
    if(currentAccount){
      console.log("CurrentAccount: "+ currentAccount);
      fetchNFTMetadata();
    }
  },[currentAccount]);

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">⚔️ Metaverse Slayer ⚔️</p>
          <p className="sub-text">Team up to protect the Metaverse!</p>

          {renderContent()}
        </div>
        
        <div className="footer-container">
        
        </div>
      </div>
    </div>
  );

};

export default App;
