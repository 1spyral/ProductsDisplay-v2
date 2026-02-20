export interface ProductImageDto {
    id: string;
    productId: string;
    createdAt: Date;
    objectKey: string;
    mimeType: string;
    width: number;
    height: number;
    position: number;
}

export interface ProductDto {
    id: string;
    name: string | null;
    description: string | null;
    category: string | null;
    price: string | null;
    clearance: boolean;
    soldOut: boolean;
    hidden: boolean;
    images?: ProductImageDto[];
}

export interface CategoryDto {
    category: string;
    name: string | null;
    displayOrder: number;
}

export interface StoreInfoDto {
    id: number;
    name: string | null;
    headline: string | null;
    description: string | null;
    copyright: string | null;
    backgroundImageUrl: string | null;
}

export interface SavedSelectionDto {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface SavedSelectionOverviewDto {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    products: {
        position: number;
        product: {
            id: string;
            name: string | null;
            images?: { objectKey: string; position: number }[];
        };
    }[];
}

export type ApiErrorDto = {
    error: string;
    message?: string;
};
