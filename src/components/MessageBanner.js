import React from 'react';

const MessageBanner = ({ message }) => {
  if (!message.text) return null;
  return (
    <div className={`message-banner ${message.type}`}>
      {message.text}
    </div>
  );
};

export default MessageBanner;
