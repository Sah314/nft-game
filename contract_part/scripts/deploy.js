

const main = async()=>{
  const gameContractFactory = await hre.ethers.getContractFactory("Mygame");
 // Set the desired gas limit here
  const gameContract = await gameContractFactory.deploy(
    ["DarthVader", "Shaktiman", "Naruto"],       
    ["https://www.shutterstock.com/image-photo/san-benedetto-del-tronto-italy-260nw-239338216.jpg","https://www.pinkvilla.com/files/styles/large/public/shaktimanunknownfactsmain.jpg",
    "https://images5.alphacoders.com/413/413842.jpg"],
    [100, 200,300],                   
[100, 50, 25] ,
"Groot",
"https://duet-cdn.vox-cdn.com/thumbor/0x0:1200x696/828x552/filters:focal(631x178:632x179):format(webp)/cdn.vox-cdn.com/uploads/chorus_asset/file/8378039/baby-groot-guardians.0.jpg",
1200,
60); 
  await gameContract.deployed();
  console.log("Contract Deployed to:", gameContract.address);

};

const runMain = async()=>{

  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.error(error)
    process.exit(1);

  }
};

runMain();