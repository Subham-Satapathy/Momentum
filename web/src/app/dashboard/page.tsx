'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import TodoList from '../../components/TodoList';
import KanbanBoard from '../../components/KanbanBoard';
import TodoStats from '../../components/TodoStats';
import TaskModal from '../../components/TaskModal';
import { Todo, Priority, TaskStatus } from '../../types/todo';
import { useWallet } from '../../contexts/WalletContext';
import { getTasks, loginUser, deleteTask, updateTask } from '../../services/api';
import { setToken } from '../../services/auth';
import { getTaskCount } from '../../services/blockchain';
import { ethers } from 'ethers';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const router = useRouter();
  const { isConnected, address } = useWallet();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [verifiedTaskCount, setVerifiedTaskCount] = useState(0);
  // View toggle state
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  // Modal state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  useEffect(() => {
    // Check if user is connected to wallet
    setIsLoading(true);
    
    // If user is connected, get a real JWT token from the backend
    if (isConnected && address) {
      // Get JWT token from backend and store it
      loginUser(address)
        .then(token => {
          // Store the JWT token in localStorage
          setToken(token);
          
          // Fetch tasks from API
          return fetchTasks();
        })
        .then(() => {
          // Get verified task count from blockchain
          return fetchVerifiedTaskCount();
        })
        .catch(error => {
          console.error('Authentication error:', error);
          toast.error('Failed to authenticate. Please try again.');
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, [isConnected, address]);

  useEffect(() => {
    // Redirect to home if not connected
    if (!isLoading && !isConnected) {
      router.push('/');
    }
  }, [isLoading, isConnected, router]);

  const fetchTasks = async () => {
    try {
      const taskData = await getTasks();
      setTodos(taskData);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to load tasks. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchVerifiedTaskCount = async () => {
    if (!address) return;
    
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const count = await getTaskCount(address, provider);
        setVerifiedTaskCount(count);
      }
    } catch (error) {
      console.error('Error fetching verified task count:', error);
    }
  };

  const addTodo = (newTodo: Todo) => {
    setTodos(prev => [...prev, newTodo]);
    toast.success('Task created successfully!');
  };

  const toggleTodo = async (id: string) => {
    try {
      // Find the current todo to toggle
      const todo = todos.find(todo => todo.id === id);
      if (!todo) return;
      
      // Update UI state optimistically
      setTodos(
        todos.map((todo) =>
          todo.id === id ? { 
            ...todo, 
            completed: !todo.completed, 
            completedAt: !todo.completed ? new Date().toISOString() : undefined,
            status: !todo.completed ? 'completed' : 'in-progress',
            verified: todo.verified && !todo.completed ? false : todo.verified
          } : todo
        )
      );
      
      // Now update in the database
      await updateTask(id, { 
        completed: !todo.completed,
        completedAt: !todo.completed ? new Date().toISOString() : undefined,
        status: !todo.completed ? 'completed' : 'in-progress'
      });
      
      // Success toast
      toast.success(todo.completed ? 'Task marked as active' : 'Task completed!');
    } catch (error) {
      console.error('Error toggling task completion:', error);
      toast.error('Failed to update task status. Please try again.');
      // Revert the UI state if the API call failed
      fetchTasks();
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      await deleteTask(id);
      setTodos(todos.filter((todo) => todo.id !== id));
      toast.success('Task deleted successfully!');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task. Please try again.');
    }
  };

  const editTodo = (id: string, content: string, description: string, dueDate: string | undefined) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { 
          ...todo, 
          content,
          description: description.trim() || undefined,
          dueDate 
        } : todo
      )
    );
  };

  const updateTodoStatus = async (id: string, status: TaskStatus) => {
    try {
      const todo = todos.find(todo => todo.id === id);
      if (!todo) return;

      // Update UI state optimistically
      setTodos(
        todos.map((todo) =>
          todo.id === id ? {
            ...todo,
            status,
            // Also update completed status if necessary
            completed: status === 'completed' ? true : false,
            completedAt: status === 'completed' ? new Date().toISOString() : undefined
          } : todo
        )
      );
      
      // Now update in the database - make sure this completes
      const updatedTask = await updateTask(id, { 
        status,
        completed: status === 'completed' ? true : false,
        completedAt: status === 'completed' ? new Date().toISOString() : undefined
      });
      
      // Success toast
      toast.success(`Task moved to ${status}`);
      
      return updatedTask;
    } catch (error) {
      console.error('Error updating task status:', error);
      toast.error('Failed to update task status. Please try again.');
      // Revert the UI state if the API call failed
      fetchTasks();
    }
  };

  const updateVerifiedTask = (updatedTask: Todo) => {
    setTodos(
      todos.map((todo) =>
        todo.id === updatedTask.id ? {
          ...updatedTask,
          verified: updatedTask.completed ? true : false
        } : todo
      )
    );
    fetchTasks();
    fetchVerifiedTaskCount();
    toast.success('Task verified on blockchain successfully!', {
      icon: '🎉',
      duration: 5000
    });
  };

  const completedCount = todos.filter(todo => todo.completed).length;
  const verifiedCount = todos.filter(todo => todo.verified).length;
  const totalCount = todos.length;
  const completionPercentage = totalCount > 0 
    ? Math.round((completedCount / totalCount) * 100) 
    : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-purple-500 border-t-transparent border-b-transparent rounded-full animate-spin mx-auto mb-5"></div>
          <p className="text-purple-300 text-lg">Syncing your blockchain data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-6 bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 overflow-hidden relative">
      {/* Background decoration elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-20 left-10 w-64 h-64 bg-pink-500 rounded-full filter blur-[120px] opacity-20"></div>
        <div className="absolute bottom-40 right-10 w-72 h-72 bg-blue-500 rounded-full filter blur-[120px] opacity-20"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600 rounded-full filter blur-[140px] opacity-20"></div>
      </div>

      <div className="max-w-7xl mx-auto">

        {/* Stats Cards */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-2xl p-6 shadow-lg flex flex-col relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-500/20 rounded-full"></div>
            <h3 className="text-gray-400 text-sm mb-1">Total Tasks</h3>
            <p className="text-4xl font-bold text-white">{totalCount}</p>
            <div className="mt-auto pt-3">
              <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                  style={{ width: '100%' }}
                ></div>
              </div>
            </div>
          </div>
          
          <div className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-2xl p-6 shadow-lg flex flex-col relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/20 rounded-full"></div>
            <h3 className="text-gray-400 text-sm mb-1">Completed</h3>
            <p className="text-4xl font-bold text-white">{completedCount}</p>
            <div className="mt-auto pt-3">
              <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
                  style={{ width: `${completionPercentage}%` }}
                ></div>
              </div>
              <p className="text-right text-xs text-gray-400 mt-1">{completionPercentage}%</p>
            </div>
          </div>
          
          <div className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-2xl p-6 shadow-lg flex flex-col relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-green-500/20 rounded-full"></div>
            <h3 className="text-gray-400 text-sm mb-1">Verified on Chain</h3>
            <p className="text-4xl font-bold text-white">{verifiedCount}</p>
            <div className="mt-auto pt-3">
              <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full"
                  style={{ width: completedCount > 0 ? `${(verifiedCount / completedCount) * 100}%` : '0%' }}
                ></div>
              </div>
              <p className="text-right text-xs text-gray-400 mt-1">
                {completedCount > 0 ? Math.round((verifiedCount / completedCount) * 100) : 0}% of completed
              </p>
            </div>
          </div>
        </motion.div>

        {/* View Toggle */}
        <motion.div 
          className="mb-8 flex justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="inline-flex p-1 backdrop-blur-lg bg-white/5 border border-white/10 rounded-xl">
            <button
              onClick={() => setViewMode('list')}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                viewMode === 'list' 
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/20'
                  : 'text-gray-300'
              }`}
            >
              List View
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                viewMode === 'kanban' 
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/20'
                  : 'text-gray-300'
              }`}
            >
              Kanban Board
            </button>
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.div 
          className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {viewMode === 'list' ? (
            <>
              {todos.length > 0 ? (
                <TodoList
                  todos={todos}
                  onToggle={toggleTodo}
                  onDelete={deleteTodo}
                  onEdit={editTodo}
                  onVerified={updateVerifiedTask}
                />
              ) : (
                <div className="py-16 text-center">
                  <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-medium text-white mb-3">No tasks found</h3>
                  <p className="text-gray-400 mb-6 max-w-md mx-auto">Your task list is empty. Create your first task to get started on your productivity journey.</p>
                  <motion.button
                    onClick={() => setIsTaskModalOpen(true)}
                    className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl text-white font-medium inline-flex items-center shadow-lg shadow-purple-600/20"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Create First Task
                  </motion.button>
                </div>
              )}
            </>
          ) : (
            <>
              {todos.length > 0 ? (
                <KanbanBoard
                  todos={todos}
                  onToggle={toggleTodo}
                  onDelete={deleteTodo}
                  onEdit={editTodo}
                  onVerified={updateVerifiedTask}
                  onStatusUpdate={updateTodoStatus}
                />
              ) : (
                <div className="py-16 text-center">
                  <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-medium text-white mb-3">Your kanban board is empty</h3>
                  <p className="text-gray-400 mb-6 max-w-md mx-auto">Create tasks to start organizing your workflow in this visual kanban board.</p>
                  <motion.button
                    onClick={() => setIsTaskModalOpen(true)}
                    className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl text-white font-medium inline-flex items-center shadow-lg shadow-purple-600/20"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Create First Task
                  </motion.button>
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onAddTodo={addTodo}
      />
    </div>
  );
} 