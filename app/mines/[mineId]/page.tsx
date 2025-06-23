'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchWithAuth } from '@/lib/api'; // <-- Import the new wrapper

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

export default function MineDetailPage() {
  const params = useParams();
  const mineId = params.mineId as string;
  const router = useRouter();

  const [mine, setMine] = useState<Mine | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingDocId, setDownloadingDocId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      // --- UPDATED: Use fetchWithAuth for parallel requests ---
      const [mineRes, docsRes] = await Promise.all([
        fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/mines/${mineId}`),
        fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/mines/${mineId}/documents`),
      ]);

      if (!mineRes.ok || !docsRes.ok) {
        if (mineRes.status === 401 || docsRes.status === 401) {
            router.push('/login');
            return;
        }
        throw new Error('Failed to fetch page data.');
      }
      
      const mineData = await mineRes.json();
      const docsData = await docsRes.json();

      setMine(mineData);
      setDocuments(docsData);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [mineId, router]);

  useEffect(() => {
    if (mineId) {
        setLoading(true);
        fetchData();
    }
  }, [mineId, fetchData]);

  const handleDownload = async (docId: string) => {
    setDownloadingDocId(docId);
    try {
      // --- UPDATED: Use fetchWithAuth for download URL ---
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/documents/${docId}/download-url`);
      if (!res.ok) throw new Error('Failed to get download link');
      const { download_url } = await res.json();
      window.open(download_url, '_blank');
    } catch (err) {
      alert('Could not download file.');
    } finally {
      setDownloadingDocId(null);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
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
        <div>
          <Card>
            <CardHeader><CardTitle>Upload New Document</CardTitle></CardHeader>
            <CardContent>
              <UploadForm mineId={mineId} onUploadSuccess={fetchData} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}