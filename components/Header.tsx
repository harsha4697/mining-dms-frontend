'use client';

import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { Button } from './ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // <-- THIS IS THE FIX

export default function Header() {
  const { session } = useAuth();
  const router = useRouter(); 

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // After signing out, redirect the user to the login page
    router.push('/login');
    // We can also use router.refresh() if we want to stay on the page but re-run server logic
  };

  return (
    <header className="bg-white border-b sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center p-4">
        <Link href="/" className="text-xl font-bold text-gray-800 hover:text-gray-900 transition-colors">
          Mining DMS
        </Link>
        <div>
          {session ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 hidden sm:inline">{session.user.email}</span>
              <Button onClick={handleLogout} variant="outline" size="sm">
                Logout
              </Button>
            </div>
          ) : (
            <Button asChild size="sm">
              <Link href="/login">Login</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}