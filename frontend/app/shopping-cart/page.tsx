
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";

import Product from "@/components/common/Product";
import { getCart } from "@/api/services/cart.service";
import type { CartItem } from "@/api/services/cart.service";

const ShoppingCartPage = () => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let isMounted = true;

        const fetchCart = async () => {
            try {
                setLoading(true);
                setError("");

                const cart = await getCart();

                if (isMounted) {
                    setCartItems(cart.items || []);
                }
            } catch (err) {
                console.error("Shopping cart error:", err);

                if (isMounted) {
                    setError(
                        err instanceof Error
                            ? err.message
                            : "Failed to load shopping cart."
                    );
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchCart();

        const handleCartUpdate = () => {
            fetchCart();
        };

        window.addEventListener("cartUpdated", handleCartUpdate);

        return () => {
            isMounted = false;
            window.removeEventListener("cartUpdated", handleCartUpdate);
        };
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <p className="text-gray-500">
                    Loading shopping cart...
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center p-12 bg-white rounded-3xl shadow-2xl">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">
                        Unable to load shopping cart
                    </h2>

                    <p className="text-gray-500 mb-8">
                        {error}
                    </p>

                    <Link
                        href="/login"
                        className="bg-linear-to-r from-yellow-500 to-yellow-600 text-white px-8 py-3 rounded-2xl font-semibold hover:bg-blue-700 transition-all"
                    >
                        Login
                    </Link>
                </div>
            </div>
        );
    }

    if (!cartItems.length) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center p-12 bg-white rounded-3xl shadow-2xl">
                    <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-8 flex items-center justify-center">
                        <span className="text-3xl">
                            <ShoppingCart size={32} strokeWidth={1.5} />
                        </span>
                    </div>

                    <h2 className="text-3xl font-bold text-gray-800 mb-4">
                        No items to Shoping Cart
                    </h2>

                    <p className="text-gray-500 mb-8">
                        Choose products to Shoping Cart their features
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

    return (
        <div className="flex flex-col items-center my-15">
            <p className="font-bold text-[30px] mb-4">
                shopping cart
            </p>

            <div className="flex flex-row flex-wrap content-center justify-center items-center">
                {cartItems.map((item) => (
                    <Product
                        key={item.id}
                        data={item.product}
                    />
                ))}
            </div>
        </div>
    );
};

export default ShoppingCartPage;
