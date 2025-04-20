import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { TaskStatus, Todo, Priority } from '../../../types/todo';
import { connectToDatabase, Task } from '../../../configs/mongodb';
import { verifyToken } from '../../../services/auth';
import { DbService } from '../../../services/dbService';
import { computeTaskHash } from '../../../services/blockchain';
import { analyzeTaskWithAI } from '../../../services/ai';

export async function GET(request: NextRequest) {
  // Get token from Authorization header
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }
  
  const token = authHeader.substring(7);
  const decoded = verifyToken(token);
  
  if (!decoded || !decoded.address) {
    return NextResponse.json(
      { error: 'Invalid token' },
      { status: 401 }
    );
  }
  
  try {
   
    // Get tasks for this user
    const userTasks = await new DbService('tasks').find({ userAddress: decoded.address });
    
    return NextResponse.json({ tasks: userTasks });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Error fetching tasks' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Get token from Authorization header
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }
  
  const token = authHeader.substring(7);
  const decoded = verifyToken(token);
  
  if (!decoded || !decoded.address) {
    return NextResponse.json(
      { error: 'Invalid token' },
      { status: 401 }
    );
  }
  
  try {
    const requestData = await request.json();
    
    // Validate required fields
    if (!requestData.content) {
      return NextResponse.json(
        { error: 'Task content is required' },
        { status: 400 }
      );
    }
    // Create a new task
    const newTask: Todo = {
      id: uuidv4(),
      content: requestData.content,
      description: requestData.description || '',
      completed: false,
      createdAt: new Date().toISOString(),
      priority: requestData.priority || 'medium',
      dueDate: requestData.dueDate,
      taskType: requestData.taskType || 'personal',
      status: 'to-do' as TaskStatus,
      tags: [requestData.taskType || 'personal'],
      userAddress: decoded.address,
      verified: false,
    };
    
    // Analyze task with AI
    const aiAnalysis = analyzeTaskWithAI(newTask);
    
    // Update task with AI suggestions
    newTask.priority = aiAnalysis.suggestedPriority;
    if (aiAnalysis.tips) {
      newTask.tags = [...(newTask.tags || []), ...aiAnalysis.tips];
    }
    
    // Compute task hash for future verification
    newTask.taskHash = computeTaskHash(newTask);
    
    // Save to MongoDB
    await new DbService('tasks').create(newTask);
    
    return NextResponse.json({ task: newTask });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { error: 'Error creating task' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  // Get token from Authorization header
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }
  
  const token = authHeader.substring(7);
  const decoded = verifyToken(token);
  
  if (!decoded || !decoded.address) {
    return NextResponse.json(
      { error: 'Invalid token' },
      { status: 401 }
    );
  }
  
  try {
    const requestData = await request.json();
    
    // Validate required fields
    if (!requestData.id) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      );
    }
    
    // Save the updated task
    const task = await new DbService('tasks').updateOne(
      { id: requestData.id }, 
      { $set: requestData }
    );
    
    return NextResponse.json({ task });
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json(
      { error: 'Error updating task' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  // Get token from Authorization header
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }
  
  const token = authHeader.substring(7);
  const decoded = verifyToken(token);
  
  if (!decoded || !decoded.address) {
    return NextResponse.json(
      { error: 'Invalid token' },
      { status: 401 }
    );
  }
  
  const url = new URL(request.url);
  const taskId = url.searchParams.get('id');
  
  if (!taskId) {
    return NextResponse.json(
      { error: 'Task ID is required' },
      { status: 400 }
    );
  }
  
  try {
    // Connect to MongoDB
    const result = await new DbService('tasks').deleteOne({ 
      id: taskId,
      userAddress: decoded.address
    });
    
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json(
      { error: 'Error deleting task' },
      { status: 500 }
    );
  }
} 