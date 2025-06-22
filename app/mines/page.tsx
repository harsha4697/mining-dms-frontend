'use client'; 

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

// Define a type for our Mine data to match the backend schema precisely
interface Mine {
  id: string;
  name: string;
  location: string | null;
  lease_number: string | null;
  created_at: string;
  updated_at: string;
}

export default function MinesPage() {
  // State management
  const [mines, setMines] = useState<Mine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // useEffect hook to fetch data when the component mounts
  useEffect(() => {
    const fetchMines = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/mines/`);
        
        if (!response.ok) {
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
  }, []);

  // Conditional rendering for loading state
  if (loading) {
    return (
      <div className="container mx-auto p-8 text-center">
        <p className="text-lg text-gray-500">Loading Mines...</p>
      </div>
    );
  }

  // Conditional rendering for error state
  if (error) {
    return (
      <div className="container mx-auto p-8 text-center">
        <p className="text-lg text-red-500">Error: {error}</p>
        <p className="text-sm text-gray-600 mt-2">Please ensure the backend server is running and accessible.</p>
      </div>
    );
  }

  // Main content render
  return (
    <div className="container mx-auto p-4 sm:p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Mines Overview</h1>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {mines.length > 0 ? (
          mines.map((mine) => (
            // Each card is a link to the dynamic mine detail page
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
            <p className="mt-1 text-sm text-gray-500">
              Please use the API documentation at <a href="http://localhost:8000/docs" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">localhost:8000/docs</a> to add a new mine.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}