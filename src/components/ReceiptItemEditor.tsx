'use client';

import { ReceiptItem } from '@/types/receipt';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';

interface ReceiptItemEditorProps {
    items: ReceiptItem[];
    onItemsFinalized: (items: ReceiptItem[]) => void;
    isManualEntry?: boolean;
}

export default function ReceiptItemEditor({ items, onItemsFinalized, isManualEntry = false }: ReceiptItemEditorProps) {
    const [editableItems, setEditableItems] = useState<ReceiptItem[]>([]);
    const [tax, setTax] = useState(0);
    const [tip, setTip] = useState(0);

    useEffect(() => {
        // Set default quantity to 1 if not present
        setEditableItems(items.map(item => ({
            ...item,
            quantity: item.quantity || 1
        })));
    }, [items]);

    // Add a new blank item
    const addItem = () => {
        setEditableItems([
            ...editableItems,
            {
                id: `new-item-${Date.now()}`,
                name: '',
                price: 0,
                quantity: 1,
                assignedTo: []
            }
        ]);
    };

    // Delete an item
    const deleteItem = (id: string) => {
        setEditableItems(editableItems.filter(item => item.id !== id));
    };

    // Update an item property
    const updateItem = (id: string, field: 'name' | 'price' | 'quantity', value: string | number) => {
        setEditableItems(
            editableItems.map(item =>
                item.id === id
                    ? {
                        ...item,
                        [field]: field === 'name' ? value : Number(value)
                    }
                    : item
            )
        );
    };

    // Calculate subtotal (before tax and tip)
    const subtotal = editableItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Calculate total with tax and tip
    const total = subtotal + tax + tip;

    // Handle finalization with tax and tip
    const handleFinalize = () => {
        // Validate that all items have names and prices
        const hasEmptyItems = editableItems.some(item => !item.name.trim() || item.price <= 0);

        if (hasEmptyItems) {
            alert('Please fill in all item names and prices before continuing.');
            return;
        }

        // If tax or tip is provided, add them as special items
        const finalItems = [...editableItems];

        if (tax > 0) {
            finalItems.push({
                id: 'tax',
                name: 'Tax',
                price: tax,
                quantity: 1,
                assignedTo: []
            });
        }

        if (tip > 0) {
            finalItems.push({
                id: 'tip',
                name: 'Tip',
                price: tip,
                quantity: 1,
                assignedTo: []
            });
        }

        onItemsFinalized(finalItems);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">
                    {isManualEntry ? 'Enter Receipt Items' : 'Review & Edit Items'}
                </h2>

            </div>

            <div className="space-y-3">
                {/* Table header */}
                <div className="grid grid-cols-12 gap-2 py-2 font-medium text-gray-700 border-b border-gray-200">
                    <div className="col-span-4">Item</div>
                    <div className="col-span-2 text-center">Price</div>
                    <div className="col-span-2 text-center">Quantity</div>
                    <div className="col-span-2 text-right">Total</div>
                    <div className="col-span-2 text-right">Actions</div>
                </div>

                {/* Item list */}
                {editableItems.map(item => (
                    <div key={item.id} className="grid grid-cols-12 gap-2 py-2 items-center border-b border-gray-100">
                        <div className="col-span-4">
                            <input
                                type="text"
                                value={item.name}
                                onChange={e => updateItem(item.id, 'name', e.target.value)}
                                className="w-full rounded border border-gray-300 px-2 py-1"
                                placeholder="Item name"
                            />
                        </div>
                        <div className="col-span-2">
                            <input
                                type="text"
                                step="0.01"
                                value={item.price}
                                onChange={e => updateItem(item.id, 'price', e.target.value)}
                                className="w-full rounded border border-gray-300 px-2 py-1 text-right"
                                placeholder="0.00"
                            />
                        </div>
                        <div className="col-span-2">
                            <input
                                type="number"
                                min="1"
                                step="1"
                                value={item.quantity}
                                onChange={e => updateItem(item.id, 'quantity', Math.max(1, parseInt(e.target.value) || 1))}
                                className="w-full rounded border border-gray-300 px-2 py-1 text-center"
                            />
                        </div>
                        <div className="col-span-2 text-right font-medium">
                            ${(item.price * item.quantity).toFixed(2)}
                        </div>
                        <div className="col-span-2 flex justify-end space-x-2">
                            <button
                                onClick={() => deleteItem(item.id)}
                                className="p-1 text-red-500 hover:bg-red-50 rounded"
                                aria-label="Delete item"
                            >
                                <TrashIcon className="h-5 w-5" />
                            </button>

                        </div>

                    </div>

                ))}
                <button
                    onClick={addItem}
                    className="rounded-full bg-[var(--color-accent)] text-white p-2 shadow transition-all"
                    aria-label="Add item"
                >
                    <PlusIcon className="h-5 w-5" />
                </button>

                {editableItems.length === 0 && (
                    <div className="py-4 text-center text-gray-500">
                        No items yet. Click the + button to add items.
                    </div>
                )}

                {/* Subtotal */}
                <div className="grid grid-cols-12 gap-2 py-3 font-medium border-t border-gray-200">
                    <div className="col-span-8 text-right">Subtotal</div>
                    <div className="col-span-4 text-right">${subtotal.toFixed(2)}</div>
                </div>

                {/* Tax and Tip */}
                <div className="grid grid-cols-12 gap-4 py-3 items-center">
                    <div className="col-span-2 text-right md:text-left">
                        <label className="font-medium text-gray-700">Tax</label>
                    </div>
                    <div className="col-span-4 md:col-span-3">
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={tax}
                            onChange={e => setTax(parseFloat(e.target.value) || 0)}
                            className="w-full rounded border border-gray-300 px-2 py-1 text-right"
                            placeholder="0.00"
                        />
                    </div>
                    <div className="col-span-2 text-right md:text-left">
                        <label className="font-medium text-gray-700">Tip</label>
                    </div>
                    <div className="col-span-4 md:col-span-3">
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={tip}
                            onChange={e => setTip(parseFloat(e.target.value) || 0)}
                            className="w-full rounded border border-gray-300 px-2 py-1 text-right"
                            placeholder="0.00"
                        />
                    </div>
                </div>

                {/* Total */}
                <div className="grid grid-cols-12 gap-2 py-3 font-bold border-t border-gray-300">
                    <div className="col-span-8 text-right">Total</div>
                    <div className="col-span-4 text-right">${total.toFixed(2)}</div>
                </div>
            </div>

            <div className="mt-6 flex justify-end">
                <button
                    onClick={handleFinalize}
                    className="btn-accent px-6 py-2 rounded-lg"
                    disabled={editableItems.length === 0}
                >
                    {isManualEntry ? 'Continue to Split' : 'Finalize Items & Continue'}
                </button>
            </div>
        </div>
    );
} 