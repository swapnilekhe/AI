import React from 'react';
import UserForm from '../components/UserForm';

export default function Home() {
  const handleSubmit = (user) => {
    console.log('User submitted', user);
  };

  return (
    <main>
      <h1>Home</h1>
      <UserForm onSubmit={handleSubmit} />
    </main>
  );
}
