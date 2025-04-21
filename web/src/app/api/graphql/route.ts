import { NextRequest, NextResponse } from 'next/server';
import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { typeDefs } from '../../../graphql/schema';
import { resolvers } from '../../../graphql/resolvers';
import { createContext } from '../../../graphql/context';

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

const server = new ApolloServer({
  schema,
});

const handler = startServerAndCreateNextHandler(server, {
  context: async (req: NextRequest) => createContext({ req }),
});

export async function POST(req: NextRequest) {
  return handler(req);
}

// Add support for Apollo Sandbox in development
export async function GET(_req: NextRequest) {
  return NextResponse.json(
    {
      message: "Apollo Server is running. Use POST for GraphQL queries."
    },
    { status: 200 }
  );
} 