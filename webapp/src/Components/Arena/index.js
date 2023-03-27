import React, {useEffect, useState} from 'react';
import {ethers} from 'ethers';
import { CONTRACT_ADDRESS,ABI,transformCharacterData } from '../../constants';
import './Arena.css'

const Arena = ({characterNFT,setCharacterNFT,currentAccount})=>{

    const [gameContract,setGameContract]= useState(null);

    const [boss,setBoss] = useState(null);
    const [attackState , setAttackState] = useState('');
    const runAttackAction = async () => {
try {
  if(gameContract){
    setAttackState("attacking");
    console.log("Attacking Boss!");
    const txn = await gameContract.attackBoss();
    await txn.wait();
    console.log("attacktxn: ",txn);
    setAttackState('hit');
    const tn = await gameContract.replenishHealth();
    await tn.wait();
    setTimeout(() => {
      console.log("playerhealth increased  ",tn);
    },60000);
  }
} catch (error) {
  console.error(error);
  setAttackState('');
}
    };


    useEffect(()=>{
        const {ethereum} = window;

        if(ethereum){
            const provider = new ethers.providers.Web3Provider(ethereum);
            const signer = provider.getSigner();
            const gameContract = new ethers.Contract(CONTRACT_ADDRESS,ABI,signer);
            setGameContract(gameContract);
        }
        else{
            console.log("Ethereum Object not Found");
        }
    },[]);

    useEffect(() => {        
      const fetchBoss=async()=>{
        const txn = await gameContract.getBigBoss();
        console.log('Boss: ',txn);
        setBoss(transformCharacterData(txn));
      };
      const onAttackComplete =(from,newBossHP,newPlayerHP)=>{
        const bossHP = newBossHP.toNumber();
        const playerHP=newPlayerHP.toNumber();
        const sender = from.toString(); 
        console.log(`Attack Complete: Boss HP: ${bossHP} Player HP: ${playerHP} `);
        if(currentAccount === sender.toLowerCase()){
          setBoss((prevState)=>{
            return {...prevState,HP:bossHP};
          });
          setCharacterNFT((prevState)=>{
            return {...prevState,HP:playerHP};
          });
        }
        else{
          setBoss((prevState)=>{
            return {...prevState,HP:bossHP};
          });
        }
      }

      if(gameContract){
        fetchBoss();
        gameContract.on('AttackComplete', onAttackComplete);
      }
      return()=>{
        if(gameContract){
          gameContract.off("Attack Complete",onAttackComplete)
        }
      }
    }, [gameContract])
    

    return(
        <div className='arena-container'>
          {boss && (
            <div className="boss-container">
              <div className={`boss-container`}>
                <h2>{boss.name}</h2>
                <div className="image-content">
                  <img src={boss.imageURI} alt={`Boss ${boss.name}`}/>
                  <div className="health-bar">
                    <progress value={boss.HP} max={boss.maxHP}/>
                    <p>{`${boss.HP} / ${boss.maxHP} HP`}</p>
                  </div>
                </div>
              </div>
              <div className="attack-container">
                <button className="cta-button" onClick={runAttackAction}>{`Attack ${boss.name}`}</button>
              </div>
            </div>
          )}

{characterNFT &&(
<div className="player-container">
          <div className="player-container">
            <h2>Your Character</h2>
            <div className="player">
              <div className="image-content">
                <h2>{characterNFT.name}</h2>
                <img src={characterNFT.imageURI} alt={`Character ${characterNFT.name}`} />
                  <div className="health-bar">
                    <progress value={characterNFT.HP} max={characterNFT.maxHP}/>
                    <p>{`${characterNFT.HP} / ${characterNFT.maxHP} HP`}</p>
                  </div>  
              </div>
              <div className="stats">
                <h4>{`Attack Damage:${characterNFT.attackDamage}`}</h4>
              </div>
            </div>
          </div>
        </div>
        )}
        </div>
    );
}

export default Arena;