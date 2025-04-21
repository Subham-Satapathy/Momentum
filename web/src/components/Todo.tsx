'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Todo as TodoType, Priority, TaskType, TaskStatus } from '../types/todo';
import VerificationModal from './VerificationModal';

interface TodoProps {
  todo: TodoType;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, content: string, description: string, dueDate: string | undefined) => void;
  onVerified: (updatedTask: TodoType) => void;
}

export default function Todo({ todo, onToggle, onDelete, onEdit, onVerified }: TodoProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(todo.content);
  const [editDescription, setEditDescription] = useState(todo.description || '');
  const [editDueDate, setEditDueDate] = useState(todo.dueDate || '');
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [isBrowser, setIsBrowser] = useState(false);

  useEffect(() => {
    setIsBrowser(true);
  }, []);

  const handleEditStart = () => {
    setIsEditing(true);
    setEditContent(todo.content);
    setEditDescription(todo.description || '');
    setEditDueDate(todo.dueDate || '');
  };

  const handleEditSave = () => {
    if (editContent.trim()) {
      onEdit(
        todo.id, 
        editContent, 
        editDescription, 
        editDueDate ? editDueDate : undefined
      );
      setIsEditing(false);
    }
  };

  const handleEditCancel = () => {
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleEditSave();
    } else if (e.key === 'Escape') {
      handleEditCancel();
    }
  };

  const handleCompleteClick = () => {

    if (!todo.completed) {
      onToggle(todo.id);
      return;
    }

    if (todo.completed && !todo.verified) {
      setShowVerificationModal(true);
    }
  };

  const formatDueDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    const isPast = date < now;
    
    const formattedDate = date.toLocaleDateString();
    const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    let displayClass = "text-gray-400";
    let displayText = `${isToday ? 'Today' : formattedDate} at ${formattedTime}`;

    if (isPast) {
      displayClass = todo.completed ? "text-amber-400" : "text-red-400";
      displayText = todo.completed 
        ? `Was due: ${displayText}`
        : `Overdue: ${displayText}`;
    }
    
    return {
      display: displayText,
      className: displayClass,
      isPast
    };
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'high':
        return {
          bg: 'bg-red-500/10',
          text: 'text-red-400',
          border: 'border-red-500/20',
          dot: 'bg-red-500'
        };
      case 'medium':
        return {
          bg: 'bg-yellow-500/10',
          text: 'text-yellow-400',
          border: 'border-yellow-500/20',
          dot: 'bg-yellow-500'
        };
      case 'low':
        return {
          bg: 'bg-green-500/10',
          text: 'text-green-400',
          border: 'border-green-500/20',
          dot: 'bg-green-500'
        };
      default:
        return {
          bg: 'bg-gray-500/10',
          text: 'text-gray-400',
          border: 'border-gray-500/20',
          dot: 'bg-gray-500'
        };
    }
  };

  const getTaskTypeColor = (taskType: TaskType) => {
    switch (taskType) {
      case 'personal':
        return {
          bg: 'bg-blue-500/10',
          text: 'text-blue-400',
          border: 'border-blue-500/20'
        };
      case 'work':
        return {
          bg: 'bg-purple-500/10',
          text: 'text-purple-400',
          border: 'border-purple-500/20'
        };
      case 'study':
        return {
          bg: 'bg-green-500/10',
          text: 'text-green-400',
          border: 'border-green-500/20'
        };
      case 'other':
      default:
        return {
          bg: 'bg-gray-500/10',
          text: 'text-gray-400',
          border: 'border-gray-500/20'
        };
    }
  };

  const priorityStyle = getPriorityColor(todo.priority);
  const taskTypeStyle = getTaskTypeColor(todo.taskType || 'personal');
  const dueInfo = todo.dueDate ? formatDueDate(todo.dueDate) : null;

  const getStatusBadge = (status: TaskStatus) => {

    if (todo.dueDate && !todo.completed) {
      const dueDate = new Date(todo.dueDate);
      const now = new Date();
      if (dueDate < now) {
        return {
          bg: 'bg-red-500/10',
          text: 'text-red-400',
          border: 'border-red-500/20',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-8.414l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 111.414-1.414L9 9.586V6a1 1 0 112 0v3.586z" clipRule="evenodd" />
            </svg>
          ),
          label: 'Overdue'
        };
      }
    }

    switch (status) {
      case 'to-do':
        return {
          bg: 'bg-blue-500/10',
          text: 'text-blue-400',
          border: 'border-blue-500/20',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12z" />
            </svg>
          ),
          label: 'To-Do'
        };
      case 'in-progress':
        return {
          bg: 'bg-yellow-500/10',
          text: 'text-yellow-400',
          border: 'border-yellow-500/20',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 10.24a1 1 0 11-2 0V6a1 1 0 112 0v6.24z" clipRule="evenodd" />
            </svg>
          ),
          label: 'In Progress'
        };
      case 'completed':
        return {
          bg: 'bg-green-500/10',
          text: 'text-green-400',
          border: 'border-green-500/20',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          ),
          label: 'Completed'
        };
      default:
        return {
          bg: 'bg-gray-500/10',
          text: 'text-gray-400',
          border: 'border-gray-500/20',
          icon: null,
          label: status
        };
    }
  };

  const statusStyle = getStatusBadge(todo.status);

  return (
    <div className={`p-4 rounded-lg bg-dark-800 border ${todo.verified ? 'border-accent-500/40 bg-dark-800/90' : 'border-dark-600 hover:border-dark-500'} transition-all duration-200 ${todo.completed ? 'opacity-75' : ''}`}>
      {isEditing ? (
        <div className="flex flex-col gap-3">
          <input
            type="text"
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            placeholder="Task title"
            className="w-full p-2 rounded bg-dark-700 border border-dark-500 focus:outline-none focus:ring-2 focus:ring-accent-400 text-white"
          />
          
          <textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Task description (optional)"
            rows={3}
            className="w-full p-2 rounded bg-dark-700 border border-dark-500 focus:outline-none focus:ring-2 focus:ring-accent-400 text-white placeholder-gray-400 resize-none"
          />
          
          <div>
            <label className="block text-sm text-gray-300 mb-1">Due Date (Optional)</label>
            <input
              type="datetime-local"
              value={editDueDate}
              onChange={(e) => setEditDueDate(e.target.value)}
              className="w-full p-2 rounded bg-dark-700 border border-dark-500 focus:outline-none focus:ring-2 focus:ring-accent-400 text-white text-sm"
            />
          </div>
          
          <div className="flex gap-2 mt-2">
            <button 
              onClick={handleEditSave}
              className="text-sm bg-accent-500 hover:bg-accent-400 text-white px-3 py-1 rounded-md transition-colors"
            >
              Save
            </button>
            <button 
              onClick={handleEditCancel}
              className="text-sm bg-dark-600 hover:bg-dark-500 text-white px-3 py-1 rounded-md transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex items-start gap-3">
            <button
              onClick={handleCompleteClick}
              className={`w-6 h-6 mt-0.5 rounded-full flex-shrink-0 border-2 flex items-center justify-center ${todo.completed ? (todo.verified ? 'bg-accent-500 border-accent-500' : 'bg-green-500 border-green-500') : 'border-dark-500'}`}
              title={todo.verified ? 'Verified on blockchain' : todo.completed ? 'Completed' : 'Mark as complete'}
            >
              {todo.completed && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
            
            <div className="flex-1">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <span 
                    className={`text-base font-medium ${todo.completed ? 'text-gray-400' : 'text-white'}`}
                  >
                    {todo.content}
                  </span>
                </div>
                
                <div className="flex space-x-1">
                  {!todo.verified && (
                    <>
                      <button
                        onClick={handleEditStart}
                        className="p-1.5 rounded-full hover:bg-dark-600 transition-colors"
                        title="Edit"
                        disabled={todo.completed}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${todo.completed ? 'text-gray-500' : 'text-gray-300'}`} viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => onDelete(todo.id)}
                        className="p-1.5 rounded-full hover:bg-dark-600 transition-colors"
                        title="Delete"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </>
                  )}
                  {todo.verified && (
                    <div className="p-1.5" title="Verified on blockchain">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-accent-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
              
              {todo.description && (
                <p className={`mt-2 text-sm ${todo.completed ? 'text-gray-400' : 'text-gray-300'}`}>
                  {todo.description}
                </p>
              )}
              
              <div className="flex flex-wrap items-center gap-2 mt-3 text-xs">
                {}
                <span 
                  className={`px-2 py-0.5 rounded-full ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border} flex items-center font-medium`}
                >
                  {statusStyle.icon}
                  {statusStyle.label}
                </span>
                
                {}
                <span 
                  className={`px-2 py-0.5 rounded-full ${priorityStyle.bg} ${priorityStyle.text} ${priorityStyle.border} flex items-center font-medium group relative`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${priorityStyle.dot} mr-1`}></span>
                  {todo.priority}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1 text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                  
                  <div className="hidden group-hover:block absolute left-0 top-5 z-10 bg-dark-900 border border-indigo-500/30 rounded-md shadow-lg p-2 text-xs text-gray-300 whitespace-nowrap">
                    <p>Priority suggested by AI</p>
                  </div>
                </span>
                
                {todo.taskType && (
                  <span 
                    className={`px-2 py-0.5 rounded-full ${taskTypeStyle.bg} ${taskTypeStyle.text} ${taskTypeStyle.border} flex items-center font-medium`}
                  >
                    {todo.taskType}
                  </span>
                )}
                
                {dueInfo && (
                  <span 
                    className={`px-2 py-0.5 rounded-full bg-dark-700 flex items-center ${dueInfo.className} font-medium`}
                    title={dueInfo.isPast ? "Overdue" : "Due date"}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    {dueInfo.display}
                  </span>
                )}
                
                {}
                {todo.tags && todo.tags.length > 0 && (
                  <div className="flex flex-col w-full mt-2 mb-1">
                    <div className="flex items-center space-x-1.5 mb-1 group relative">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                      </svg>
                      <span className="text-indigo-400 font-medium">AI Tips</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {todo.tags
                        .filter(tag => tag !== todo.taskType)
                        .map((tag, index) => (
                        <div 
                          key={index}
                          className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium flex items-center"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1.5 text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                          </svg>
                          {tag}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <span className="text-gray-300">
                  Created: {new Date(todo.createdAt).toLocaleDateString()}
                </span>
                
                {todo.completedAt && (
                  <span className="text-gray-300">
                    Completed: {new Date(todo.completedAt).toLocaleDateString()}
                  </span>
                )}
                
                {todo.verified && todo.txHash && (
                  <a
                    href={`https://sepolia.etherscan.io/tx/${todo.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent-400 hover:underline font-medium"
                    title="View transaction on blockchain"
                  >
                    View TX
                  </a>
                )}
                
                {todo.verified && todo.taskHash && (
                  <span className="text-gray-300 cursor-help" title={`Task Hash: ${todo.taskHash}`}>
                    Hash: {todo.taskHash.substring(0, 6)}...{todo.taskHash.substring(todo.taskHash.length - 4)}
                  </span>
                )}
              </div>
              
              {todo.completed && !todo.verified && (
                <div className="mt-3">
                  <button 
                    onClick={() => setShowVerificationModal(true)}
                    className="text-xs bg-accent-500 hover:bg-accent-400 text-white px-3 py-1 rounded-md transition-colors flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Verify on Chain
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {showVerificationModal && isBrowser && createPortal(
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
          <div className="relative max-w-md w-full">
            <VerificationModal 
              task={todo} 
              onClose={() => setShowVerificationModal(false)}
              onVerified={onVerified}
            />
          </div>
        </div>,
        document.body
      )}
    </div>
  );
} 