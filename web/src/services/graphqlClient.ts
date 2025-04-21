/**
 * GraphQL client service for making GraphQL requests to the API
 */

interface GraphQLRequestOptions {
  query: string;
  variables?: Record<string, unknown>;
  authToken?: string;
}

interface GraphQLResponse<T = unknown> {
  data?: T;
  errors?: Array<{
    message: string;
    locations?: Array<{
      line: number;
      column: number;
    }>;
    path?: Array<string | number>;
  }>;
}

/**
 * Sends a GraphQL request to the API
 */
export async function graphqlRequest<T = unknown>({
  query,
  variables,
  authToken,
}: GraphQLRequestOptions): Promise<GraphQLResponse<T>> {
  const endpoint = '/api/graphql';
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  
  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      query,
      variables,
    }),
  });
  
  if (!response.ok) {
    throw new Error(`Network error: ${response.statusText}`);
  }
  
  const responseData: GraphQLResponse<T> = await response.json();
  
  if (responseData.errors?.length) {
    console.error('GraphQL errors:', responseData.errors);
  }
  
  return responseData;
}

/**
 * Common GraphQL queries and mutations
 */
export const Queries = {
  GET_TASKS: `
    query GetTasks {
      getTasks {
        id
        content
        description
        completed
        createdAt
        completedAt
        priority
        dueDate
        tags
        status
        taskType
        verified
        taskHash
        txHash
      }
    }
  `,
  
  GET_TASK: `
    query GetTask($id: ID!) {
      getTask(id: $id) {
        id
        content
        description
        completed
        createdAt
        completedAt
        priority
        dueDate
        tags
        status
        taskType
        verified
        taskHash
        txHash
      }
    }
  `,

  GET_USER_BALANCE: `
    query GetUserBalance {
      getUserBalance
    }
  `,
};

export const Mutations = {
  LOGIN: `
    mutation Login($walletAddress: String!) {
      login(walletAddress: $walletAddress) {
        token
        user {
          address
          tokenBalance
        }
      }
    }
  `,
  
  CREATE_TASK: `
    mutation CreateTask($input: TodoInput!) {
      createTask(input: $input) {
        id
        content
        description
        completed
        createdAt
        priority
        dueDate
        tags
        status
        taskType
        verified
        taskHash
        txHash
      }
    }
  `,
  
  UPDATE_TASK: `
    mutation UpdateTask($input: TodoUpdateInput!) {
      updateTask(input: $input) {
        id
        content
        description
        completed
        createdAt
        completedAt
        priority
        dueDate
        tags
        status
        taskType
        verified
        taskHash
        txHash
      }
    }
  `,
  
  DELETE_TASK: `
    mutation DeleteTask($id: ID!) {
      deleteTask(id: $id)
    }
  `,
  
  COMPLETE_TASK: `
    mutation CompleteTask($id: ID!) {
      completeTask(id: $id) {
        id
        completed
        completedAt
        status
        verified
        txHash
      }
    }
  `,

  UPDATE_USER_TOKEN_BALANCE: `
    mutation UpdateUserTokenBalance($amount: Float!) {
      updateUserTokenBalance(amount: $amount) {
        address
        tokenBalance
      }
    }
  `,
}; 