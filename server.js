const {
  ApolloServer,
  gql,
  PubSub,
} = require('apollo-server');

const pubsub = new PubSub();
const MESSAGE_ADDED = 'MESSAGE_ADDED';

const messages = [
  {
    "author": "John",
    "content": "Howdy",
    "timeStamp": "2020-05-16T17:27:18.747Z",
  },
  {
    "author": "Marta",
    "content": "Great",
    "timeStamp": "2020-05-16T17:28:21.316Z",
  }
];

const server = new ApolloServer({
  typeDefs: gql`
    type Message {
      author: String!
      content: String!
      timeStamp: String!
    }
    
    type Query {
      messages: [Message]!
    }

    type Mutation {
      addMessage(author: String, content: String): Message!
    }

    type Subscription {
      messageAdded: Message
    }
  `,
  resolvers: {
    Query: { messages: () => messages },
    Mutation: {
      addMessage: (_root, args) => {
        const message = { ...args, timeStamp: (new Date()).toISOString() }
        messages.push(message);
        pubsub.publish(MESSAGE_ADDED, { messageAdded: message });
        return message;
      }
    },
    Subscription: {
      messageAdded: { subscribe: () => pubsub.asyncIterator(MESSAGE_ADDED) },
    },
  }
});

server.listen().then(({ url }) => console.log(`🚀 Server ready at ${url}`));