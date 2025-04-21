# TaskManager Smart Contract

A Solidity smart contract deployed on Sepolia testnet that allows storing task hashes and marking them as completed.

## Features

- Store task hashes on the blockchain
- Emit events when tasks are created or completed
- Verify if a task exists
- Mark tasks as completed

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables:
   - Create a `.env` file with the following:
     ```
     PRIVATE_KEY=your_private_key
     SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_API_KEY
     ETHERSCAN_API_KEY=your_etherscan_api_key
     ```

## Deployment

Deploy to Sepolia testnet:

```bash
npx hardhat run scripts/deploy.ts --network sepolia
```

## Interacting with the Contract

1. Update the contract address in `scripts/interact.ts` with your deployed contract address
2. Run the interaction script:
   ```bash
   npx hardhat run scripts/interact.ts --network sepolia
   ```

## Contract Functions

- `createTask(bytes32 taskHash)`: Store a new task hash
- `verifyTask(bytes32 taskHash)`: Check if a task exists
- `completeTask(bytes32 taskHash)`: Mark a task as completed
- `isTaskCompleted(bytes32 taskHash)`: Check if a task is completed

## Events

- `TaskCreated(bytes32 indexed taskHash)`: Emitted when a new task is created
- `TaskCompleted(bytes32 indexed taskHash)`: Emitted when a task is marked as completed
