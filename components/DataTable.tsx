// frontend/components/DataTable.tsx
'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

// Define the shape of a document object
interface Document {
  id: string;
  document_name: string;
  expiry_date: string | null;
  // We'll add category and authority names later
}

// Define the props the component will accept
interface DataTableProps {
  documents: Document[];
  onDownload: (docId: string) => void;
  downloadingDocId: string | null;
}

// Helper function for date styling
const getExpiryStatus = (expiryDate: string | null) => {
  if (!expiryDate) return { text: 'N/A', className: 'text-gray-500' };
  
  const now = new Date();
  const expiry = new Date(expiryDate);
  const daysDiff = (expiry.getTime() - now.getTime()) / (1000 * 3600 * 24);

  if (daysDiff < 0) return { text: `Expired on ${expiry.toLocaleDateString()}`, className: 'font-bold text-red-600' };
  if (daysDiff <= 30) return { text: `Expires in ${Math.ceil(daysDiff)} days`, className: 'font-semibold text-yellow-600' };
  
  return { text: expiry.toLocaleDateString(), className: 'text-gray-700' };
};

export function DataTable({ documents, onDownload, downloadingDocId }: DataTableProps) {
  return (
    <div className="rounded-md border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-bold">Document Name</TableHead>
            <TableHead className="font-bold">Expiry Status</TableHead>
            <TableHead className="text-right font-bold">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.length > 0 ? (
            documents.map((doc) => {
              const expiry = getExpiryStatus(doc.expiry_date);
              return (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium">{doc.document_name}</TableCell>
                  <TableCell className={expiry.className}>{expiry.text}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDownload(doc.id)}
                      disabled={downloadingDocId === doc.id}
                    >
                      {downloadingDocId === doc.id ? '...' : 'Download'}
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={3} className="h-24 text-center">
                No documents found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}