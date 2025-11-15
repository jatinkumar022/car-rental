'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Loader from '@/components/Loader';

export default function MyAccountPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to my-cars page
    router.replace('/my-cars');
  }, [router]);

  return (
    <div className="container mx-auto px-4 py-8">
      <Loader fullHeight text="Redirecting..." />
    </div>
  );
}
