import { getAccessToken, refreshAccessToken } from "./auth.service";
import type { Product } from "./product.service";

const API_URL = "http://127.0.0.1:8000/api";

const notifyCartUpdated = () => {
    if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("cartUpdated"));
    }
};

export interface CartVariant {
    id: number;
    color: string;
    size: string;
    stock: number;
}

export interface CartItem {
    id: number;
    product: Product;
    variant: CartVariant | null;
    quantity: number;
    total_price: string;
    created_at: string;
    updated_at: string;
}

export interface Cart {
    id: number;
    items: CartItem[];
    total_price: string;
    created_at: string;
    updated_at: string;
}

const cartRequest = async (path: string, options: RequestInit = {}) => {
    let token = getAccessToken();

    if (!token) {
        throw new Error("برای استفاده از سبد خرید ابتدا وارد حساب خود شوید.");
    }

    const sendRequest = (accessToken: string) =>
        fetch(`${API_URL}${path}`, {
            ...options,
            headers: {
                ...(options.headers as Record<string, string> | undefined),
                Authorization: `Bearer ${accessToken}`,
            },
        });

    let response = await sendRequest(token);

    if (response.status === 401) {
        token = await refreshAccessToken();
        response = await sendRequest(token);
    }

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
        const message =
            result.detail ||
            result.variant_id ||
            result.quantity ||
            result.non_field_errors?.[0] ||
            "خطا در ارتباط با سبد خرید.";

        throw new Error(
            typeof message === "string" ? message : JSON.stringify(message)
        );
    }

    return result;
};

export const getCart = async (): Promise<Cart> => {
    return cartRequest("/cart/", {
        method: "GET",
        cache: "no-store",
    });
};

export const updateCartItem = async (itemId: number, quantity: number) => {
    const result = await cartRequest(`/cart/items/${itemId}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
    });
    notifyCartUpdated();
    return result;
};

export const addCartItem = async (
    productId: number,
    variantId: number | null,
    quantity: number
): Promise<Cart> => {
    if (!Number.isInteger(quantity) || quantity < 1) {
        throw new Error("تعداد انتخاب‌شده معتبر نیست.");
    }

    const cart = await getCart();
    const existingItem = cart.items.find(
        (item) =>
            item.product.id === productId &&
            (item.variant?.id ?? null) === variantId
    );

    if (existingItem) {
        await updateCartItem(existingItem.id, existingItem.quantity + quantity);
        return getCart();
    }

    await cartRequest("/cart/items/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            product_id: productId,
            ...(variantId !== null ? { variant_id: variantId } : {}),
        }),
    });

    if (quantity > 1) {
        const updatedCart = await getCart();
        const newItem = updatedCart.items.find(
            (item) =>
                item.product.id === productId &&
                (item.variant?.id ?? null) === variantId
        );

        if (!newItem) {
            throw new Error("محصول در سبد خرید پیدا نشد.");
        }

        await updateCartItem(newItem.id, quantity);
    }

    const updatedCart = await getCart();
    notifyCartUpdated();
    return updatedCart;
};


export const removeCartItem = async (itemId: number) => {
    const result = await cartRequest(`/cart/items/${itemId}/remove/`, {
        method: "DELETE",
    });
    notifyCartUpdated();
    return result;
};
