'use client';

import { BillSummary, Person, ReceiptItem } from '@/types/receipt';
import { ClipboardIcon, PlusIcon, UserIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useMemo, useState } from 'react';

interface BillSplitterProps {
    items: ReceiptItem[];
}

interface EditableItem extends ReceiptItem {
    quantity: number;
}

export default function BillSplitter({ items }: BillSplitterProps) {
    const [people, setPeople] = useState<Person[]>([
        { id: '1', name: 'You' },
    ]);
    const [newPersonName, setNewPersonName] = useState('');
    const [editableItems, setEditableItems] = useState<EditableItem[]>(
        items.map(item => ({ ...item, quantity: 1 }))
    );
    const [tip, setTip] = useState(0);
    const [tax, setTax] = useState(0);
    const [copied, setCopied] = useState(false);

    // Add person
    const addPerson = () => {
        if (!newPersonName.trim()) return;
        setPeople([
            ...people,
            {
                id: Date.now().toString(),
                name: newPersonName.trim(),
            },
        ]);
        setNewPersonName('');
    };

    // Remove person
    const removePerson = (id: string) => {
        setPeople(people.filter(person => person.id !== id));
        setEditableItems(editableItems.map(item => ({
            ...item,
            assignedTo: item.assignedTo.filter(pid => pid !== id),
        })));
    };

    // Edit item fields
    const editItem = (id: string, field: 'name' | 'price' | 'quantity', value: string | number) => {
        setEditableItems(editableItems.map(item =>
            item.id === id ? { ...item, [field]: field === 'quantity' ? Math.max(1, Number(value)) : value } : item
        ));
    };

    // Assign/unassign item to person
    const toggleItemAssignment = (itemId: string, personId: string) => {
        setEditableItems(editableItems.map(item => {
            if (item.id === itemId) {
                const assignedTo = item.assignedTo.includes(personId)
                    ? item.assignedTo.filter(id => id !== personId)
                    : [...item.assignedTo, personId];
                return { ...item, assignedTo };
            }
            return item;
        }));
    };

    // Split evenly
    const splitEvenly = () => {
        setEditableItems(editableItems.map(item => ({
            ...item,
            assignedTo: people.map(p => p.id),
        })));
    };

    // Add tip/tax as pseudo-items for summary
    const allItemsWithExtras = useMemo(() => {
        let arr = [...editableItems];
        if (tip > 0) arr.push({ id: 'tip', name: 'Tip', price: tip, assignedTo: people.map(p => p.id), quantity: 1 });
        if (tax > 0) arr.push({ id: 'tax', name: 'Tax', price: tax, assignedTo: people.map(p => p.id), quantity: 1 });
        return arr;
    }, [editableItems, tip, tax, people]);

    // Per-person summary calculation
    const billSummary = useMemo(() => {
        const summary: BillSummary = {
            total: allItemsWithExtras.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0),
            perPerson: {},
        };
        people.forEach(person => {
            const personItems = allItemsWithExtras.filter(item => item.assignedTo.includes(person.id));
            const total = personItems.reduce((sum, item) => {
                const share = (item.price * (item.quantity || 1)) / item.assignedTo.length;
                return sum + share;
            }, 0);
            summary.perPerson[person.id] = {
                total,
                items: personItems.map(item => ({
                    id: item.id,
                    name: item.name,
                    price: item.price * (item.quantity || 1),
                    share: (item.price * (item.quantity || 1)) / item.assignedTo.length,
                })),
            };
        });
        return summary;
    }, [allItemsWithExtras, people]);

    // Share summary (copy to clipboard)
    const handleShare = () => {
        let text = 'Bill Split Summary\n';
        people.forEach(person => {
            text += `\n${person.name}: $${billSummary.perPerson[person.id]?.total.toFixed(2) || '0.00'}\n`;
            billSummary.perPerson[person.id]?.items.forEach(item => {
                text += `  - ${item.name}: $${item.share.toFixed(2)}\n`;
            });
        });
        text += `\nTotal: $${billSummary.total.toFixed(2)}`;
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-8">
            {/* Who's Splitting Section */}
            <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-2">Who's Splitting?</h2>
                <div className="flex flex-wrap gap-2 mb-3">
                    {people.map(person => (
                        <span key={person.id} className="flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 text-blue-800 font-medium shadow-sm">
                            <UserIcon className="h-4 w-4" /> {person.name}
                            {people.length > 1 && (
                                <button onClick={() => removePerson(person.id)} className="ml-1 text-gray-400 hover:text-red-500 focus:outline-none">
                                    <XMarkIcon className="h-4 w-4" />
                                </button>
                            )}
                        </span>
                    ))}
                </div>
                <div className="flex gap-2 items-center">
                    <input
                        type="text"
                        value={newPersonName}
                        onChange={(e) => setNewPersonName(e.target.value)}
                        placeholder="Add person name"
                        className="flex-1 rounded-lg text-black border border-gray-300 px-4 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onKeyPress={(e) => e.key === 'Enter' && addPerson()}
                    />
                    <button
                        onClick={addPerson}
                        className="rounded-full bg-blue-600 hover:bg-blue-700 text-white p-3 shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
                        aria-label="Add person"
                    >
                        <PlusIcon className="h-5 w-5" />
                    </button>
                    <button
                        onClick={splitEvenly}
                        className="ml-2 rounded-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 font-semibold shadow-md transition-all"
                    >
                        Split Evenly
                    </button>
                </div>
            </div>
            {/* Editable Items List */}
            <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-2">Assign Items</h2>
                <div className="grid gap-4">
                    {editableItems.map((item) => (
                        <div key={item.id} className="rounded-xl bg-white shadow-sm border border-gray-200 p-4 flex flex-col md:flex-row md:items-center md:justify-between transition-all">
                            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 flex-1">
                                <input
                                    type="text"
                                    value={item.name}
                                    onChange={e => editItem(item.id, 'name', e.target.value)}
                                    className="rounded-md border border-gray-300 px-2 py-1 w-32 md:w-40 text-gray-900 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <input
                                    type="number"
                                    min={0}
                                    step={0.01}
                                    value={item.price}
                                    onChange={e => editItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                                    className="rounded-md border border-gray-300 px-2 py-1 w-20 text-gray-900 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <input
                                    type="number"
                                    min={1}
                                    value={item.quantity}
                                    onChange={e => editItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                                    className="rounded-md border border-gray-300 px-2 py-1 w-16 text-gray-900 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="flex gap-2 mt-2 md:mt-0 flex-wrap">
                                {people.map((person) => (
                                    <button
                                        key={person.id}
                                        onClick={() => toggleItemAssignment(item.id, person.id)}
                                        className={`rounded-full px-4 py-1 text-sm font-medium border transition-all focus:outline-none focus:ring-2 focus:ring-blue-400 ${item.assignedTo.includes(person.id)
                                            ? 'bg-blue-100 text-blue-700 border-blue-300 shadow'
                                            : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-blue-50'
                                            }`}
                                    >
                                        {person.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            {/* Tip/Tax Fields */}
            <div className="flex gap-4 items-center">
                <div className="flex flex-col">
                    <label className="text-gray-700 font-medium mb-1">Tip</label>
                    <input
                        type="number"
                        min={0}
                        step={0.01}
                        value={tip}
                        onChange={e => setTip(parseFloat(e.target.value) || 0)}
                        className="rounded-md border border-gray-300 px-2 py-1 w-24 text-gray-900 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="flex flex-col">
                    <label className="text-gray-700 font-medium mb-1">Tax</label>
                    <input
                        type="number"
                        min={0}
                        step={0.01}
                        value={tax}
                        onChange={e => setTax(parseFloat(e.target.value) || 0)}
                        className="rounded-md border border-gray-300 px-2 py-1 w-24 text-gray-900 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>
            {/* Per-Person Summary */}
            <div className="grid md:grid-cols-2 gap-6">
                {people.map((person) => (
                    <div key={person.id} className="rounded-2xl bg-blue-50 border border-blue-100 shadow-lg p-6">
                        <h3 className="mb-2 text-lg font-semibold text-blue-900 flex items-center gap-2">
                            <UserIcon className="h-5 w-5" /> {person.name}
                        </h3>
                        <ul className="mb-2 text-blue-900">
                            {billSummary.perPerson[person.id]?.items.map(item => (
                                <li key={item.id} className="flex justify-between text-sm mb-1">
                                    <span>{item.name}</span>
                                    <span>${item.share.toFixed(2)}</span>
                                </li>
                            ))}
                        </ul>
                        <div className="flex justify-between font-bold text-blue-800 border-t border-blue-200 pt-2 mt-2">
                            <span>Total</span>
                            <span>${billSummary.perPerson[person.id]?.total.toFixed(2) || '0.00'}</span>
                        </div>
                    </div>
                ))}
            </div>
            {/* Share Button */}
            <div className="flex justify-end">
                <button
                    onClick={handleShare}
                    className="flex items-center gap-2 px-6 py-3 rounded-full bg-green-600 text-white font-semibold shadow hover:bg-green-700 transition-all"
                >
                    <ClipboardIcon className="h-5 w-5" />
                    {copied ? 'Copied!' : 'Share'}
                </button>
            </div>
        </div>
    );
} 