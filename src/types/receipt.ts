export interface ReceiptItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    assignedTo: string[];
}

export interface Person {
    id: string;
    name: string;
}

export interface BillSummary {
    total: number;
    perPerson: {
        [key: string]: {
            total: number;
            items: {
                id: string;
                name: string;
                price: number;
                quantity: number;
                share: number;
            }[];
        };
    };
} 