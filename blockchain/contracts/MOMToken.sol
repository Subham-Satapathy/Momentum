// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract MOMToken is ERC20Permit, Ownable {
    using ECDSA for bytes32;
    
    // Mapping to track authorized reward distributors
    mapping(address => bool) public authorizedRewarders;
    
    // Maximum reward amount for non-owner addresses
    uint256 public maxRewardAmount = 100 * 10 ** 18; // 100 tokens with 18 decimals
    
    // Domain separator for EIP-712 signatures
    bytes32 private constant REWARD_TYPEHASH = keccak256("RewardWithPermit(address to,uint256 amount,uint256 nonce,uint256 deadline)");
    
    // Mapping to track used nonces for each authorizer
    mapping(address => uint256) public nonces;
    
    constructor(address initialOwner) 
        ERC20("Momentum Token", "MOM")
        ERC20Permit("Momentum Token")
        Ownable(initialOwner)
    {
        // Initial supply of 1,000,000 tokens (with 18 decimals)
        _mint(initialOwner, 1000000 * 10 ** decimals());
        
        // Set the initial owner as an authorized rewarder
        authorizedRewarders[initialOwner] = true;
    }

    /**
     * @dev Rewards the specified amount of tokens to the signer
     * @param amount The amount of tokens to reward
     */
    function reward(uint256 amount) external onlyOwner {
        _mint(msg.sender, amount);
    }

    /**
     * @dev Rewards the specified amount of tokens to a specific address
     * @param to Address to reward tokens to
     * @param amount The amount of tokens to reward
     */
    function rewardTo(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
    
    /**
     * @dev Authorizes an address to distribute rewards
     * @param rewarder Address to authorize
     */
    function authorizeRewarder(address rewarder) external onlyOwner {
        authorizedRewarders[rewarder] = true;
    }
    
    /**
     * @dev Revokes reward distribution authorization
     * @param rewarder Address to revoke
     */
    function revokeRewarder(address rewarder) external onlyOwner {
        authorizedRewarders[rewarder] = false;
    }
    
    /**
     * @dev Sets the maximum reward amount for non-owner addresses
     * @param amount New maximum amount
     */
    function setMaxRewardAmount(uint256 amount) external onlyOwner {
        maxRewardAmount = amount;
    }
    
    /**
     * @dev Public reward function that can be called by authorized rewarders
     * This allows non-owner addresses to distribute rewards up to the max limit
     * @param to Address to reward tokens to
     * @param amount The amount of tokens to reward
     */
    function publicRewardTo(address to, uint256 amount) external {
        require(authorizedRewarders[msg.sender] || msg.sender == owner(), "Not authorized to reward");
        require(amount <= maxRewardAmount, "Reward exceeds maximum allowed");
        require(to != address(0), "Cannot reward to zero address");
        
        _mint(to, amount);
    }
    
    /**
     * @dev Returns the current nonce for an address
     * @param authorizer Address to get nonce for
     */
    function getNonce(address authorizer) public view returns (uint256) {
        return nonces[authorizer];
    }
    
    /**
     * @dev Rewards tokens to a recipient using a signed permit from an authorized rewarder
     * This allows rewards to be distributed without the recipient having to sign a transaction
     * @param to Address to reward tokens to
     * @param amount The amount of tokens to reward
     * @param deadline The deadline timestamp for the permit signature
     * @param authorizer The address of the authorizer who signed the permit
     * @param signature The signature of the authorizer
     */
    function rewardWithPermit(
        address to,
        uint256 amount,
        uint256 deadline,
        address authorizer,
        bytes memory signature
    ) external {
        require(block.timestamp <= deadline, "Reward permit expired");
        require(authorizedRewarders[authorizer] || authorizer == owner(), "Authorizer not allowed to reward");
        require(amount <= maxRewardAmount, "Reward exceeds maximum allowed");
        require(to != address(0), "Cannot reward to zero address");
        
        // Recreate the signed message hash
        bytes32 structHash = keccak256(abi.encode(
            REWARD_TYPEHASH,
            to,
            amount,
            nonces[authorizer]++,
            deadline
        ));
        
        bytes32 hash = _hashTypedDataV4(structHash);
        
        // Recover the signer from the hash and signature
        address signer = hash.recover(signature);
        
        // Ensure the signer matches the authorizer
        require(signer == authorizer, "Invalid signature");
        
        // Mint the tokens to the recipient
        _mint(to, amount);
    }
} 