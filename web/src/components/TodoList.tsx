'use client';

import { Todo as TodoType } from '../types/todo';
import Todo from './Todo';

interface TodoListProps {
  todos: TodoType[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, content: string, description: string, dueDate: string | undefined) => void;
  onVerified: (updatedTask: TodoType) => void;
}

export default function TodoList({ todos, onToggle, onDelete, onEdit, onVerified }: TodoListProps) {
  // Get in-progress tasks
  const inProgressTasks = todos.filter(todo => !todo.completed);
  
  // Get completed but not verified tasks
  const completedTasks = todos.filter(todo => todo.completed && !todo.verified);
  
  // Get verified tasks
  const verifiedTasks = todos.filter(todo => todo.verified);
  
  return (
    <div className="space-y-6">
      {inProgressTasks.length > 0 && (
        <div>
          <h3 className="text-sm uppercase text-gray-500 font-medium mb-2">In Progress</h3>
          <div className="space-y-3">
            {inProgressTasks.map((todo) => (
              <Todo
                key={todo.id}
                todo={todo}
                onToggle={onToggle}
                onDelete={onDelete}
                onEdit={onEdit}
                onVerified={onVerified}
              />
            ))}
          </div>
        </div>
      )}
      
      {completedTasks.length > 0 && (
        <div>
          <h3 className="text-sm uppercase text-gray-500 font-medium mb-2">Completed</h3>
          <div className="space-y-3">
            {completedTasks.map((todo) => (
              <Todo
                key={todo.id}
                todo={todo}
                onToggle={onToggle}
                onDelete={onDelete}
                onEdit={onEdit}
                onVerified={onVerified}
              />
            ))}
          </div>
        </div>
      )}
      
      {verifiedTasks.length > 0 && (
        <div>
          <h3 className="text-sm uppercase text-gray-500 font-medium mb-2">Verified</h3>
          <div className="space-y-3">
            {verifiedTasks.map((todo) => (
              <Todo
                key={todo.id}
                todo={todo}
                onToggle={onToggle}
                onDelete={onDelete}
                onEdit={onEdit}
                onVerified={onVerified}
              />
            ))}
          </div>
        </div>
      )}
      
      {todos.length === 0 && (
        <div className="py-8 text-center text-gray-500">
          <p>No tasks found.</p>
        </div>
      )}
    </div>
  );
} 