import { Priority, Todo } from '../types/todo';

// AI task analysis function
export const analyzeTaskWithAI = (task: {
  content: string;
  description?: string;
  dueDate?: string;
  priority?: Priority;
}) => {
  const taskWords = (task.content + ' ' + (task.description || '')).toLowerCase();
  let suggestedPriority: Priority = task.priority || 'medium';
  const tips: string[] = [];
  
  // Simple keyword-based priority adjustment
  if (taskWords.includes('urgent') || taskWords.includes('asap') || taskWords.includes('immediate') || 
      taskWords.includes('critical') || taskWords.includes('emergency')) {
    suggestedPriority = 'high';
    tips.push('Urgent');
  } else if (taskWords.includes('soon') || taskWords.includes('important') || 
             taskWords.includes('this week') || taskWords.includes('needed')) {
    suggestedPriority = 'medium';
    tips.push('Important');
  }
  
  // Deadline-based priority
  if (task.dueDate) {
    const dueDate = new Date(task.dueDate);
    const now = new Date();
    const daysDiff = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff <= 1) {
      suggestedPriority = 'high';
      tips.push('Due very soon');
    } else if (daysDiff <= 3 && suggestedPriority !== 'high') {
      suggestedPriority = 'medium';
      tips.push('Due soon');
    }
  }
  
  return {
    suggestedPriority,
    tips: tips.length > 0 ? tips : undefined,
    reasoning: generateReasoning(suggestedPriority, tips)
  };
};

// Legacy function for backward compatibility
export async function analyzePriority(
  taskContent: string,
  taskDescription: string
): Promise<{ priority: Priority; reasoning: string }> {
  const result = analyzeTaskWithAI({
    content: taskContent,
    description: taskDescription
  });
  
  return { 
    priority: result.suggestedPriority,
    reasoning: result.reasoning || ''
  };
}

// Helper function to generate reasoning
function generateReasoning(priority: Priority, tips: string[] = []): string {
  if (tips.length === 0) {
    return 'This task appears to be a routine task without urgent language.';
  }
  
  return `This task appears to be ${priority} priority because: ${tips.join(', ')}.`;
} 