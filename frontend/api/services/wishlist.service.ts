
import { getAccessToken } from "./auth.service";
import type { Product } from "./product.service";

const API_URL = "http://127.0.0.1:8000/api";

export interface WishlistItem {
    id: number;
    product: Product;
    created_at: string;
}

export interface Wishlist {
    id: number;
    items: WishlistItem[];
    created_at: string;
    updated_at: string;
}

export interface ToggleWishlistResponse {
    product_id: number;
    is_favorite: boolean;
    message: string;
}

// دریافت لیست علاقه‌مندی‌ها
export const getWishlist = async (): Promise<Wishlist> => {
    const token = getAccessToken();

    const response = await fetch(`${API_URL}/wishlist/`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(
            result.detail || "Failed to load wishlist."
        );
    }

    return result;
};

// اضافه یا حذف کردن محصول از علاقه‌مندی‌ها
export const toggleWishlistItem = async (
    productId: number
): Promise<ToggleWishlistResponse> => {
    const token = getAccessToken();

    const response = await fetch(`${API_URL}/wishlist/toggle/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            product_id: productId,
        }),
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(
            result.detail || "Failed to update wishlist."
        );
    }

    return result;
};
