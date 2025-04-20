export type Priority = 'low' | 'medium' | 'high';
export type TaskStatus = 'to-do' | 'in-progress' | 'completed';
export type TaskType = 'personal' | 'work' | 'study' | 'other';

export interface Todo {
  id: string;
  content: string;
  description?: string;
  completed: boolean;
  createdAt: string;
  completedAt?: string;
  priority: Priority;
  dueDate?: string;
  tags?: string[];
  status: TaskStatus;
  taskType: TaskType;
  verified?: boolean;
  txHash?: string;
  taskHash?: string;
  userAddress?: string;
} 