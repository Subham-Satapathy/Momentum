// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract TaskManager {
    struct Task {
        bytes32 taskHash;
        address owner;
        bool completed;
        bool exists;
    }

    mapping(bytes32 => Task) public tasks;
    
    event TaskCreated(bytes32 indexed taskHash, address indexed owner);
    event TaskCompleted(bytes32 indexed taskHash);

    function createTask(bytes32 taskHash) external {
        require(!tasks[taskHash].exists, "Task already exists");
        
        tasks[taskHash] = Task({
            taskHash: taskHash,
            owner: msg.sender,
            completed: false,
            exists: true
        });
        
        emit TaskCreated(taskHash, msg.sender);
    }
    
    function completeTask(bytes32 taskHash) external {
        require(tasks[taskHash].exists, "Task does not exist");
        require(!tasks[taskHash].completed, "Task is already completed");
        require(tasks[taskHash].owner == msg.sender, "Only the task owner can complete this task");
        
        tasks[taskHash].completed = true;
        
        emit TaskCompleted(taskHash);
    }
    
    function verifyTask(bytes32 taskHash) external view returns (bool) {
        return tasks[taskHash].exists;
    }
    
    function isTaskCompleted(bytes32 taskHash) external view returns (bool) {
        require(tasks[taskHash].exists, "Task does not exist");
        return tasks[taskHash].completed;
    }
} 