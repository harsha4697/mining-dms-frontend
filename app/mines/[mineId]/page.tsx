'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation'; // Using the hook for params

// Import UI Components
import { DataTable } from '@/components/DataTable';
import UploadForm from '@/components/UploadForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

// Define interfaces for our data structures
interface Mine {
  id: string;
  name: string;
  location: string | null;
}

interface Document {
  id: string;
  document_name: string;
  expiry_date: string | null;
  uploaded_at: string;
}

// The component no longer needs to receive 'params' as a prop
export default function MineDetailPage() {
  // Get route parameters using the useParams hook
  const params = useParams();
  const mineId = params.mineId as string; // Assert type to string
  
  const router = useRouter();

  // State management for the page
  const [mine, setMine] = useState<Mine | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingDocId, setDownloadingDocId] = useState<string | null>(null);

  // A memoized function to fetch all necessary data for the page.
  // useCallback prevents this function from being recreated on every render.
  const fetchData = useCallback(async () => {
    // Don't set loading to true on refreshes, only on the initial load.
    try {
      // Fetch both mine details and its documents in parallel for efficiency.
      const [mineRes, docsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/mines/${mineId}`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/mines/${mineId}/documents`),
      ]);

      if (!mineRes.ok) throw new Error(`Failed to fetch mine details (Status: ${mineRes.status})`);
      if (!docsRes.ok) throw new Error(`Failed to fetch documents (Status: ${docsRes.status})`);

      const mineData = await mineRes.json();
      const docsData = await docsRes.json();

      setMine(mineData);
      setDocuments(docsData);
      setError(null); // Clear any previous errors on a successful fetch.
    } catch (err: any) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false); // Stop loading indicator regardless of outcome.
    }
  }, [mineId]); // The dependency array ensures this function only changes if mineId changes.

  // useEffect hook to run the initial data fetch when the component first mounts.
  useEffect(() => {
    if (mineId) {
        setLoading(true);
        fetchData();
    }
  }, [mineId, fetchData]);

  // Function to handle the download button click.
  const handleDownload = async (docId: string) => {
    setDownloadingDocId(docId);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/documents/${docId}/download-url`);
      if (!res.ok) throw new Error('Failed to get download link');
      
      const { download_url } = await res.json();
      
      // Open the secure link in a new tab to trigger the download.
      window.open(download_url, '_blank');
      
    } catch (err) {
      alert('Could not download file. Please try again.');
      console.error(err);
    } finally {
      setDownloadingDocId(null);
    }
  };

  // Conditional rendering for loading and error states.
  if (loading) return <div className="p-8 text-center text-gray-500">Loading Mine Details...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="container mx-auto p-4 sm:p-8">
      <Button variant="outline" onClick={() => router.push('/mines')} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to All Mines
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{mine?.name}</h1>
        <p className="text-lg text-muted-foreground mt-1">{mine?.location}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Document List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader><CardTitle>Documents</CardTitle></CardHeader>
            <CardContent>
              <DataTable 
                documents={documents} 
                onDownload={handleDownload} 
                downloadingDocId={downloadingDocId} 
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Upload Form */}
        <div>
          <Card>
            <CardHeader><CardTitle>Upload New Document</CardTitle></CardHeader>
            <CardContent>
              {/* Pass the stable fetchData function directly as the prop */}
              <UploadForm mineId={mineId} onUploadSuccess={fetchData} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}