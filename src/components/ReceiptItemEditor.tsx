'use client';

import { ReceiptItem } from '@/types/receipt';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';

interface ReceiptItemEditorProps {
    items: ReceiptItem[];
    onItemsFinalized: (items: ReceiptItem[]) => void;
}

export default function ReceiptItemEditor({ items, onItemsFinalized }: ReceiptItemEditorProps) {
    const [editableItems, setEditableItems] = useState<ReceiptItem[]>([]);

    useEffect(() => {
        setEditableItems(items.map(item => ({ ...item })));
    }, [items]);

    // Add a new blank item
    const addItem = () => {
        setEditableItems([
            ...editableItems,
            {
                id: `new-item-${Date.now()}`,
                name: '',
                price: 0,
                assignedTo: []
            }
        ]);
    };

    // Delete an item
    const deleteItem = (id: string) => {
        setEditableItems(editableItems.filter(item => item.id !== id));
    };

    // Update an item property
    const updateItem = (id: string, field: 'name' | 'price', value: string | number) => {
        setEditableItems(
            editableItems.map(item =>
                item.id === id
                    ? {
                        ...item,
                        [field]: field === 'price' ? Number(value) : value
                    }
                    : item
            )
        );
    };

    // Calculate total
    const total = editableItems.reduce((sum, item) => sum + item.price, 0);

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Review & Edit Items</h2>
                <button
                    onClick={addItem}
                    className="rounded-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-dark)] text-white p-2 shadow transition-all"
                    aria-label="Add item"
                >
                    <PlusIcon className="h-5 w-5" />
                </button>
            </div>

            <div className="space-y-3">
                {/* Table header */}
                <div className="grid grid-cols-12 gap-2 py-2 font-medium text-gray-700 border-b border-gray-200">
                    <div className="col-span-6">Item</div>
                    <div className="col-span-3 text-right">Price</div>
                    <div className="col-span-3 text-right">Actions</div>
                </div>

                {/* Item list */}
                {editableItems.map(item => (
                    <div key={item.id} className="grid grid-cols-12 gap-2 py-2 items-center border-b border-gray-100">
                        <div className="col-span-6">
                            <input
                                type="text"
                                value={item.name}
                                onChange={e => updateItem(item.id, 'name', e.target.value)}
                                className="w-full rounded border border-gray-300 px-2 py-1"
                                placeholder="Item name"
                            />
                        </div>
                        <div className="col-span-3">
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={item.price}
                                onChange={e => updateItem(item.id, 'price', e.target.value)}
                                className="w-full rounded border border-gray-300 px-2 py-1 text-right"
                                placeholder="0.00"
                            />
                        </div>
                        <div className="col-span-3 flex justify-end space-x-2">
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

                {/* Total */}
                <div className="grid grid-cols-12 gap-2 py-3 font-bold border-t border-gray-300">
                    <div className="col-span-6">Total</div>
                    <div className="col-span-6 text-right">${total.toFixed(2)}</div>
                </div>
            </div>

            <div className="mt-6 flex justify-end">
                <button
                    onClick={() => onItemsFinalized(editableItems)}
                    className="btn-accent px-6 py-2 rounded-lg"
                    disabled={editableItems.length === 0}
                >
                    Finalize Items & Continue
                </button>
            </div>
        </div>
    );
} 