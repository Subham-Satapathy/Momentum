'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import TodoList from '../../components/TodoList';
import KanbanBoard from '../../components/KanbanBoard';
import TaskModal from '../../components/TaskModal';
import { Todo, TaskStatus } from '../../types/todo';
import { useWallet } from '../../contexts/WalletContext';
import { getTasks, loginUser, deleteTask, updateTask } from '../../services/api';
import { setToken } from '../../services/auth';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const router = useRouter();
  const { isConnected, address } = useWallet();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [verifiedTaskCount, setVerifiedTaskCount] = useState(0);
  const [isDesktop, setIsDesktop] = useState(true);

  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  const fetchVerifiedTaskCount = useCallback(async () => {
    try {
      const tasks = await getTasks();
      const verifiedTasksCount = tasks.filter(task => task.verified && task.userAddress === address);
      setVerifiedTaskCount(verifiedTasksCount.length);
    } catch (error) {
      console.error('Error fetching verified task count:', error);
    }
  }, [address]);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    
    // Initial check
    checkScreenSize();
    
    // Set up listener for resize events
    window.addEventListener('resize', checkScreenSize);
    
    // Clean up
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {

    setIsLoading(true);

    if (isConnected && address) {

      loginUser(address)
        .then(token => {

          setToken(token);

          return fetchTasks();
        })
        .then(() => {
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
  }, [isConnected, address, fetchVerifiedTaskCount]);

  useEffect(() => {

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

  const addTodo = (newTodo: Todo) => {
    setTodos(prev => [...prev, newTodo]);
    toast.success('Task created successfully!');
  };

  const toggleTodo = async (id: string) => {
    try {

      const todo = todos.find(todo => todo.id === id);
      if (!todo) return;

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

      await updateTask(id, { 
        completed: !todo.completed,
        completedAt: !todo.completed ? new Date().toISOString() : undefined,
        status: !todo.completed ? 'completed' : 'in-progress'
      });

      toast.success(todo.completed ? 'Task marked as active' : 'Task completed!');
    } catch (error) {
      console.error('Error toggling task completion:', error);
      toast.error('Failed to update task status. Please try again.');

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

      setTodos(
        todos.map((todo) =>
          todo.id === id ? {
            ...todo,
            status,

            completed: status === 'completed' ? true : false,
            completedAt: status === 'completed' ? new Date().toISOString() : undefined
          } : todo
        )
      );

      const updatedTask = await updateTask(id, { 
        status,
        completed: status === 'completed' ? true : false,
        completedAt: status === 'completed' ? new Date().toISOString() : undefined
      });

      toast.success(`Task moved to ${status}`);
      
      return updatedTask;
    } catch (error) {
      console.error('Error updating task status:', error);
      toast.error('Failed to update task status. Please try again.');

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

  if (!isDesktop) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative w-full max-w-md backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 text-center shadow-2xl overflow-hidden"
        >
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-purple-600 rounded-full filter blur-[80px] opacity-30"></div>
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-pink-600 rounded-full filter blur-[80px] opacity-30"></div>
          
          <div className="relative">
            <div className="w-24 h-24 mx-auto mb-6 relative">
              <svg viewBox="0 0 200 200" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <path 
                  fill="rgba(255, 255, 255, 0.1)" 
                  d="M45.7,-51.9C59.5,-41,71.3,-26.2,74.8,-9.4C78.3,7.5,73.5,26.3,62.4,40.2C51.2,54.2,33.7,63.2,14.8,68.5C-4.1,73.7,-24.4,75.2,-39.3,66.5C-54.2,57.8,-63.5,39,-69.9,18.5C-76.3,-2,-79.7,-24.2,-71.3,-39.7C-62.9,-55.2,-42.7,-64,-24.2,-68C-5.7,-72,18,-71.1,34.7,-63.3C51.5,-55.5,61.3,-40.7,45.7,-51.9Z" 
                  transform="translate(100 100)" 
                  className="animate-[blob_8s_ease-in-out_infinite]"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-3">Desktop Experience Only</h2>
            <p className="text-gray-300 mb-8">
              Momentum currently provides the best experience on larger screens. Please switch to a desktop device to access all features.
            </p>
            
            <motion.div 
              className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-8"
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.5, delay: 0.5 }}
            >
              <div className="h-full w-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-full animate-pulse"></div>
            </motion.div>
            
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[1, 2, 3].map((i) => (
                <motion.div 
                  key={i}
                  className="aspect-square rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 flex items-center justify-center"
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 * i }}
                >
                  <div className="w-10 h-10 bg-white/10 rounded-xl"></div>
                </motion.div>
              ))}
            </div>
            
            <p className="text-white/70 text-sm">
              We're working on mobile support. <br />
              Check back soon!
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-6 bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 overflow-hidden relative">
      {}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-20 left-10 w-64 h-64 bg-pink-500 rounded-full filter blur-[120px] opacity-20"></div>
        <div className="absolute bottom-40 right-10 w-72 h-72 bg-blue-500 rounded-full filter blur-[120px] opacity-20"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600 rounded-full filter blur-[140px] opacity-20"></div>
      </div>

      <div className="max-w-7xl mx-auto">

        {}
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

        {}
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

        {}
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