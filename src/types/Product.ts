export interface ProductImage {
    id: string;
    productId: string;
    createdAt: Date;
    objectKey: string;
    mimeType: string;
    width: number;
    height: number;
    position: number;
}

export default interface Product {
    id: string;
    name: string | null;
    description: string | null;
    category: string;
    images?: ProductImage[];
}
