'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, FileImage, X } from 'lucide-react';
import { convertImageToBase64 } from '@/lib/imageUtils';
import { ExpenseFormData } from '@/types/expense';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

type ExpenseData = ExpenseFormData;

interface UploadReceiptProps {
  onExtractionComplete: (expenseData: ExpenseData) => void;
  onLoadingChange: (loading: boolean) => void;
}

export default function UploadReceipt({ onExtractionComplete, onLoadingChange }: UploadReceiptProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      
      if (validateFile(droppedFile)) {
        setFile(droppedFile);
        setPreviewUrl(URL.createObjectURL(droppedFile));
        setError(null);
      } else {
        setError('Please upload a valid image file (JPEG, PNG, or JPG)');
      }
    }
  }, []);

  const validateFile = (file: File): boolean => {
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    return validTypes.includes(file.type) && file.size <= maxSize;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
        setPreviewUrl(URL.createObjectURL(selectedFile));
        setError(null);
      } else {
        setError('Please upload a valid image file (JPEG, PNG, or JPG) under 5MB');
      }
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleExtractExpense = async () => {
    if (!file) return;

    try {
      onLoadingChange(true);
      setError(null);

      // Create form data to send the image to our API route
      const formData = new FormData();
      formData.append('image', file);

      // Call our server-side API route to process the image with Gemini
      const response = await fetch('/api/process-image', {
        method: 'POST',
        body: formData,
      });

      let expenseData;
      if (!response.ok) {
        // Try to parse error response as JSON, otherwise use generic message
        try {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to process image');
        } catch (e) {
          throw new Error('Failed to process image: Server error');
        }
      } else {
        expenseData = await response.json();
      }

      onExtractionComplete(expenseData);
    } catch (err) {
      console.error('Error extracting expense:', err);
      if (err instanceof Error) {
        if (err.message.includes('GOOGLE_API_KEY')) {
          setError('Server configuration error: API key not set. Please add GOOGLE_API_KEY to environment variables.');
        } else {
          setError(err.message);
        }
      } else {
        setError('Failed to extract expense information. Please try again.');
      }
    } finally {
      onLoadingChange(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Card
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
          isDragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <CardContent className="p-0">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/jpeg,image/png,image/jpg"
            className="hidden"
          />
          
          {previewUrl ? (
            <div className="relative">
              <img 
                src={previewUrl} 
                alt="Receipt preview" 
                className="max-h-60 mx-auto rounded-lg object-contain"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveFile();
                }}
                className="absolute top-2 right-2 h-6 w-6"
              >
                <X size={16} />
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="mx-auto w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                <Upload className="text-gray-500 dark:text-gray-400" size={24} />
              </div>
              <div>
                <p className="font-medium text-gray-700 dark:text-gray-300">
                  Drag & drop your receipt here
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  or click to browse files
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                  Supports JPG, PNG up to 5MB
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {error && (
        <div className="mt-3 p-3 bg-red-50 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      {file && !error && (
        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleExtractExpense}
            disabled={!file}
            className="flex-1"
          >
            <FileImage size={18} className="mr-2" />
            Extract Expense Data
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleRemoveFile}
          >
            Remove
          </Button>
        </div>
      )}
    </div>
  );
}