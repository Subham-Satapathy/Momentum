import { Todo, TaskType, Priority, TaskStatus } from '../types/todo';
import { getToken } from './auth';

const API_BASE_URL = '/api';

const getAuthHeaders = () => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

export const loginUser = async (walletAddress: string): Promise<string> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ walletAddress }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    const data = await response.json();
    return data.token;
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
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(taskData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create task');
    }

    const data = await response.json();
    return data.task;
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
};

export const getTasks = async (): Promise<Todo[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch tasks');
    }

    const data = await response.json();
    return data.tasks;
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
    
    const requestBody = { id: taskId, ...cleanedUpdates };
    
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(requestBody),
      cache: 'no-store'
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update task');
    }

    const data = await response.json();
    return data.task;
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
};

export const deleteTask = async (taskId: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/tasks?id=${taskId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete task');
    }
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
};

export const updateTaskStatus = async (taskId: string, status: TaskStatus): Promise<Todo> => {
  const updates = { 
    status,
    completed: status === 'completed',
    completedAt: status === 'completed' ? new Date().toISOString() : undefined
  };
  return updateTask(taskId, updates);
};