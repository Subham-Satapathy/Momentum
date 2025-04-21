import { TaskStatus } from '../types/todo';

/**
 * Maps application TaskStatus values to GraphQL enum values
 */
export const mapTaskStatusToGraphQL = (status: TaskStatus): string => {
  switch (status) {
    case 'to-do':
      return 'to_do';
    case 'in-progress':
      return 'in_progress';
    case 'completed':
      return 'completed';
    default:
      return status as string;
  }
};

/**
 * Maps GraphQL TaskStatus enum values to application values
 */
export const mapGraphQLToTaskStatus = (status: string): TaskStatus => {
  switch (status) {
    case 'to_do':
      return 'to-do';
    case 'in_progress':
      return 'in-progress';
    case 'completed':
      return 'completed';
    default:
      return status as TaskStatus;
  }
};

/**
 * Transforms task data from API to application format
 */
export const transformTaskFromGraphQL = (task: any) => {
  if (!task) return null;
  
  return {
    ...task,
    status: mapGraphQLToTaskStatus(task.status),
  };
};

/**
 * Transforms task data from application to API format
 */
export const transformTaskToGraphQL = (task: any) => {
  if (!task) return null;
  
  return {
    ...task,
    status: task.status ? mapTaskStatusToGraphQL(task.status) : undefined,
  };
}; 