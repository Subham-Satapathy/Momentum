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
    
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    const isTomorrow = tomorrow.toDateString() === date.toDateString();
    
    const isPast = date < new Date();
    
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = monthNames[date.getMonth()];
    const day = date.getDate();
    const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    let displayClass = "text-gray-300";
    let displayText = "";
    
    if (isToday) {
      displayText = `Today, ${formattedTime}`;
    } else if (isTomorrow) {
      displayText = `Tomorrow, ${formattedTime}`;
    } else {
      displayText = `${month} ${day}, ${formattedTime}`;
    }
    
    if (isPast) {
      displayClass = todo.completed ? "text-amber-300" : "text-red-300";
      displayText = todo.completed 
        ? `Due: ${displayText}`
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
    <div className={`p-3 sm:p-4 rounded-lg bg-dark-800 border ${todo.verified ? 'border-accent-500/40 bg-dark-800/90' : 'border-dark-600 hover:border-dark-500'} transition-all duration-200 ${todo.completed ? 'opacity-75' : ''}`}>
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
          <div className="flex items-start gap-2 sm:gap-3">
            <button
              onClick={handleCompleteClick}
              className={`w-5 sm:w-6 h-5 sm:h-6 mt-0.5 rounded-full flex-shrink-0 border-2 flex items-center justify-center ${todo.completed ? (todo.verified ? 'bg-accent-500 border-accent-500' : 'bg-green-500 border-green-500') : 'border-dark-500'}`}
              title={todo.verified ? 'Verified on blockchain' : todo.completed ? 'Completed' : 'Mark as complete'}
            >
              {todo.completed && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 sm:h-4 w-3 sm:w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-1 sm:gap-2">
                <div className="flex-1 break-words">
                  <span 
                    className={`text-sm sm:text-base font-medium ${todo.completed ? 'text-gray-400' : 'text-white'}`}
                  >
                    {todo.content}
                    <span className="ml-2 px-1.5 py-0.5 text-xs rounded-md bg-dark-700 text-gray-400 border border-dark-500 inline-flex items-center">
                      #{todo.taskHash?.substring(0, 8)}
                    </span>
                  </span>
                </div>
                
                <div className="flex space-x-1 flex-shrink-0">
                  {!todo.verified && (
                    <>
                      <button
                        onClick={handleEditStart}
                        className="p-1 sm:p-1.5 rounded-full hover:bg-dark-600 transition-colors"
                        title="Edit"
                        disabled={todo.completed}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-3.5 sm:h-4 w-3.5 sm:w-4 ${todo.completed ? 'text-gray-500' : 'text-gray-300'}`} viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => onDelete(todo.id)}
                        className="p-1 sm:p-1.5 rounded-full hover:bg-dark-600 transition-colors"
                        title="Delete"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 sm:h-4 w-3.5 sm:w-4 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </>
                  )}
                  {todo.verified && (
                    <div className="p-1 sm:p-1.5" title="Verified on blockchain">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 sm:h-4 w-3.5 sm:w-4 text-accent-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
              
              {todo.description && (
                <p className={`mt-1.5 sm:mt-2 text-xs sm:text-sm ${todo.completed ? 'text-gray-400' : 'text-gray-300'}`}>
                  {todo.description}
                </p>
              )}
              
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-2 sm:mt-3 text-xs">
                <div className={`px-2 py-0.5 rounded-full flex items-center ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                  {statusStyle.icon}
                  <span className="text-xs">{statusStyle.label}</span>
                </div>
                
                <div className={`px-2 py-0.5 rounded-full flex items-center ${priorityStyle.bg} ${priorityStyle.text} ${priorityStyle.border}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${priorityStyle.dot} mr-1`}></div>
                  <span className="text-xs capitalize">{todo.priority}</span>
                </div>
                
                <div className={`px-2 py-0.5 rounded-full ${taskTypeStyle.bg} ${taskTypeStyle.text} ${taskTypeStyle.border}`}>
                  <span className="text-xs capitalize">{todo.taskType || 'personal'}</span>
                </div>
                
                {dueInfo && (
                  <div className={`px-2 py-1 rounded-md flex items-center bg-gradient-to-r ${dueInfo.isPast ? (todo.completed ? 'from-amber-500/20 to-amber-400/10 border-amber-500/30' : 'from-red-500/20 to-red-400/10 border-red-500/30') : 'from-gray-500/20 to-gray-400/10 border-gray-500/30'} border backdrop-blur-sm`}>
                    <div className="mr-1.5 flex-shrink-0 bg-opacity-30 rounded-sm p-0.5">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                      </svg>
                    </div>
                    <span className="text-xs whitespace-nowrap font-medium">{dueInfo.display}</span>
                  </div>
                )}
                
                {todo.verified && todo.txHash && (
                  <a
                    href={`https://sepolia.etherscan.io/tx/${todo.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2 py-0.5 rounded-full flex items-center bg-gradient-to-r from-accent-400/30 to-accent-500/30 border border-accent-500/40 text-accent-300 hover:from-accent-400/40 hover:to-accent-500/40 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                      <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                    </svg>
                    <span className="text-xs whitespace-nowrap">View Transaction</span>
                  </a>
                )}
              </div>
              
              {todo.completed && !todo.verified && (
                <div className="mt-3 pt-2">
                  <button
                    onClick={() => setShowVerificationModal(true)}
                    className="w-full py-2 mt-1 rounded-md bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-sm flex items-center justify-center gap-2 transition-colors duration-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Verify Task on Blockchain
                  </button>
                </div>
              )}
              
              {todo.tags && todo.tags.length > 0 && (
                <div className="flex flex-col mt-3 pt-2">
                  <div className="flex items-center mb-2">
                    <div className="bg-gradient-to-r from-purple-500/30 to-accent-500/30 p-1.5 rounded-md mr-2 shadow-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-accent-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-1.04Z"></path>
                        <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-1.04Z"></path>
                      </svg>
                    </div>
                    <h4 className="text-xs font-semibold text-white">AI Recommendations</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {todo.tags.map((tag, index) => {
                      const colors = [
                        "from-blue-500/20 to-cyan-400/10 text-blue-300 border-blue-500/30",
                        "from-purple-500/20 to-pink-400/10 text-purple-300 border-purple-500/30",
                        "from-green-500/20 to-emerald-400/10 text-green-300 border-green-500/30",
                        "from-amber-500/20 to-yellow-400/10 text-amber-300 border-amber-500/30",
                        "from-red-500/20 to-rose-400/10 text-red-300 border-red-500/30"
                      ];
                      const colorClass = colors[index % colors.length];
                      
                      return (
                        <div 
                          key={index} 
                          className={`px-2.5 py-1 rounded-md bg-gradient-to-r ${colorClass} border backdrop-blur-sm transition-all duration-200 hover:scale-105 hover:shadow-md`}
                        >
                          <span className="text-xs">{tag}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {isBrowser && showVerificationModal && createPortal(
        <VerificationModal 
          isOpen={showVerificationModal}
          onClose={() => setShowVerificationModal(false)}
          todo={todo}
          onVerified={onVerified}
        />,
        document.body
      )}
    </div>
  );
} 