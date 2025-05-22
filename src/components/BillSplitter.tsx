'use client';

import { BillSummary, Person, ReceiptItem } from '@/types/receipt';
import { ClipboardIcon, DocumentArrowDownIcon, PlusIcon, ShareIcon, UserIcon, XMarkIcon } from '@heroicons/react/24/outline';
import html2canvas from 'html2canvas';
import { useMemo, useRef, useState } from 'react';

interface BillSplitterProps {
    items: ReceiptItem[];
    onEditItems: () => void;
}

export default function BillSplitter({ items, onEditItems }: BillSplitterProps) {
    const [people, setPeople] = useState<Person[]>([
        { id: '1', name: 'You' },
    ]);
    const [newPersonName, setNewPersonName] = useState('');
    const [copied, setCopied] = useState(false);
    const [showShareOptions, setShowShareOptions] = useState(false);
    const summaryRef = useRef<HTMLDivElement>(null);

    // Make a local copy of items to manage assignment
    const [splittableItems, setSplittableItems] = useState<ReceiptItem[]>(
        items.map(item => ({ ...item }))
    );

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
        setSplittableItems(splittableItems.map(item => ({
            ...item,
            assignedTo: item.assignedTo.filter(pid => pid !== id),
        })));
    };

    // Assign/unassign item to person
    const toggleItemAssignment = (itemId: string, personId: string) => {
        setSplittableItems(splittableItems.map(item => {
            // Prevent manual assignment for Tip/Tax
            if (item.id === itemId && (item.name.toLowerCase() === 'tip' || item.name.toLowerCase() === 'tax')) {
                return { ...item, assignedTo: people.map(p => p.id) };
            }
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
        setSplittableItems(splittableItems.map(item => ({
            ...item,
            assignedTo: people.map(p => p.id),
        })));
    };

    // Ensure Tip/Tax are always assigned to all users
    const normalizedItems = useMemo(() => {
        return splittableItems.map(item => {
            if (item.name.toLowerCase() === 'tip' || item.name.toLowerCase() === 'tax') {
                return { ...item, assignedTo: people.map(p => p.id) };
            }
            return item;
        });
    }, [splittableItems, people]);

    // Per-person summary calculation
    const billSummary = useMemo(() => {
        const summary: BillSummary = {
            total: normalizedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            perPerson: {},
        };
        people.forEach(person => {
            const personItems = normalizedItems.filter(item => item.assignedTo.includes(person.id));
            const total = personItems.reduce((sum, item) => {
                const share = (item.price * item.quantity) / item.assignedTo.length;
                return sum + share;
            }, 0);
            summary.perPerson[person.id] = {
                total,
                items: personItems.map(item => ({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    share: (item.price * item.quantity) / item.assignedTo.length,
                })),
            };
        });
        return summary;
    }, [normalizedItems, people]);

    // Generate text summary
    const generateTextSummary = () => {
        let text = 'Bill Split Summary\n';
        text += `\nDate: ${new Date().toLocaleDateString()}\n\n`;

        people.forEach(person => {
            text += `${person.name}: $${billSummary.perPerson[person.id]?.total.toFixed(2) || '0.00'}\n`;
            billSummary.perPerson[person.id]?.items.map(item => {
                text += `  - ${item.name}${item.quantity > 1 ? ` (x${item.quantity})` : ''}: $${item.share.toFixed(2)}\n`;
            });
            text += '\n';
        });

        text += `Total: $${billSummary.total.toFixed(2)}`;
        return text;
    };

    // Share summary as text
    const copyToClipboard = () => {
        const text = generateTextSummary();
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        setShowShareOptions(false);
    };

    // Download summary as image
    const downloadAsImage = async () => {
        if (!summaryRef.current) return;

        try {
            const element = summaryRef.current;
            const canvas = await html2canvas(element, {
                backgroundColor: '#f9f6f3',
                scale: 2,
                logging: false,
            });

            const dataUrl = canvas.toDataURL('image/png');
            const downloadLink = document.createElement('a');
            downloadLink.href = dataUrl;
            downloadLink.download = `bill-split-${new Date().toISOString().slice(0, 10)}.png`;
            downloadLink.click();
            setShowShareOptions(false);
        } catch (error) {
            console.error('Failed to generate image:', error);
            alert('Could not create image. Try copying as text instead.');
        }
    };

    return (
        <div className="space-y-8">
            {/* Who's Splitting Section */}
            <div>
                <div className="text-center mb-4">
                    <div className="text-3xl font-bold text-[var(--color-accent)] mb-2">Split.</div>
                    <div className="text-base font-semibold text-[var(--color-text)] max-w-xl mx-auto">See who owes what, no math, no drama.</div>
                </div>
                <h2 className="text-lg font-semibold text-[var(--color-text)] mb-2">Who&apos;s Splitting?</h2>
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
                        className="flex-1 rounded-lg text-[var(--color-text)] border border-gray-300 px-4 py-2 bg-[#262626] focus:outline-none focus:ring-2 focus:ring-blue-500"
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

            {/* Assign Items Section */}
            <div>
                <h2 className="text-lg font-semibold text-[var(--color-text)] mb-2">Assign Items</h2>
                <div className="flex justify-end mb-2">
                    <button
                        onClick={onEditItems}
                        className="text-[var(--color-accent)] hover:underline px-4 py-2 rounded-lg"
                    >
                        Edit Items
                    </button>
                </div>
                <div className="grid gap-4">
                    {splittableItems.map((item) => (
                        <div
                            key={item.id}
                            className={`p-4 rounded-lg border ${item.name.toLowerCase() === 'tax' || item.name.toLowerCase() === 'tip'
                                ? 'bg-[#262626] border-gray-400'
                                : 'bg-[#1a1a1a] border-gray-600'
                                }`}
                        >
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-medium text-[var(--color-text)]">
                                    {item.name} {item.quantity > 1 && `(x${item.quantity})`}
                                </span>
                                <span className="font-semibold text-[var(--color-text)]">
                                    ${(item.price * item.quantity).toFixed(2)}
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {people.map(person => {
                                    const isAssigned = item.assignedTo.includes(person.id);
                                    const isDisabled = (item.name.toLowerCase() === 'tax' || item.name.toLowerCase() === 'tip');
                                    return (
                                        <button
                                            key={person.id}
                                            onClick={() => toggleItemAssignment(item.id, person.id)}
                                            disabled={isDisabled}
                                            className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${isAssigned
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-700 text-[var(--color-text)]'
                                                } ${isDisabled ? 'opacity-70 cursor-not-allowed' : 'hover:opacity-90'}`}
                                        >
                                            {person.name}
                                        </button>
                                    );
                                })}
                            </div>
                            {item.assignedTo.length > 0 && (
                                <div className="mt-2 text-sm text-[var(--color-text-secondary)]">
                                    Split: ${((item.price * item.quantity) / item.assignedTo.length).toFixed(2)} per person
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Bill Split Summary */}
            <div>
                <h2 className="text-lg font-semibold text-[var(--color-text)] mb-4">Bill Split Summary</h2>
                <div ref={summaryRef} className="bg-white rounded-lg p-6 shadow-lg">
                    <div className="text-center mb-4">
                        <h3 className="text-xl font-bold text-gray-900">Bill Split Summary</h3>
                        <p className="text-gray-500 text-sm">{new Date().toLocaleDateString()}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {people.map(person => (
                            <div key={person.id} className="p-4 bg-blue-50 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <UserIcon className="h-5 w-5 text-blue-700" />
                                    <h4 className="font-bold text-blue-900">{person.name}</h4>
                                </div>
                                <div className="text-lg font-bold text-blue-900 mb-2">
                                    Total: ${billSummary.perPerson[person.id]?.total.toFixed(2) || '0.00'}
                                </div>
                                <ul className="text-sm text-gray-600 space-y-1">
                                    {billSummary.perPerson[person.id]?.items.map(item => (
                                        <li key={item.id} className="flex justify-between">
                                            <span>{item.name}{item.quantity > 1 ? ` (x${item.quantity})` : ''}</span>
                                            <span>${item.share.toFixed(2)}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-200 text-center">
                        <div className="text-lg font-bold text-gray-900">
                            Total: ${billSummary.total.toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-500 mt-2">
                            Generated by Money Mate
                        </div>
                    </div>
                </div>
            </div>

            {/* Share Button with Dropdown */}
            <div className="flex justify-end relative">
                <button
                    onClick={() => setShowShareOptions(!showShareOptions)}
                    className="flex items-center gap-2 px-6 py-3 rounded-full bg-green-600 text-white font-semibold shadow hover:bg-green-700 transition-all"
                >
                    <ShareIcon className="h-5 w-5" />
                    Share
                </button>

                {showShareOptions && (
                    <div className="absolute bottom-full right-0 mb-2 bg-[#262626] border border-gray-600 rounded-lg shadow-lg p-2 z-10 w-48">
                        <button
                            onClick={copyToClipboard}
                            className="flex items-center gap-2 w-full py-2 px-3 hover:bg-gray-700 rounded text-left text-[var(--color-text)]"
                        >
                            <ClipboardIcon className="h-5 w-5 text-[var(--color-text-secondary)]" />
                            <span>{copied ? 'Copied!' : 'Copy as text'}</span>
                        </button>
                        <button
                            onClick={downloadAsImage}
                            className="flex items-center gap-2 w-full py-2 px-3 hover:bg-gray-700 rounded text-left text-[var(--color-text)]"
                        >
                            <DocumentArrowDownIcon className="h-5 w-5 text-[var(--color-text-secondary)]" />
                            <span>Download as image</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
} 