
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { HeartCrack } from "lucide-react";

import Product from "@/components/common/Product";
import { getWishlist, type WishlistItem } from "@/api/services/wishlist.service";
import { getAccessToken } from "@/api/services/auth.service";

export default function WishlistPage() {
    const router = useRouter();

    const [items, setItems] = useState<WishlistItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchWishlist = async () => {
            if (!getAccessToken()) {
                router.replace("/login");
                return;
            }

            try {
                const data = await getWishlist();
                setItems(data.items);
            } catch (error) {
                console.error("Wishlist error:", error);
                setError(
                    error instanceof Error
                        ? error.message
                        : "Failed to load wishlist."
                );
            } finally {
                setIsLoading(false);
            }
        };

        fetchWishlist();
    }, [router]);

    // Remove product from wishlist immediately
    const handleRemoveFromWishlist = (productId: number) => {
        setItems((prevItems) =>
            prevItems.filter(
                (item) => item.product.id !== productId
            )
        );
    };

    // Loading
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-500">
                    Loading wishlist...
                </p>
            </div>
        );
    }

    // Error
    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-500 mb-4">{error}</p>

                    <button
                        onClick={() => window.location.reload()}
                        className="bg-[#B88E2F] text-white px-6 py-3 rounded-xl"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    // Empty Wishlist
    if (!items.length) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <div className="text-center p-12 bg-white rounded-3xl shadow-2xl max-w-lg">

                    <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-8 flex items-center justify-center">
                        <HeartCrack size={38} className="text-gray-500" />
                    </div>

                    <h2 className="text-3xl font-bold text-gray-800 mb-4">
                        No items to Wishlist
                    </h2>

                    <p className="text-gray-500 mb-8">
                        Choose products to Wishlist their features.
                    </p>

                    <Link
                        href="/shop"
                        className="inline-block bg-linear-to-r from-yellow-500 to-yellow-600 text-white px-8 py-3 rounded-2xl font-semibold hover:opacity-90 transition-all"
                    >
                        Continue Shopping
                    </Link>

                </div>
            </div>
        );
    }

    // Wishlist Products
    return (
        <div className="flex flex-col items-center my-15">

            <h1 className="font-bold text-[30px] mb-4">
                List of likes
            </h1>

            <div className="flex flex-row flex-wrap content-center justify-center items-center gap-6">

                {items.map((item) => (
                    <Product
                        key={item.id}
                        data={item.product}
                        onWishlistChange={handleRemoveFromWishlist}
                    />
                ))}

            </div>

        </div>
    );
}
