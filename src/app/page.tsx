'use client';

import BillSplitter from '@/components/BillSplitter';
import ReceiptItemEditor from '@/components/ReceiptItemEditor';
import ReceiptUpload from '@/components/ReceiptUpload';
import { ReceiptItem } from '@/types/receipt';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

// Social icons
import { FaGithub, FaGlobe, FaTwitter } from 'react-icons/fa';

declare global {
  interface Window {
    lastUploadedImage: string;
  }
}


export default function Home() {
  // Steps: 0=landing, 1=scan, 2=review items, 3=split
  const [step, setStep] = useState(0);
  const [receiptItems, setReceiptItems] = useState<ReceiptItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleUpload = (items: ReceiptItem[], image: string) => {
    setReceiptItems(items);
    setImagePreview(image);
    setStep(2); // Go to review items step
  };

  const handleManualEntry = () => {
    // Start with a single empty item
    setReceiptItems([{
      id: `new-item-${Date.now()}`,
      name: '',
      price: 0,
      quantity: 1,
      assignedTo: []
    }]);
    setImagePreview(null);
    setStep(2); // Go to review items step
  };

  const handleItemsFinalized = (finalizedItems: ReceiptItem[]) => {
    setReceiptItems(finalizedItems);
    setStep(3); // Go to split step
  };

  const handleReset = () => {
    setReceiptItems([]);
    setImagePreview(null);
    setError(null);
    setStep(0);
  };

  return (
    <main className="min-h-screen flex flex-col items-center py-8 bg-[var(--color-bg)]">
      {/* Header */}
      <header className="w-full max-w-5xl flex items-center justify-center mb-8 px-4">
        <div className="flex items-center gap-2">
          <span className="text-3xl font-bold tracking-tight text-[var(--color-accent)] flex items-center gap-2">
            <span className="inline-block w-8 h-8 bg-[var(--color-accent)] rounded-lg flex items-center justify-center text-white font-bold">$</span>
            Money Mate
          </span>
        </div>
      </header>
      <div className="w-full max-w-3xl card p-8 flex flex-col gap-8 mx-auto">
        {step > 0}
        {/* Step 0: Choose input method */}
        {step === 0 && (
          <div className="flex flex-col items-center justify-center gap-8">
            <div className="text-center mb-2">
              <div className="text-3xl font-bold text-[var(--color-accent)] mb-2">Scan. Tap. Split.</div>
              <div className="text-base text-white max-w-xl mx-auto">Snap the receipt, tap your items, see who owes what. No sign-ups, no math, no drama.</div>
            </div>
            <div className="flex flex-col gap-4 w-full max-w-xs mx-auto">
              <button
                className="flex flex-col items-center justify-center gap-2 p-6 rounded-xl border-2 border-[var(--color-accent)] bg-[var(--color-accent-light)] hover:bg-[var(--color-accent)] hover:text-white shadow transition-all w-full btn-accent text-lg font-semibold"
                onClick={() => setStep(1)}
              >
                <span className="text-3xl">📷</span>
                Scan / Upload Receipt
              </button>
              <button
                className="flex flex-col items-center justify-center gap-2 p-6 rounded-xl border-2 border-[var(--color-accent)] bg-white hover:bg-[var(--color-accent-light)] text-[var(--color-accent)] shadow transition-all w-full btn-secondary text-lg font-semibold"
                onClick={handleManualEntry}
              >
                <span className="text-3xl">✍️</span>
                Enter Manually
              </button>
            </div>
          </div>
        )}
        {/* Step 1: Upload/Scan */}
        {step === 1 && (
          <div>
            <ReceiptUpload
              onReceiptAnalysis={(items) => handleUpload(items, window.lastUploadedImage)}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
              setError={setError}
              setImagePreview={setImagePreview}
            />
            {error && (
              <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg">
                {error}
              </div>
            )}
            <button
              onClick={handleReset}
              className="mt-6 btn-secondary"
            >
              Back
            </button>
          </div>
        )}

        {/* Step 2: Review and Finalize Items */}
        {step === 2 && (
          <div className={`flex flex-col ${imagePreview ? '' : ''} gap-8`}>
            {/* Left: Image Preview (only if available) */}
            {imagePreview && (
              <div className="flex-1 flex flex-col items-center">
                <div className="w-full max-w-xs rounded-xl overflow-hidden shadow-md border border-gray-200 bg-gray-50">
                  <Image
                    src={imagePreview}
                    alt="Receipt Preview"
                    width={400}
                    height={600}
                    className="w-full object-contain"
                    style={{ height: 'auto' }}
                  />
                </div>
                <button
                  onClick={handleReset}
                  className="mt-6 btn-secondary"
                >
                  Upload New Bill
                </button>
              </div>
            )}

            {/* Right: Item Editor */}
            <div className={imagePreview ? "flex-1" : "w-full"}>
              <ReceiptItemEditor
                items={receiptItems}
                onItemsFinalized={handleItemsFinalized}
                isManualEntry={!imagePreview}
              />
              {!imagePreview && (
                <button
                  onClick={handleReset}
                  className="mt-6 btn-secondary"
                >
                  Back
                </button>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Bill Splitter */}
        {step === 3 && (
          <div>
            <BillSplitter
              items={receiptItems}
              onEditItems={() => setStep(2)}
            />
            <div className="flex justify-between mt-8">
              <button
                onClick={() => setStep(2)}
                className="btn-secondary"
              >
                Back
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleReset}
                  className="text-[var(--color-text)] hover:underline"
                >
                  Start Over
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-auto pt-12 pb-6 w-full text-center">
        <div className="footer-divider mb-6"></div>

        <div className="social-icons">
          <Link href="https://twitter.com/itsshashwatj" target="_blank" aria-label="Twitter">
            <FaTwitter size={24} className="social-icon" />
          </Link>
          <Link href="https://github.com/sahabji0P" target="_blank" aria-label="GitHub">
            <FaGithub size={24} className="social-icon" />
          </Link>
          <Link href="https://shashwatjain.me" target="_blank" aria-label="Portfolio">
            <FaGlobe size={24} className="social-icon" />
          </Link>
        </div>

        <p className="text-[var(--color-text-secondary)] mt-3">Made for better bill splitting</p>
        <p className="text-sm font-bold text-[var(--color-text-secondary)] mt-2">SJ © {new Date().getFullYear()}</p>
      </footer>
    </main>
  );
}
