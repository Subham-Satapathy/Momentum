import { gql } from 'graphql-tag';

export const typeDefs = gql`
  enum Priority {
    low
    medium
    high
  }

  enum TaskStatus {
    to_do
    in_progress
    completed
  }

  enum TaskType {
    personal
    work
    study
    other
  }

  type Todo {
    id: ID!
    content: String!
    description: String
    completed: Boolean!
    createdAt: String!
    completedAt: String
    priority: Priority!
    dueDate: String
    tags: [String]
    status: TaskStatus!
    taskType: TaskType!
    verified: Boolean
    txHash: String
    taskHash: String
    userAddress: String
  }

  type User {
    address: String!
    createdAt: String
    lastLogin: String
    tokenBalance: Float
  }

  type AuthPayload {
    token: String!
    user: User
  }

  type Query {
    getTasks: [Todo]
    getTask(id: ID!): Todo
    getUserBalance: Float
  }

  input TodoInput {
    content: String!
    description: String
    priority: Priority
    dueDate: String
    taskType: TaskType
    tags: [String]
    taskHash: String
  }

  input TodoUpdateInput {
    id: ID!
    content: String
    description: String
    completed: Boolean
    priority: Priority
    dueDate: String
    status: TaskStatus
    taskType: TaskType
    tags: [String]
    verified: Boolean
    txHash: String
  }

  type Mutation {
    login(walletAddress: String!): AuthPayload
    createTask(input: TodoInput!): Todo
    updateTask(input: TodoUpdateInput!): Todo
    deleteTask(id: ID!): Boolean
    completeTask(id: ID!): Todo
    updateUserTokenBalance(amount: Float!): User
  }
`; 