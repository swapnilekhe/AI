import React, { useState } from 'react';

export default function UserForm({ onSubmit }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({ name, email, addressLine1, city, state, postalCode });
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Name
        <input value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <label>
        Email
        <input value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>
      <label>
        Address Line 1
        <input value={addressLine1} onChange={(e) => setAddressLine1(e.target.value)} />
      </label>
      <label>
        City
        <input value={city} onChange={(e) => setCity(e.target.value)} />
      </label>
      <label>
        State
        <input value={state} onChange={(e) => setState(e.target.value)} />
      </label>
      <label>
        Postal Code
        <input value={postalCode} onChange={(e) => setPostalCode(e.target.value)} />
      </label>
      <button type="submit">Submit</button>
    </form>
  );
}
