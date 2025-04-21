import { ethers } from "hardhat";

async function main() {
  console.log("Deploying TaskManager contract...");

  const TaskManager = await ethers.getContractFactory("TaskManager");
  const taskManager = await TaskManager.deploy();

  await taskManager.waitForDeployment();
  
  const address = await taskManager.getAddress();
  console.log(`TaskManager deployed to: ${address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 