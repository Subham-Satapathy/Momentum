import { Todo, TaskType, Priority, TaskStatus } from '../types/todo';
import { getToken } from './auth';
import { graphqlRequest, Queries, Mutations } from './graphqlClient';
import { transformTaskFromGraphQL, transformTaskToGraphQL } from '../graphql/mappers';

interface LoginResponse {
  login: {
    token: string;
    user: {
      address: string;
      tokenBalance: number;
    }
  }
}

interface CreateTaskResponse {
  createTask: Record<string, any>;
}

interface GetTasksResponse {
  getTasks: Array<Record<string, any>>;
}

interface UpdateTaskResponse {
  updateTask: Record<string, any>;
}

interface DeleteTaskResponse {
  deleteTask: boolean;
}

interface CompleteTaskResponse {
  completeTask: Record<string, any>;
}

interface GetUserBalanceResponse {
  getUserBalance: number;
}

interface UpdateUserTokenBalanceResponse {
  updateUserTokenBalance: {
    address: string;
    tokenBalance: number;
  }
}

export const loginUser = async (walletAddress: string): Promise<string> => {
  try {
    const response = await graphqlRequest<LoginResponse>({
      query: Mutations.LOGIN,
      variables: { walletAddress },
    });

    if (response.errors && response.errors.length > 0) {
      throw new Error(response.errors[0].message || 'Login failed');
    }

    if (response.data?.login?.user?.tokenBalance) {
      const userTokenBalance = response.data.login.user.tokenBalance;
      
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('refresh-token-balance'));
      }, 100);
    }

    return response.data?.login.token || '';
  } catch (error) {
    console.error('Error during login:', error);
    throw error;
  }
};

export const createTask = async (taskData: {
  content: string;
  description?: string;
  priority: Priority;
  dueDate?: string;
  taskType: TaskType;
  taskHash?: string;
}): Promise<Todo> => {
  try {
    const token = getToken() || '';
    const graphQLInput = transformTaskToGraphQL(taskData);
    
    const response = await graphqlRequest<CreateTaskResponse>({
      query: Mutations.CREATE_TASK,
      variables: { input: graphQLInput },
      authToken: token,
    });

    if (response.errors && response.errors.length > 0) {
      throw new Error(response.errors[0].message || 'Failed to create task');
    }

    return transformTaskFromGraphQL(response.data?.createTask);
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
};

export const getTasks = async (): Promise<Todo[]> => {
  try {
    const token = getToken() || '';
    const response = await graphqlRequest<GetTasksResponse>({
      query: Queries.GET_TASKS,
      authToken: token,
    });

    if (response.errors && response.errors.length > 0) {
      throw new Error(response.errors[0].message || 'Failed to fetch tasks');
    }

    const tasks = response.data?.getTasks || [];
    return tasks.map(transformTaskFromGraphQL);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }
};

export const updateTask = async (taskId: string, updates: Partial<Todo>): Promise<Todo> => {
  try {
    const cleanedUpdates = { ...updates };
    Object.keys(cleanedUpdates).forEach((key: string) => {
      const k = key as keyof Partial<Todo>;
      if (cleanedUpdates[k] === undefined) {
        delete cleanedUpdates[k];
      }
    });
    
    const rawInput = { id: taskId, ...cleanedUpdates };
    const input = transformTaskToGraphQL(rawInput);
    const token = getToken() || '';
    
    const response = await graphqlRequest<UpdateTaskResponse>({
      query: Mutations.UPDATE_TASK,
      variables: { input },
      authToken: token,
    });

    if (response.errors && response.errors.length > 0) {
      throw new Error(response.errors[0].message || 'Failed to update task');
    }

    return transformTaskFromGraphQL(response.data?.updateTask);
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
};

export const deleteTask = async (taskId: string): Promise<boolean> => {
  try {
    const token = getToken() || '';
    const response = await graphqlRequest<DeleteTaskResponse>({
      query: Mutations.DELETE_TASK,
      variables: { id: taskId },
      authToken: token,
    });

    if (response.errors && response.errors.length > 0) {
      throw new Error(response.errors[0].message || 'Failed to delete task');
    }

    return response.data?.deleteTask || false;
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
};

export const updateTaskStatus = async (taskId: string, status: TaskStatus): Promise<Todo> => {
  try {
    if (status === 'completed') {
      const token = getToken() || '';
      const response = await graphqlRequest<CompleteTaskResponse>({
        query: Mutations.COMPLETE_TASK,
        variables: { id: taskId },
        authToken: token,
      });

      if (response.errors && response.errors.length > 0) {
        throw new Error(response.errors[0].message || 'Failed to complete task');
      }

      return transformTaskFromGraphQL(response.data?.completeTask);
    } else {
      const updates = { 
        status,
        completed: false,
      };
      return updateTask(taskId, updates);
    }
  } catch (error) {
    console.error('Error updating task status:', error);
    throw error;
  }
};

export const getUserTokenBalance = async (): Promise<number> => {
  try {
    const token = getToken() || '';
    const response = await graphqlRequest<GetUserBalanceResponse>({
      query: Queries.GET_USER_BALANCE,
      authToken: token,
    });

    if (response.errors && response.errors.length > 0) {
      throw new Error(response.errors[0].message || 'Failed to fetch token balance');
    }

    return response.data?.getUserBalance || 0;
  } catch (error) {
    console.error('Error fetching user token balance:', error);
    throw error;
  }
};

export const updateUserTokenBalance = async (amount: number): Promise<void> => {
  try {
    const token = getToken() || '';
    const response = await graphqlRequest<UpdateUserTokenBalanceResponse>({
      query: Mutations.UPDATE_USER_TOKEN_BALANCE,
      variables: { amount },
      authToken: token,
    });

    if (response.errors && response.errors.length > 0) {
      throw new Error(response.errors[0].message || 'Failed to update token balance');
    }

    return;
  } catch (error) {
    console.error('Error updating user token balance:', error);
    throw error;
  }
};