require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config({path:'.env'})
/** @type import('hardhat/config').HardhatUserConfig */
const QUICKNODE_RPC_URL = process.env.QUICKNODE_RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

module.exports = {
  solidity: "0.8.17",
  networks:{
    sepolia:{
      url :QUICKNODE_RPC_URL,
      accounts:[PRIVATE_KEY]
    },
  },
};
