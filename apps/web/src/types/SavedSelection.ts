export default interface SavedSelection {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface SavedSelectionProduct {
    id: string;
    selectionId: string;
    productId: string;
    position: number;
}
