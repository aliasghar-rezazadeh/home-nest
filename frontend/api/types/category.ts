export interface Category {
    id: number;
    name: string;
    image: string | null;
    products_count: number;
    description: string;
    created_at: string;
}

export interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}
