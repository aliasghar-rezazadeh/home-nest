
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

        removeFromCompare: (state, action: PayloadAction<number>) => {
            state.items = state.items.filter(
                (item) => item.id !== action.payload
            );
        },

        clearCompare: (state) => {
            state.items = [];
        },
    },
});

export const {
    addToCompare,
    removeFromCompare,
    clearCompare,
} = compareSlice.actions;

export default compareSlice.reducer;
