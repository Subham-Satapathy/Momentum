import { v4 as uuidv4 } from 'uuid';
import { DbService } from '../services/dbService';
import { computeTaskHash } from '../services/blockchain';
import { analyzeTaskWithAI } from '../services/ai';
import { Todo } from '../types/todo';
import { mapGraphQLToTaskStatus, mapTaskStatusToGraphQL } from './mappers';
import { createToken } from '../services/auth';

const transformTaskToGraphQL = (task: any) => {
  if (!task) return null;
  
  return {
    ...task,
    status: mapTaskStatusToGraphQL(task.status),
  };
};

const transformTaskFromGraphQL = (task: any) => {
  if (!task) return null;
  
  return {
    ...task,
    status: task.status ? mapGraphQLToTaskStatus(task.status) : undefined,
  };
};

interface Context {
  userAddress: string | null;
}

export const resolvers = {
  Query: {
    getTasks: async (_: any, __: any, { userAddress }: Context) => {
      if (!userAddress) {
        throw new Error('Authentication required');
      }
      
      try {
        const userTasks = await new DbService('tasks').find({ userAddress });
        return userTasks.map(transformTaskToGraphQL);
      } catch (error) {
        console.error('Error fetching tasks:', error);
        throw new Error('Error fetching tasks');
      }
    },
    
    getTask: async (_: any, { id }: { id: string }, { userAddress }: Context) => {
      if (!userAddress) {
        throw new Error('Authentication required');
      }
      
      try {
        const task = await new DbService('tasks').findOne({ 
          id, 
          userAddress 
        });
        
        if (!task) {
          throw new Error('Task not found');
        }
        
        return transformTaskToGraphQL(task);
      } catch (error) {
        console.error('Error fetching task:', error);
        throw new Error('Error fetching task');
      }
    },

    getUserBalance: async (_: any, __: any, { userAddress }: Context) => {
      if (!userAddress) {
        throw new Error('Authentication required');
      }
      
      try {
        const userService = new DbService('users');
        const user = await userService.findOne({ address: userAddress });
        
        return user?.tokenBalance || 0;
      } catch (error) {
        console.error('Error fetching user balance:', error);
        throw new Error('Error fetching user balance');
      }
    },
  },
  
  Mutation: {
    login: async (_: any, { walletAddress }: { walletAddress: string }) => {
      if (!walletAddress) {
        throw new Error('Wallet address is required');
      }
      
      try {
        const token = createToken(walletAddress);
        
        const userService = new DbService('users');
        await userService.updateOne(
          { address: walletAddress },
          { 
            $set: { lastLogin: new Date().toISOString() },
            $setOnInsert: { 
              address: walletAddress, 
              createdAt: new Date().toISOString(),
              tokenBalance: 0
            }
          },
          { upsert: true }
        );
        
        const user = await userService.findOne({ address: walletAddress });
        
        return { 
          token,
          user
        };
      } catch (error) {
        console.error('Error in login:', error);
        throw new Error('Login failed');
      }
    },
    
    updateUserTokenBalance: async (_: any, { amount }: { amount: number }, { userAddress }: Context) => {
      if (!userAddress) {
        throw new Error('Authentication required');
      }
      
      try {
        const userService = new DbService('users');
        const user = await userService.findOne({ address: userAddress });
        
        if (!user) {
          throw new Error('User not found');
        }
        
        const currentBalance = user.tokenBalance || 0;
        const newBalance = currentBalance + amount;
        
        await userService.updateOne(
          { address: userAddress },
          { $set: { tokenBalance: newBalance } }
        );
        
        const updatedUser = await userService.findOne({ address: userAddress });
        return updatedUser;
      } catch (error) {
        console.error('Error updating user token balance:', error);
        throw new Error('Failed to update token balance');
      }
    },
    
    createTask: async (_: any, { input }: { input: any }, { userAddress }: Context) => {
      if (!userAddress) {
        throw new Error('Authentication required');
      }
      
      try {
        const transformedInput = transformTaskFromGraphQL(input);
        
        const newTask: Todo = {
          id: uuidv4(),
          content: transformedInput.content,
          description: transformedInput.description || '',
          completed: false,
          createdAt: new Date().toISOString(),
          priority: transformedInput.priority || 'medium',
          dueDate: transformedInput.dueDate,
          taskType: transformedInput.taskType || 'personal',
          status: 'to-do',
          tags: transformedInput.tags || [transformedInput.taskType || 'personal'],
          userAddress,
          verified: false,
        };

        const aiAnalysis = await analyzeTaskWithAI(newTask);

        if (aiAnalysis?.suggestedPriority) {
          newTask.priority = aiAnalysis.suggestedPriority;
        }
        
        if (aiAnalysis?.tips) {
          newTask.tags = [...aiAnalysis.tips];
        }

        newTask.taskHash = computeTaskHash(newTask);
        
        await new DbService('tasks').create(newTask);
        
        return transformTaskToGraphQL(newTask);
      } catch (error) {
        console.error('Error creating task:', error);
        throw new Error('Error creating task');
      }
    },
    
    updateTask: async (_: any, { input }: { input: any }, { userAddress }: Context) => {
      if (!userAddress) {
        throw new Error('Authentication required');
      }
      
      if (!input.id) {
        throw new Error('Task ID is required');
      }
      
      try {
        const transformedInput = transformTaskFromGraphQL(input);
        const taskDb = new DbService('tasks');
        const existingTask = await taskDb.findOne({ 
          id: transformedInput.id, 
          userAddress 
        });
        
        if (!existingTask) {
          throw new Error('Task not found');
        }
        
        const updatedTask = {
          ...existingTask,
          ...transformedInput,
        };
        
        await taskDb.updateOne(
          { id: transformedInput.id }, 
          { $set: transformedInput }
        );
        
        return transformTaskToGraphQL(updatedTask);
      } catch (error) {
        console.error('Error updating task:', error);
        throw new Error('Error updating task');
      }
    },
    
    deleteTask: async (_: any, { id }: { id: string }, { userAddress }: Context) => {
      if (!userAddress) {
        throw new Error('Authentication required');
      }
      
      if (!id) {
        throw new Error('Task ID is required');
      }
      
      try {
        const result = await new DbService('tasks').deleteOne({ 
          id,
          userAddress
        });
        
        return result.deletedCount > 0;
      } catch (error) {
        console.error('Error deleting task:', error);
        throw new Error('Error deleting task');
      }
    },
    
    completeTask: async (_: any, { id }: { id: string }, { userAddress }: Context) => {
      if (!userAddress) {
        throw new Error('Authentication required');
      }
      
      if (!id) {
        throw new Error('Task ID is required');
      }
      
      try {
        const taskDb = new DbService('tasks');
        const existingTask = await taskDb.findOne({ 
          id, 
          userAddress 
        });
        
        if (!existingTask) {
          throw new Error('Task not found');
        }
        
        const updatedTask = {
          ...existingTask,
          completed: true,
          completedAt: new Date().toISOString(),
          status: 'completed'
        };
        
        await taskDb.updateOne(
          { id }, 
          { 
            $set: { 
              completed: true,
              completedAt: new Date().toISOString(),
              status: 'completed'
            } 
          }
        );
        
        return transformTaskToGraphQL(updatedTask);
      } catch (error) {
        console.error('Error completing task:', error);
        throw new Error('Error completing task');
      }
    },
  }
};