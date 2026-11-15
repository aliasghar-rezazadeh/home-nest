
const API_URL = "http://127.0.0.1:8000/api";

export interface Category {
    id: number;
    name: string;
    image: string | null;
    products_count: number;
    description: string;
}

export interface Product {
    id: number;
    name: string;
    sku: string | null;
    description: string;
    price: string;
    discount_percentage: number;
    final_price: string;
    is_featured: boolean;
    stock: number;
    image: string | null;
    category: Category;
    tags: {
        id: number;
        name: string;
    }[];
    variants: any[];
    average_rating: number;
    reviews_count: number;
}

interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

export const getProducts = async (
    categoryId?: number
): Promise<Product[]> => {
    const url = new URL(`${API_URL}/products/`);

    if (categoryId !== undefined) {
        url.searchParams.set("category", String(categoryId));
    }

    const response = await fetch(url.toString(), {
        cache: "no-store",
    });

    if (!response.ok) {
        throw new Error("Failed to fetch products");
    }

    const data: PaginatedResponse<Product> | Product[] =
        await response.json();

    return Array.isArray(data) ? data : data.results;
};

export const getProductById = async (
    id: number | string
): Promise<Product> => {
    const response = await fetch(`${API_URL}/products/${id}/`, {
        cache: "no-store",
    });

    if (!response.ok) {
        throw new Error("Failed to fetch product");
    }

    return response.json();
};
