'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function JobsPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the job search page by default
    router.push('/jobs/search');
  }, [router]);

  return null;
} 