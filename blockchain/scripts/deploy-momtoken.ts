import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  
  // Deploy MOMToken contract
  const MOMToken = await ethers.getContractFactory("MOMToken");
  const momToken = await MOMToken.deploy(deployer.address);

  await momToken.waitForDeployment();
  
  const address = await momToken.getAddress();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 