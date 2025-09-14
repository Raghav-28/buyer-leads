'use client';
import { useState } from 'react';

export default function TestCreateBuyer() {
  const [result, setResult] = useState('');

  const handleClick = async () => {
    const res = await fetch('/api/buyers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Akash Gupta',
        email: 'akashv@example.com',
        phone: '9875543210',
        city: 'Mohali',
        propertyType: 'Apartment',
        bhk: 'Two',
        purpose: 'Buy',
        budgetMin: 5000000,
        budgetMax: 7000000,
        timeline: 'M0_3m',
        source: 'Website',
        status: 'New',
        notes: 'Looking for investment property',
        tags: ['priority', 'hot-lead']
      }),
    });
    const data = await res.json();
    setResult(JSON.stringify(data, null, 2));
  };

  return (
    <div>
      <button onClick={handleClick}>Create Buyer</button>
      <pre>{result}</pre>
    </div>
  );
}
