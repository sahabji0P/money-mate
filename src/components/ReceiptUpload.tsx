'use client';

import { ReceiptItem } from '@/types/receipt';
import { PhotoIcon } from '@heroicons/react/24/outline';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

interface ReceiptUploadProps {
    onReceiptAnalysis: (items: ReceiptItem[]) => void;
    isLoading: boolean;
    setIsLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    setImagePreview?: (image: string) => void;
}

export default function ReceiptUpload({
    onReceiptAnalysis,
    isLoading,
    setIsLoading,
    setError,
    setImagePreview,
}: ReceiptUploadProps) {
    const [localPreview, setLocalPreview] = useState<string | null>(null);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;

        try {
            setIsLoading(true);
            setError(null);

            // Convert image to base64
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async () => {
                const base64Image = reader.result as string;

                // Set both local and parent component previews
                setLocalPreview(base64Image);
                if (setImagePreview) setImagePreview(base64Image);

                // Store in window for later use
                (window as any).lastUploadedImage = base64Image;

                // Call API to analyze receipt
                try {
                    const response = await fetch('/api/analyze-receipt', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ image: base64Image }),
                    });

                    if (!response.ok) {
                        throw new Error('Failed to analyze receipt');
                    }

                    const data = await response.json();
                    onReceiptAnalysis(data.items);
                } catch (error) {
                    setError(error instanceof Error ? error.message : 'Failed to process receipt');
                    setIsLoading(false);
                }
            };

            reader.onerror = () => {
                setError('Failed to read file');
                setIsLoading(false);
            };
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to process receipt');
            setIsLoading(false);
        }
    }, [onReceiptAnalysis, setIsLoading, setError, setImagePreview]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png'],
        },
        maxFiles: 1,
        disabled: isLoading,
    });

    return (
        <div className="flex flex-col items-center">
            {!localPreview ? (
                <div
                    {...getRootProps()}
                    className={`transition-all border-2 border-dashed rounded-xl bg-white shadow-md flex flex-col items-center justify-center p-8 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 hover:shadow-lg ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                        } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    style={{ minHeight: '250px', width: '100%' }}
                >
                    <input {...getInputProps()} disabled={isLoading} />
                    <PhotoIcon className="mx-auto h-14 w-14 text-blue-500 mb-2" />
                    <p className="text-base font-medium text-gray-700 mb-1">Drag and drop a receipt image, or click to select</p>
                    <p className="text-xs text-gray-400">JPG, PNG up to 5MB</p>
                </div>
            ) : (
                <div className="w-full max-w-md rounded-xl overflow-hidden border border-gray-200 shadow-md flex flex-col items-center">
                    <img
                        src={localPreview}
                        alt="Receipt preview"
                        className="w-full h-auto object-contain max-h-[400px]"
                    />
                    {isLoading && (
                        <div className="w-full bg-blue-500 text-white text-center py-2 animate-pulse">
                            Analyzing receipt...
                        </div>
                    )}
                </div>
            )}
            {isLoading && !localPreview && <p className="mt-2 text-blue-600 animate-pulse">Processing receipt...</p>}
        </div>
    );
} 