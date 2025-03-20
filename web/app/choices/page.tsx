"use client"

import React from 'react';
import { useRouter } from 'next/navigation';

const Page = () => {
  const router = useRouter();

  return (
    <div>
      <h1>Hello world</h1>
      <button onClick={() => router.back()}>Back</button>
    </div>
  );
};

export default Page;
