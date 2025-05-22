'use client';

import BillSplitter from '@/components/BillSplitter';
import ReceiptItemEditor from '@/components/ReceiptItemEditor';
import ReceiptUpload from '@/components/ReceiptUpload';
import { ReceiptItem } from '@/types/receipt';
import { useState } from 'react';

const STEPS = [
  'Scan',
  'Review Items',
  'Split',
];

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

  // Stepper UI
  const Stepper = () => (
    <div className="flex items-center justify-center w-full mb-10">
      {STEPS.map((label, idx) => {
        // Map step state (0-3) to indices (0-2)
        const stepIndex = idx + 1; // Step indices are 1, 2, 3 in the UI
        const isActive = step === stepIndex;
        const isCompleted = step > stepIndex;

        return (
          <div key={label} className="flex flex-col items-center relative">
            {/* Line before */}
            {idx > 0 && (
              <div className={`absolute right-full top-5 w-full h-1 -translate-y-1/2 ${isCompleted ? 'bg-[var(--color-accent)]' : 'bg-gray-300'}`}
                style={{ width: '100%', right: '50%' }}></div>
            )}

            {/* Circle */}
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-white text-lg mb-2 z-10 transition-all
                ${isActive || isCompleted ? 'bg-[var(--color-accent)]' : 'bg-gray-300'}`}
            >
              {stepIndex}
            </div>

            {/* Label */}
            <span className={`font-medium text-sm ${isActive ? 'text-[var(--color-accent)]' : 'text-gray-500'}`}>
              {label}
            </span>

            {/* Line after */}
            {idx < STEPS.length - 1 && (
              <div className={`absolute left-1/2 top-5 w-full h-1 -translate-y-1/2 ${isCompleted ? 'bg-[var(--color-accent)]' : 'bg-gray-300'}`}
                style={{ width: '100%' }}></div>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <main className="min-h-screen flex flex-col items-center py-8 bg-[var(--color-bg)]">
      {/* Header */}
      <header className="w-full max-w-5xl flex items-center justify-between mb-8 px-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold tracking-tight text-[var(--color-accent)] flex items-center gap-2">
            <span className="inline-block w-7 h-7 bg-[var(--color-accent)] rounded-lg flex items-center justify-center text-white font-bold">$</span>
            Money Mate
          </span>
        </div>
        {/* Placeholder for sign-in */}
        <button className="rounded-full px-4 py-2 bg-[var(--color-accent-light)] text-[var(--color-accent)] font-medium shadow hover:bg-[var(--color-accent)] hover:text-white transition-all" disabled>
          Sign in
        </button>
      </header>
      <div className="w-full max-w-3xl card p-8 flex flex-col gap-8 mx-auto">
        {step > 0 && <Stepper />}
        {/* Step 0: Choose input method */}
        {step === 0 && (
          <div className="flex flex-col items-center justify-center gap-8">
            <div className="text-center mb-2">
              <div className="text-3xl font-bold text-[var(--color-accent)] mb-2">Scan. Tap. Split.</div>
              <div className="text-base text-gray-500 max-w-xl mx-auto">Snap the receipt, tap your items, see who owes what. No sign-ups, no math, no drama.</div>
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
                onClick={() => alert('Manual entry coming soon!')}
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
              onReceiptAnalysis={(items) => handleUpload(items, (window as any).lastUploadedImage)}
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
          <div className="flex flex-col md:flex-row gap-8">
            {/* Left: Image Preview */}
            <div className="flex-1 flex flex-col items-center">
              {imagePreview && (
                <div className="w-full max-w-xs rounded-xl overflow-hidden shadow-md border border-gray-200 bg-gray-50">
                  <img src={imagePreview} alt="Receipt Preview" className="w-full object-contain" />
                </div>
              )}
              <button
                onClick={handleReset}
                className="mt-6 btn-secondary"
              >
                Upload New Bill
              </button>
            </div>
            {/* Right: Item Editor */}
            <div className="flex-1">
              <ReceiptItemEditor
                items={receiptItems}
                onItemsFinalized={handleItemsFinalized}
              />
            </div>
          </div>
        )}

        {/* Step 3: Assign and Split */}
        {step === 3 && (
          <div className="flex flex-col gap-8">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Split Your Bill</h2>
              <button
                onClick={() => setStep(2)}
                className="btn-secondary text-sm px-4 py-2"
              >
                Edit Items
              </button>
            </div>

            <BillSplitter items={receiptItems} />
          </div>
        )}
      </div>
    </main>
  );
}
