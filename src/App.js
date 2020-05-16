import React, { useState } from 'react';
import gql from 'graphql-tag';
import {
  useQuery,
  useMutation,
  useSubscription,
} from '@apollo/react-hooks';

const MESSAGES_QUERY = gql`
  query{
    messages{
      author
      content
      timeStamp
    }
  }
`;

const MESSAGE_ADDED_SUBSCRIPTION = gql`
  subscription{
    messageAdded{
      author
      content
      timeStamp
    }
  }
`;

const ADD_MESSAGE_MUTATION = gql`
  mutation($author: String!, $content: String!){
    addMessage(author: $author, content: $content){
      author
      content
      timeStamp
    }
  }
`;

const App = () => {
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');
  const [messages, setMessages] = useState([]);
  const messagesQuery = useQuery(MESSAGES_QUERY, {
    onCompleted: ({ messages }) => setMessages(messages),
  });

  const [sendMessage] = useMutation(ADD_MESSAGE_MUTATION, {
    variables: { author, content },
  });

  useSubscription(MESSAGE_ADDED_SUBSCRIPTION, {
    onSubscriptionData: (res) => {
      const message = res.subscriptionData?.data?.messageAdded;
      setMessages([...messages, message]);
    }
  });

  const submitForm = (e) => {
    e.preventDefault();
    sendMessage();
    setAuthor('');
    setContent('');
  };

  if (messagesQuery.loading) { return <div>Loading...</div>; }
  if (!messages.length) { return <div>No messages yet</div>; }
  
  return (
    <>
      <h1>Apollo Chat</h1>
      Messages:
      {
        messages.map((msg, index) => (
          <div key={index}>
            {`[${msg.timeStamp}] ${msg.author}: ${msg.content}`}
          </div>
        ))
      }
      <hr />
      <form onSubmit={submitForm}>
        <input
          type="text"
          placeholder="Name"
          required
          value={author}
          onChange={e => setAuthor(e.target.value)}
        />
        <br />
        <textarea
          placeholder="Message"
          required
          value={content}
          onChange={e => setContent(e.target.value)}
        />
        <br />
        <button type="submit">
          Send Message
        </button>
      </form>
    </>
  );
}

export default App;
