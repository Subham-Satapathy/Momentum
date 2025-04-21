import { DbService } from './dbService';
import { Todo, TaskStatus } from '../types/todo';

class TaskService extends DbService<Todo> {
  constructor() {
    super('tasks');
  }

  async findByUserId(userAddress: string) {
    return this.find({ userAddress });
  }

  async markAsCompleted(taskId: string, userAddress: string) {
    const now = new Date().toISOString();
    return this.updateOne(
      { id: taskId, userAddress },
      { 
        $set: { 
          completed: true, 
          status: 'completed' as TaskStatus,
          completedAt: now
        } 
      }
    );
  }

  async updateStatus(taskId: string, status: TaskStatus, userAddress: string) {
    const updateData: Partial<{
      status: TaskStatus,
      completed: boolean,
      completedAt: string | undefined
    }> = { status };
    
    if (status === 'completed') {
      updateData.completed = true;
      updateData.completedAt = new Date().toISOString();
    } else {
      updateData.completed = false;
      updateData.completedAt = undefined;
    }

    return this.updateOne(
      { id: taskId, userAddress },
      { $set: updateData }
    );
  }

  async verifyTask(taskId: string, txHash: string, userAddress: string) {
    return this.updateOne(
      { id: taskId, userAddress },
      { $set: { verified: true, txHash } }
    );
  }
}

export const Task = new TaskService(); 