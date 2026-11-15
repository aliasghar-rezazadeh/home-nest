
"use client";

import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
    removeFromCompare,
    clearCompare,
} from "@/redux/slices/compareSlice";

import type { RootState, AppDispatch } from "@/redux/store";

const API_URL = "http://127.0.0.1:8000";

export default function ComparePage() {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();

    const compareItems = useSelector(
        (state: RootState) => state.compare.items
    );

    const renderCell = (
        item: (typeof compareItems)[number],
        key: string,
        formatFn?: (value: any, item: (typeof compareItems)[number]) => React.ReactNode
    ) => {
        const value = (item as any)?.[key];

        return formatFn ? formatFn(value, item) : (value ?? "-");
    };

    if (!compareItems?.length) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center p-12 bg-white rounded-3xl shadow-2xl">
                    <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-8 flex items-center justify-center">
                        <span className="text-3xl">⚖️</span>
                    </div>

                    <h2 className="text-3xl font-bold text-gray-800 mb-4">
                        No items to compare
                    </h2>

                    <p className="text-gray-500 mb-8">
                        Choose products to compare their features
                    </p>

                    <Link
                        href="/shop"
                        className="bg-linear-to-r from-yellow-500 to-yellow-600 text-white px-8 py-3 rounded-2xl font-semibold hover:bg-blue-700 transition-all"
                    >
                        Continue Shopping
                    </Link>
                </div>
            </div>
        );
    }

    const LABEL_WIDTH = 180;

    const cellBorder = "border-r border-gray-300";
    const rowBorder = "border-b border-gray-300";

    const columns = [
        {
            label: "Original Price",
            key: "price",
            format: (value: string | number) =>
                `${Number(value).toLocaleString("en-US")}`,
        },
        {
            label: "Price after discount",
            key: "final_price",
            format: (value: string | number) =>
                `${Number(value).toLocaleString("en-US")}`,
        },
        {
            label: "SKU",
            key: "sku",
        },
        {
            label: "Stock",
            key: "stock",
            format: (value: number) =>
                value > 0 ? `${value} available` : "Out of stock",
        },
        {
            label: "Rating",
            key: "average_rating",
            format: (value: number) => `${Number(value ?? 0).toFixed(1)} / 5`,
        },
        {
            label: "Discount",
            key: "discount_percentage",
            format: (value: number) => `${value ?? 0}%`,
        },
        {
            label: "Category",
            key: "category_name",
        },
        {
            label: "Variants",
            key: "variants",
            format: (value: any[]) =>
                value?.length
                    ? value.map((variant) => (
                        <div
                            key={variant.id}
                            className="mb-2"
                        >
                            {variant.color} / {variant.size}
                            <span className="block text-gray-500 text-sm">
                                Stock: {variant.stock}
                            </span>
                        </div>
                    ))
                    : "No variants",
        },
    ];

    return (
        <div className="p-6">

            {/* Header Actions */}
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold">
                        Compare Products
                    </h1>

                    <p className="text-gray-600 mt-1">
                        ({compareItems.length} items selected)
                    </p>
                </div>

                <div className="flex gap-3">
                    <Link
                        href="/shop"
                        className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition"
                    >
                        Add Compare
                    </Link>

                    <button
                        onClick={() => dispatch(clearCompare())}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                    >
                        Clear All
                    </button>
                </div>
            </div>

            {/* Comparison Table */}
            <div className="overflow-x-auto border border-gray-300 rounded-lg">
                <div className="w-full min-w-max">

                    {/* IMAGE ROW */}
                    <div className={`flex ${rowBorder}`}>
                        <p
                            className={`sticky left-0 z-30 bg-gray-100 p-4 font-semibold ${cellBorder} shrink-0`}
                            style={{
                                width: LABEL_WIDTH,
                                minWidth: LABEL_WIDTH,
                            }}
                        >
                            Image
                        </p>

                        {compareItems.map((item) => {
                            const imageUrl = item.image
                                ? item.image.startsWith("http")
                                    ? item.image
                                    : `${API_URL}${item.image}`
                                : null;

                            return (
                                <div
                                    key={item.id}
                                    className={`p-4 text-center ${cellBorder} bg-white min-w-55 flex-1`}
                                >
                                    {imageUrl ? (
                                        <img
                                            src={imageUrl}
                                            alt={item.name}
                                            className="mx-auto h-24 w-24 object-cover rounded"
                                        />
                                    ) : (
                                        <div className="mx-auto h-24 w-24 bg-gray-200 flex items-center justify-center text-gray-500 rounded">
                                            No Image
                                        </div>
                                    )}

                                    <h4 className="mt-2 font-semibold">
                                        {item.name}
                                    </h4>

                                    <Link
                                        href={`/product/${item.id}`}
                                        className="text-blue-600 text-sm hover:underline"
                                    >
                                        View More
                                    </Link>
                                </div>
                            );
                        })}
                    </div>

                    {/* DATA ROWS */}
                    {columns.map((column) => (
                        <div
                            key={column.key}
                            className={`flex ${rowBorder}`}
                        >
                            <p
                                className={`sticky left-0 z-30 bg-gray-50 p-4 font-semibold ${cellBorder} shrink-0`}
                                style={{
                                    width: LABEL_WIDTH,
                                    minWidth: LABEL_WIDTH,
                                }}
                            >
                                {column.label}
                            </p>

                            {compareItems.map((item) => (
                                <div
                                    key={item.id}
                                    className={`p-4 text-center ${cellBorder} bg-white min-w-55 flex-1`}
                                >
                                    {renderCell(
                                        item,
                                        column.key,
                                        column.format
                                    )}
                                </div>
                            ))}
                        </div>
                    ))}

                    {/* ACTIONS */}
                    <div className="flex">
                        <p
                            className={`sticky left-0 z-30 bg-gray-50 p-4 font-semibold ${cellBorder} shrink-0`}
                            style={{
                                width: LABEL_WIDTH,
                                minWidth: LABEL_WIDTH,
                            }}
                        >
                            Actions
                        </p>

                        {compareItems.map((item) => (
                            <div
                                key={item.id}
                                className={`p-4 text-center ${cellBorder} bg-white min-w-55 flex-1 flex flex-col items-center gap-2`}
                            >
                                <Link
                                    href={`/product/${item.id}`}
                                    className="text-blue-600 hover:underline"
                                >
                                    View More
                                </Link>

                                <button
                                    onClick={() =>
                                        dispatch(removeFromCompare(item.id))
                                    }
                                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>

                </div>
            </div>
        </div>
    );
}
