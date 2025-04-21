import { expect } from "chai";
import { ethers } from "hardhat";
import { TaskManager } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("TaskManager", function () {
  let taskManager: TaskManager;
  let taskHash: string;
  let owner: HardhatEthersSigner;
  let otherAccount: HardhatEthersSigner;

  beforeEach(async function () {

    const signers = await ethers.getSigners();
    owner = signers[0];
    otherAccount = signers[1];

    const TaskManagerFactory = await ethers.getContractFactory("TaskManager");
    taskManager = await TaskManagerFactory.deploy();
    await taskManager.waitForDeployment();

    const taskString = "Sample Task";
    taskHash = ethers.keccak256(ethers.toUtf8Bytes(taskString));
  });

  it("Should create a task and emit TaskCreated event", async function () {
    await expect(taskManager.createTask(taskHash))
      .to.emit(taskManager, "TaskCreated")
      .withArgs(taskHash, owner.address);
  });

  it("Should not allow creating a duplicate task", async function () {
    await taskManager.createTask(taskHash);
    await expect(taskManager.createTask(taskHash)).to.be.revertedWith(
      "Task already exists"
    );
  });

  it("Should verify if a task exists", async function () {

    expect(await taskManager.verifyTask(taskHash)).to.equal(false);

    await taskManager.createTask(taskHash);

    expect(await taskManager.verifyTask(taskHash)).to.equal(true);
  });

  it("Should complete a task and emit TaskCompleted event", async function () {

    await taskManager.createTask(taskHash);

    await expect(taskManager.completeTask(taskHash))
      .to.emit(taskManager, "TaskCompleted")
      .withArgs(taskHash);

    expect(await taskManager.isTaskCompleted(taskHash)).to.equal(true);
  });

  it("Should not allow completing a non-existent task", async function () {
    await expect(taskManager.completeTask(taskHash)).to.be.revertedWith(
      "Task does not exist"
    );
  });

  it("Should not allow completing an already completed task", async function () {

    await taskManager.createTask(taskHash);
    await taskManager.completeTask(taskHash);

    await expect(taskManager.completeTask(taskHash)).to.be.revertedWith(
      "Task is already completed"
    );
  });

  it("Should not allow non-owners to complete a task", async function () {

    await taskManager.connect(owner).createTask(taskHash);

    await expect(
      taskManager.connect(otherAccount).completeTask(taskHash)
    ).to.be.revertedWith("Only the task owner can complete this task");
  });
}); 