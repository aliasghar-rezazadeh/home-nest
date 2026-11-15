
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface CompareProduct {
    id: number;
    name: string;
    sku: string | null;
    description: string;
    price: string | number;
    final_price: string | number;
    stock: number;
    image: string | null;
    category: number | null;
    category_name?: string;
    average_rating: number;
    discount_percentage: number;
    variants?: {
        id: number;
        color: string;
        size: string;
        stock: number;
    }[];
}

interface CompareState {
    items: CompareProduct[];
}

const initialState: CompareState = {
    items: [],
};

const compareSlice = createSlice({
    name: "compare",
    initialState,
    reducers: {
        // افزودن یا حذف محصول از لیست مقایسه
        addToCompare: (state, action: PayloadAction<CompareProduct>) => {
            const exists = state.items.some(
                (item) => item.id === action.payload.id
            );

            if (exists) {
                state.items = state.items.filter(
                    (item) => item.id !== action.payload.id
                );
            } else {
                state.items.push(action.payload);
            }
        },

        // حذف یک محصول از لیست مقایسه
        removeFromCompare: (state, action: PayloadAction<number>) => {
            state.items = state.items.filter(
                (item) => item.id !== action.payload
            );
        },

        // پاک کردن تمام محصولات مقایسه
        clearCompare: (state) => {
            state.items = [];
        },

        // بازیابی محصولات ذخیره شده
        setCompareItems: (
            state,
            action: PayloadAction<CompareProduct[]>
        ) => {
            state.items = action.payload;
        },
    },
});

export const {
    addToCompare,
    removeFromCompare,
    clearCompare,
    setCompareItems,
} = compareSlice.actions;

export default compareSlice.reducer;
