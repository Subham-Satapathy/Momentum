# Momentum

A decentralized task management platform that rewards users with MOM tokens for completing tasks. Combining blockchain technology with a modern web interface, Momentum helps users build productive habits through tokenized incentives.

## Overview

Momentum is a productivity application that leverages blockchain technology to:

- Create and manage tasks
- Verify task completion
- Reward users with MOM tokens
- Build momentum through consistent task completion

## 📋 Project Structure

The project consists of two main components:

### Blockchain (Smart Contracts)

- `TaskManager.sol`: Manages task creation, verification, and completion tracking
- `MOMToken.sol`: ERC20 token with permit functionality that rewards users for completed tasks

### Web Application (Frontend)

- Built with Next.js 15.3.1
- React 19 for UI components
- Tailwind CSS for styling
- Ethers.js for blockchain interactions
- GraphQL for data querying

## 🔧 Technologies Used

### Blockchain
- Solidity 0.8.20
- Hardhat development environment
- OpenZeppelin contracts (ERC20, Ownable)
- EIP-712 signed message verification

### Frontend
- Next.js (with App Router)
- React
- TypeScript
- Tailwind CSS
- Apollo Client/Server
- Framer Motion for animations
- MongoDB for data persistence

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- npm or yarn
- MetaMask or another Ethereum wallet

### Blockchain Setup
1. Navigate to the blockchain directory:
   ```
   cd blockchain
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file with:
   ```
   PRIVATE_KEY=your_wallet_private_key
   INFURA_API_KEY=your_infura_api_key
   ```

4. Deploy contracts to local network:
   ```
   npm run deploy:all
   ```

   Or to Sepolia testnet:
   ```
   npm run deploy:all:sepolia
   ```

### Frontend Setup
1. Navigate to the web directory:
   ```
   cd web
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env.local` file with:
   ```
   MONGODB_URI=mongodb+srv://<USERNAME>:<PASSWORD>@<CLUSTER>.mongodb.net/?retryWrites=true&w=majority&appName=<APP_NAME>
   NEXT_PUBLIC_CONTRACT_ADDRESS=0x<YOUR_CONTRACT_ADDRESS>
   GOOGLE_API_KEY=<YOUR_GOOGLE_API_KEY>
   NEXT_PUBLIC_MOM_TOKEN_ADDRESS=0x<YOUR_TOKEN_ADDRESS>
   NEXT_PUBLIC_REWARDER_PRIVATE_KEY=<YOUR_REWARDER_PRIVATE_KEY>
   NEXT_PUBLIC_SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/<YOUR_INFURA_PROJECT_ID>
   NEXT_PUBLIC_JWT_SECRET=<YOUR_JWT_SECRET>

   ```

4. Start the development server:
   ```
   npm run dev
   ```

5. You can interact with my live app here : [https://momentum.subhs.xyz]

## Features

- **Task Management**: Create, track, and complete tasks with blockchain verification
- **Token Rewards**: Earn MOM tokens for completing tasks
- **Web3 Integration**: Connect your wallet to manage your tasks and tokens
- **Dashboard**: View your task history and token balance
- **Responsive Design**: Works on desktop and mobile devices

## Smart Contract Security

The smart contracts implement several security best practices:
- Access control using OpenZeppelin's Ownable
- EIP-712 signed messages for gasless operations
- Nonce tracking to prevent replay attacks
- Maximum reward limits for authorized distributors

## Testing

### Blockchain Tests
```
cd blockchain
npx hardhat test
```

### Frontend Tests
```
cd web
npm run test
```

## Deployment

### Smart Contracts
The project includes scripts for deploying to test networks and mainnet. See the deployment scripts in the `blockchain/scripts` directory.

### Frontend
The Next.js application can be deployed to Vercel or other hosting platforms:

```
cd web
npm run build
```

## License

This project is licensed under the MIT License.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
