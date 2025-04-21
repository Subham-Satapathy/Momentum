'use client';

import { useState } from 'react';
import { Todo as TodoType, TaskStatus } from '../types/todo';
import Todo from './Todo';
import { updateTask } from '../services/api';
import { toast } from 'react-hot-toast';

interface KanbanBoardProps {
  todos: TodoType[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, content: string, description: string, dueDate: string | undefined) => void;
  onVerified: (updatedTask: TodoType) => void;
  onStatusUpdate: (id: string, status: TaskStatus) => void;
}

export default function KanbanBoard({ todos, onToggle, onDelete, onEdit, onVerified, onStatusUpdate }: KanbanBoardProps) {

  const [statusFilter, setStatusFilter] = useState<'all' | 'to-do' | 'in-progress' | 'completed'>('all');

  const todoTasks = todos.filter(todo => !todo.completed && !todo.status.includes('in-progress'));

  const inProgressTasks = todos.filter(todo => !todo.completed && todo.status.includes('in-progress'));

  const completedTasks = todos.filter(todo => todo.completed);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    const task = todos.find(t => t.id === id);

    if (task?.verified) {
      e.preventDefault();
      toast.error("Verified tasks cannot be moved");
      return;
    }
    
    e.dataTransfer.setData('taskId', id);
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    const task = todos.find(t => t.id === taskId);
    
    if (!task || task.status === targetStatus) return;

    if (task.verified) {
      toast.error("Verified tasks cannot be modified");
      return;
    }
    
    try {

      const updatedTask = await updateTask(taskId, { status: targetStatus });
      
      if (updatedTask) {

        onStatusUpdate(taskId, targetStatus);

        if ((targetStatus === 'completed' && !task.completed) || 
            (targetStatus !== 'completed' && task.completed)) {
          onToggle(taskId);
        }
      }
    } catch (error) {
      console.error('Error updating task status:', error);
      toast.error('Failed to update task status. Please try again.');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  
  return (
    <div>
      <div className="flex space-x-4 mb-6">
        <button 
          className={`px-4 py-2 rounded-md ${statusFilter === 'all' ? 'text-white border-b-2 border-accent-400' : 'text-gray-300'}`}
          onClick={() => setStatusFilter('all')}
        >
          All
        </button>
        <button 
          className={`px-4 py-2 rounded-md ${statusFilter === 'to-do' ? 'text-white border-b-2 border-accent-400' : 'text-gray-300'}`}
          onClick={() => setStatusFilter('to-do')}
        >
          To-Do
        </button>
        <button 
          className={`px-4 py-2 rounded-md ${statusFilter === 'in-progress' ? 'text-white border-b-2 border-accent-400' : 'text-gray-300'}`}
          onClick={() => setStatusFilter('in-progress')}
        >
          In Progress
        </button>
        <button 
          className={`px-4 py-2 rounded-md ${statusFilter === 'completed' ? 'text-white border-b-2 border-accent-400' : 'text-gray-300'}`}
          onClick={() => setStatusFilter('completed')}
        >
          Completed
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(statusFilter === 'all' || statusFilter === 'to-do') && (
          <div 
            className="bg-dark-800 rounded-lg p-4 border border-dark-600"
            onDrop={(e) => handleDrop(e, 'to-do')}
            onDragOver={handleDragOver}
          >
            <h3 className="text-sm uppercase text-gray-500 font-medium mb-3 flex items-center justify-between">
              <span>To-Do</span>
              <span className="bg-dark-700 text-gray-400 rounded-full px-2 py-0.5 text-xs">
                {todoTasks.length}
              </span>
            </h3>
            <div className="space-y-3 min-h-[200px]">
              {todoTasks.length > 0 ? (
                todoTasks.map((todo) => (
                  <div 
                    key={todo.id} 
                    draggable={!todo.verified}
                    onDragStart={(e) => handleDragStart(e, todo.id)}
                    className={`${!todo.verified ? "cursor-move" : "cursor-not-allowed"} relative`}
                  >
                    <Todo
                      todo={todo}
                      onToggle={onToggle}
                      onDelete={onDelete}
                      onEdit={onEdit}
                      onVerified={onVerified}
                    />
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-gray-300">
                  <p>No to-do tasks</p>
                </div>
              )}
            </div>
          </div>
        )}
        
        {(statusFilter === 'all' || statusFilter === 'in-progress') && (
          <div 
            className="bg-dark-800 rounded-lg p-4 border border-dark-600"
            onDrop={(e) => handleDrop(e, 'in-progress')}
            onDragOver={handleDragOver}
          >
            <h3 className="text-sm uppercase text-gray-500 font-medium mb-3 flex items-center justify-between">
              <span>In Progress</span>
              <span className="bg-dark-700 text-gray-400 rounded-full px-2 py-0.5 text-xs">
                {inProgressTasks.length}
              </span>
            </h3>
            <div className="space-y-3 min-h-[200px]">
              {inProgressTasks.length > 0 ? (
                inProgressTasks.map((todo) => (
                  <div 
                    key={todo.id} 
                    draggable={!todo.verified}
                    onDragStart={(e) => handleDragStart(e, todo.id)}
                    className={`${!todo.verified ? "cursor-move" : "cursor-not-allowed"} relative`}
                  >
                    <Todo
                      todo={todo}
                      onToggle={onToggle}
                      onDelete={onDelete}
                      onEdit={onEdit}
                      onVerified={onVerified}
                    />
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-gray-300">
                  <p>No in-progress tasks</p>
                </div>
              )}
            </div>
          </div>
        )}
        
        {(statusFilter === 'all' || statusFilter === 'completed') && (
          <div 
            className="bg-dark-800 rounded-lg p-4 border border-dark-600"
            onDrop={(e) => handleDrop(e, 'completed')}
            onDragOver={handleDragOver}
          >
            <h3 className="text-sm uppercase text-gray-500 font-medium mb-3 flex items-center justify-between">
              <span>Completed</span>
              <span className="bg-dark-700 text-gray-400 rounded-full px-2 py-0.5 text-xs">
                {completedTasks.length}
              </span>
            </h3>
            <div className="space-y-3 min-h-[200px]">
              {completedTasks.length > 0 ? (
                completedTasks.map((todo) => (
                  <div 
                    key={todo.id} 
                    draggable={!todo.verified}
                    onDragStart={(e) => handleDragStart(e, todo.id)}
                    className={`${!todo.verified ? "cursor-move" : "cursor-not-allowed"} relative`}
                  >
                    <Todo
                      todo={todo}
                      onToggle={onToggle}
                      onDelete={onDelete}
                      onEdit={onEdit}
                      onVerified={onVerified}
                    />
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-gray-300">
                  <p>No completed tasks</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {todos.length === 0 && (
        <div className="py-8 text-center text-gray-300">
          <p>No tasks found. Add your first task above!</p>
        </div>
      )}
    </div>
  );
} 