// Simple GraphQL demo using Apollo Server that mirrors some of your app's data model.
// This file is optional and can be shown in viva to demonstrate GraphQL schema + resolvers.

import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';

// 1. Define GraphQL schema (types + Query)
const typeDefs = `#graphql
  type User {
    id: ID!
    name: String!
    avatar: String
  }

  type Post {
    id: ID!
    title: String!
    content: String
    author: User!
  }

  type Query {
    posts: [Post!]!
    user(id: ID!): User
  }
`;

// 2. Sample in-memory data (similar to your db.json users/postsApi)
const users = [
  { id: '1', name: 'Alice', avatar: '/avatars/alice.png' },
  { id: '2', name: 'Bob', avatar: '/avatars/bob.png' },
];

const posts = [
  { id: '101', title: 'First Post', content: 'Hello Orrin', authorId: '1' },
  { id: '102', title: 'Second Post', content: 'GraphQL demo post', authorId: '2' },
];

// 3. Resolvers: how each field gets its data
const resolvers = {
  Query: {
    posts: () => posts,
    user: (_, { id }) => users.find((u) => u.id === id) || null,
  },
  Post: {
    author: (post) => users.find((u) => u.id === post.authorId) || null,
  },
};

// 4. Create and start the Apollo GraphQL server
const server = new ApolloServer({ typeDefs, resolvers });

const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
});

console.log(`\n🚀 GraphQL demo server ready at ${url}`);
console.log('Try this query in a GraphQL client or curl:');
console.log(`
query {
  posts {
    id
    title
    content
    author {
      id
      name
      avatar
    }
  }
}
`);
