import { ethers } from "hardhat";

async function main() {
  const [owner, otherAccount] = await ethers.getSigners();

  console.log("Testing with accounts:");
  console.log(`Owner: ${owner.address}`);
  console.log(`Other account: ${otherAccount ? otherAccount.address : 'Not available'}`);

  console.log("\nDeploying a new TaskManager contract...");
  const TaskManager = await ethers.getContractFactory("TaskManager");
  const taskManager = await TaskManager.deploy();
  await taskManager.waitForDeployment();

  const address = await taskManager.getAddress();
  console.log(`TaskManager deployed to: ${address}`);
  
  const taskString = "Complete Hardhat project";
  const taskHash = ethers.keccak256(ethers.toUtf8Bytes(taskString));
  
  console.log(`\nCreating task with hash: ${taskHash}`);
  console.log(`Owner address: ${owner.address}`);
  const tx1 = await taskManager.connect(owner).createTask(taskHash);
  await tx1.wait();
  console.log("✅ Task created successfully! Event emitted.");
  
  const taskExists = await taskManager.verifyTask(taskHash);
  console.log(`\nTask exists: ${taskExists}`);
  
  if (otherAccount) {
    console.log(`\nAttempting to complete task from a different account: ${otherAccount.address}`);
    try {
      await taskManager.connect(otherAccount).completeTask(taskHash);
      console.log("❌ This should have failed but didn't!");
    } catch (error: any) {
      console.log(`✅ Failed as expected with message: ${error.message}`);
    }
  } else {
    console.log("\nSkipping other account test as only one signer is available");
  }
  
  console.log(`\nMarking task as completed by owner: ${owner.address}`);
  const tx2 = await taskManager.connect(owner).completeTask(taskHash);
  await tx2.wait();
  console.log("✅ Task completed successfully! Event emitted.");
  
  const isCompleted = await taskManager.isTaskCompleted(taskHash);
  console.log(`\nTask completed status: ${isCompleted}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 