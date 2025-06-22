'use client';

import { useState, FormEvent, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';

// Import shadcn/ui components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from '@/components/ui/date-picker';

// Define types for our dynamic dropdown data
interface SelectOption {
  id: number;
  name: string;
}

// Define the shape of the props this component expects to receive
interface UploadFormProps {
  mineId: string;
  onUploadSuccess: () => void; // Expects a function that takes no arguments and returns nothing
}

export default function UploadForm({ mineId, onUploadSuccess }: UploadFormProps) {
  
  // State management for the form
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // State for our dynamic dropdown data
  const [categories, setCategories] = useState<SelectOption[]>([]);
  const [authorities, setAuthorities] = useState<SelectOption[]>([]);

  // State for our form fields
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [selectedAuthorityId, setSelectedAuthorityId] = useState<string>('');
  const [issueDate, setIssueDate] = useState<Date | undefined>();
  const [expiryDate, setExpiryDate] = useState<Date | undefined>();

  // Fetch categories and authorities from our backend when the component first loads
  useEffect(() => {
    const fetchLookups = async () => {
      try {
        const [catRes, authRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/document-categories/`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/issuing-authorities/`),
        ]);
        const catData = await catRes.json();
        const authData = await authRes.json();
        setCategories(catData);
        setAuthorities(authData);
      } catch (error) {
        console.error("Failed to fetch lookup data", error);
        setStatus("Error: Could not load form options.");
      }
    };
    fetchLookups();
  }, []); // The empty dependency array ensures this runs only once

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file || !selectedCategoryId || !selectedAuthorityId) {
      setStatus('Please fill out all required fields.');
      return;
    }

    setIsUploading(true);
    setStatus('Starting upload...');

    try {
      // 1. Upload the file to Supabase Storage
      const fileExtension = file.name.split('.').pop();
      const filePath = `${mineId}/${uuidv4()}.${fileExtension}`;
      setStatus(`Uploading ${file.name}...`);
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('mine-documents')
        .upload(filePath, file);

      if (uploadError) throw new Error(`Storage Error: ${uploadError.message}`);
      
      setStatus('Saving document details...');

      // 2. Save the metadata to our backend API
      const metadataResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/documents/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          document_name: file.name,
          storage_path: uploadData.path,
          mine_id: mineId,
          category_id: parseInt(selectedCategoryId),
          authority_id: parseInt(selectedAuthorityId),
          issue_date: issueDate ? issueDate.toISOString().split('T')[0] : null,
          expiry_date: expiryDate ? expiryDate.toISOString().split('T')[0] : null,
          original_filename: file.name,
          file_type: file.type,
          file_size_bytes: file.size,
        }),
      });

      if (!metadataResponse.ok) {
        const errorBody = await metadataResponse.json();
        throw new Error(`API Error: ${JSON.stringify(errorBody.detail)}`);
      }

      setStatus('Document saved successfully! ✅');
      
      // 3. Call the callback function passed from the parent to trigger a data refresh
      onUploadSuccess();

      // Reset the form state
      setFile(null);
      (e.target as HTMLFormElement).reset();
      
    } catch (error: any) {
      setStatus(`Error: ${error.message}`);
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId} disabled={isUploading} required>
          <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
          <SelectContent>
            {categories.map(cat => <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="authority">Issuing Authority</Label>
        <Select value={selectedAuthorityId} onValueChange={setSelectedAuthorityId} disabled={isUploading} required>
          <SelectTrigger><SelectValue placeholder="Select an authority" /></SelectTrigger>
          <SelectContent>
            {authorities.map(auth => <SelectItem key={auth.id} value={String(auth.id)}>{auth.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
       <div className="space-y-2">
         <Label htmlFor="issue-date">Issue Date</Label>
         <DatePicker date={issueDate} setDate={setIssueDate} />
       </div>
       <div className="space-y-2">
         <Label htmlFor="expiry-date">Expiry Date</Label>
         <DatePicker date={expiryDate} setDate={setExpiryDate} />
       </div>
      <div className="space-y-2">
        <Label htmlFor="file">File</Label>
        <Input id="file" type="file" onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} disabled={isUploading} required />
      </div>
      <Button type="submit" disabled={!file || isUploading} className="w-full">
        {isUploading ? 'Uploading...' : 'Upload Document'}
      </Button>
      {status && <p className="mt-2 text-sm text-center text-gray-600">{status}</p>}
    </form>
  );
}