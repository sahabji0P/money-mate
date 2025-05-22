'use client';

import { ReceiptItem } from '@/types/receipt';
import { PhotoIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

interface ReceiptUploadProps {
    onReceiptAnalysis: (items: ReceiptItem[]) => void;
    isLoading: boolean;
    setIsLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    setImagePreview?: (image: string) => void;
}

declare global {
    interface Window {
        lastUploadedImage: string;
    }
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
                window.lastUploadedImage = base64Image;

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
            <div className="text-center mb-2">
                <div className="text-3xl font-bold text-[var(--color-accent)] mb-2">Scan.</div>
                <div className="text-base font-semibold text-gray-500 max-w-xl mx-auto">Snap the receipt, no math, no drama.</div>
            </div>
            {!localPreview ? (
                <div
                    {...getRootProps()}
                    className={`transition-all border-2 border-dashed rounded-xl bg-white shadow-md flex flex-col items-center justify-center p-8 cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500 hover:shadow-lg ${isDragActive ? 'border-red-500 bg-red-500' : 'border-red-500'
                        } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    style={{ minHeight: '250px', width: '100%' }}
                >
                    <input {...getInputProps()} disabled={isLoading} />
                    <PhotoIcon className="mx-auto h-14 w-14 text-red-500 mb-2" />
                    <p className="text-base font-medium text-black mb-1">Drag and drop a receipt image, or click to select</p>
                    <p className="text-xs text-black">JPG, PNG up to 5MB</p>
                </div>
            ) : (
                <div className="w-full max-w-md rounded-xl overflow-hidden border border-gray-200 shadow-md flex flex-col items-center">
                    <Image
                        src={localPreview}
                        alt="Receipt preview"
                        width={400}
                        height={600}
                        className="w-full h-auto object-contain max-h-[400px]"
                        style={{ height: 'auto' }}
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