'use client'; 

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { fetchWithAuth } from '@/lib/api'; // <-- Import the new wrapper
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

// Define the data structure for a mine
interface Mine {
  id: string;
  name: string;
  location: string | null;
  lease_number: string | null;
  created_at: string;
  updated_at: string;
}

export default function MinesPage() {
  const { session, loading: authLoading } = useAuth();
  const router = useRouter();

  const [mines, setMines] = useState<Mine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!session) {
        router.push('/login');
      } else {
        const fetchMines = async () => {
          try {
            // --- UPDATED: Use the new fetchWithAuth wrapper ---
            const response = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/mines/`);
            
            if (!response.ok) {
              // Handle auth errors specifically
              if (response.status === 401) {
                // Token might be expired, redirect to login
                router.push('/login');
                return;
              }
              throw new Error(`Failed to fetch mines (Status: ${response.status})`);
            }
            
            const data: Mine[] = await response.json();
            setMines(data);
          } catch (e: any) {
            setError(e.message);
            console.error("Failed to fetch mines:", e);
          } finally {
            setLoading(false);
          }
        };
        fetchMines();
      }
    }
  }, [session, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-80px)]">
        <p className="text-lg text-gray-500">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-8 text-center">
        <p className="text-lg text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Mines Overview</h1>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {mines.length > 0 ? (
          mines.map((mine) => (
            <Link key={mine.id} href={`/mines/${mine.id}`} className="block group">
              <Card className="h-full group-hover:border-primary transition-colors">
                <CardHeader>
                  <CardTitle className="truncate">{mine.name}</CardTitle>
                  <CardDescription>{mine.location || 'Location not specified'}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))
        ) : (
          <div className="col-span-full text-center py-12 px-4 border-2 border-dashed border-gray-300 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900">No Mines Found</h3>
          </div>
        )}
      </div>
    </div>
  );
}