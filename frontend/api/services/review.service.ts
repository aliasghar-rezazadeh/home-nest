
import {
    getAccessToken,
    refreshAccessToken,
} from "./auth.service";

const API_URL = "http://127.0.0.1:8000/api";

export interface ProductReview {
    id: number;
    user: string;
    is_mine: boolean;
    rating: number;
    comment: string;
    created_at: string;
    updated_at: string;
}

const reviewRequest = async (
    path: string,
    options: RequestInit = {},
    requireAuth = false
) => {
    let token = getAccessToken();

    if (requireAuth && !token) {
        throw new Error("برای ثبت نظر ابتدا وارد حساب خود شوید.");
    }

    const sendRequest = (accessToken: string | null) =>
        fetch(`${API_URL}${path}`, {
            ...options,
            headers: {
                ...(options.headers as Record<string, string> | undefined),
                ...(accessToken
                    ? { Authorization: `Bearer ${accessToken}` }
                    : {}),
            },
        });

    let response = await sendRequest(token);

    if (response.status === 401 && token) {
        token = await refreshAccessToken();
        response = await sendRequest(token);
    }

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
        const message =
            result.detail ||
            result.rating ||
            result.comment ||
            result.non_field_errors?.[0] ||
            "خطا در ارتباط با سیستم نظرات.";

        throw new Error(
            typeof message === "string"
                ? message
                : JSON.stringify(message)
        );
    }

    return result;
};

// دریافت نظرات یک محصول
export const getProductReviews = (
    productId: number
): Promise<ProductReview[]> => {
    return reviewRequest(`/products/${productId}/reviews/`);
};

// ثبت نظر جدید
export const createReview = (
    productId: number,
    rating: number,
    comment: string
): Promise<ProductReview> => {
    return reviewRequest(
        `/products/${productId}/reviews/`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ rating, comment }),
        },
        true
    );
};

// ویرایش نظر
export const updateReview = (
    reviewId: number,
    rating: number,
    comment: string
): Promise<ProductReview> => {
    return reviewRequest(
        `/reviews/${reviewId}/`,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ rating, comment }),
        },
        true
    );
};

// حذف نظر
export const deleteReview = (reviewId: number) => {
    return reviewRequest(
        `/reviews/${reviewId}/`,
        {
            method: "DELETE",
        },
        true
    );
};
