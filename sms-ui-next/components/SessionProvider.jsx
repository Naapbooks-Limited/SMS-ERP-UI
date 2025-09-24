"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { initializeSessionRestore } from '@/utilities/sessionUtils';

const SessionProvider = ({ children }) => {
  const router = useRouter();

  useEffect(() => {
    // Initialize session restoration when the app loads
    initializeSessionRestore();

    // Listen for storage changes to sync logout across tabs
    const handleStorageChange = (e) => {
      // If session backup is removed from another tab, it means user logged out
      if (e.key === 'sessionBackup' && e.newValue === null) {
        // Clear sessionStorage in this tab
        sessionStorage.clear();
        // Redirect to login page
        router.push('/');
      }
    };

    // Add event listener for storage changes
    window.addEventListener('storage', handleStorageChange);

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [router]);

  return <>{children}</>;
};

export default SessionProvider;