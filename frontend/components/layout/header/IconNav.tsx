"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Product } from "@/api/services/product.service";
import {
    User,
    Search,
    Heart,
    ShoppingCart,
    ArrowRightLeft,
    X,
} from "lucide-react";

import { getProducts } from "@/api/services/product.service";
import { getCart, removeCartItem, type Cart } from "@/api/services/cart.service";
import { useAuth } from "@/context/AuthContext";

import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { toast } from "react-toastify";

const API_URL = "http://127.0.0.1:8000";

function IconNav() {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchValue, setSearchValue] = useState("");
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [isCartOpen, setIsCartOpen] = useState(false);
    const [cart, setCart] = useState<Cart | null>(null);
    const [cartLoading, setCartLoading] = useState(false);
    const [removingItemId, setRemovingItemId] = useState<number | null>(null);

    const { isAuthenticated, isLoading } = useAuth();
    const cartRef = useRef<HTMLDivElement>(null);

    const compareItems = useSelector(
        (state: RootState) => state.compare.items
    );

    const compareCount = compareItems.length;
    const cartItems = cart?.items ?? [];

    const itemCount = cartItems.reduce((total, item) => {
        return total + (item.quantity || 0);
    }, 0);

    const totalPrice = cartItems.reduce((total, item) => {
        const unitPrice = Number(
            item.product.final_price ?? item.product.price
        );

        return total + unitPrice * item.quantity;
    }, 0);

    const icons = [
        { label: "Wishlist", href: "/wishlist", icon: Heart },
        { label: "Compare", href: "/compare", icon: ArrowRightLeft },
    ];

    const loadCart = useCallback(async () => {
        if (!isAuthenticated) {
            setCart(null);
            return;
        }

        try {
            setCartLoading(true);
            const data = await getCart();
            setCart(data);
        } catch (err) {
            console.error("Load cart error:", err);
            toast.error(
                err instanceof Error ? err.message : "Failed to load shopping cart."
            );
        } finally {
            setCartLoading(false);
        }
    }, [isAuthenticated]);

    // دریافت سبد خرید پس از آماده‌شدن وضعیت ورود کاربر
    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            void loadCart();
        } else if (!isLoading && !isAuthenticated) {
            setCart(null);
        }
    }, [isLoading, isAuthenticated, loadCart]);

    // هماهنگ‌کردن تعداد آیکون با تغییرات سبد خرید در سایر کامپوننت‌ها
    useEffect(() => {
        const handleCartUpdated = () => {
            void loadCart();
        };

        window.addEventListener("cartUpdated", handleCartUpdated);
        return () => window.removeEventListener("cartUpdated", handleCartUpdated);
    }, [loadCart]);

    // بستن پنجره سبد خرید با کلیک بیرون آن
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                cartRef.current &&
                !cartRef.current.contains(event.target as Node)
            ) {
                setIsCartOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // دریافت محصولات هنگام باز شدن جست‌وجو
    useEffect(() => {
        if (!isSearchOpen || products.length > 0) return;

        const fetchProducts = async () => {
            try {
                setLoading(true);
                setError("");

                const data = await getProducts();
                setProducts(data);
            } catch (err) {
                console.error("Search products error:", err);
                setError("Failed to load products.");
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [isSearchOpen, products.length]);

    // فیلتر کردن محصولات بر اساس نام
    const filteredProducts = products.filter((product) =>
        product.name
            .toLowerCase()
            .includes(searchValue.trim().toLowerCase())
    );

    const getImageUrl = (image: string | null) => {
        if (!image) return null;

        return image.startsWith("http")
            ? image
            : `${API_URL}${image}`;
    };

    const formatPrice = (price: string | number) => {
        return Number(price).toLocaleString("en-US");
    };

    const handleSearchToggle = () => {
        setIsSearchOpen((prev) => !prev);
        setSearchValue("");
    };

    const handleCartToggle = async () => {
        const nextOpen = !isCartOpen;
        setIsCartOpen(nextOpen);

        if (nextOpen && isAuthenticated) {
            await loadCart();
        }
    };

    const handleRemoveCartItem = async (itemId: number) => {
        try {
            setRemovingItemId(itemId);
            await removeCartItem(itemId);
            await loadCart();
            toast.success("Product removed from shopping cart.");
        } catch (err) {
            console.error("Remove cart item error:", err);
            toast.error(
                err instanceof Error
                    ? err.message
                    : "Failed to remove product from shopping cart."
            );
        } finally {
            setRemovingItemId(null);
        }
    };
    
    return (
        <div className="relative" ref={cartRef}>
            <ul className="flex items-center gap-4">
                <li>
                    <Link
                        href={isLoading ? "#" : isAuthenticated ? "/profile" : "/login"}
                        aria-label="Account"
                        aria-disabled={isLoading}
                        className={`rounded-md p-2 text-gray-600 transition-colors hover:text-blue-600 ${
                            isLoading ? "pointer-events-none opacity-50" : ""
                        }`}
                    >
                        <User strokeWidth={1.5} />
                    </Link>
                </li>

                {/* Search */}
                <li>
                    <button
                        type="button"
                        onClick={handleSearchToggle}
                        aria-label="Search products"
                        aria-expanded={isSearchOpen}
                        className="rounded-md p-2 text-gray-600 transition-colors hover:text-blue-600"
                    >
                        {isSearchOpen ? (
                            <X strokeWidth={1.5} />
                        ) : (
                            <Search strokeWidth={1.5} />
                        )}
                    </button>
                </li>

                {icons.map((item) => {
                    const Icon = item.icon;

                    return (
                        <li key={item.label} className="relative">
                            <Link
                                href={item.href}
                                aria-label={item.label}
                                className="rounded-md p-2 text-gray-600 transition-colors hover:text-blue-600 relative flex items-center"
                            >
                                <Icon strokeWidth={1.5} />

                                {item.label === "Compare" && compareCount > 0 && (
                                    <span className="absolute -right-1 top-0 h-5 w-5 rounded-full bg-orange-500 text-xs font-bold text-white flex items-center justify-center min-w-5">
                                        {compareCount}
                                    </span>
                                )}
                            </Link>
                        </li>
                    );
                })}

                {/* Shopping Cart */}
                <li className="relative">
                    <button
                        type="button"
                        onClick={handleCartToggle}
                        aria-label="Shopping Cart"
                        aria-expanded={isCartOpen}
                        className="text-gray-600 hover:text-blue-600 rounded-md flex items-center relative transition-colors"
                    >
                        <ShoppingCart strokeWidth={1.5} />
                        {itemCount > 0 && (
                            <span className="absolute -right-3 -top-3 h-5 w-5 rounded-full bg-red-500 text-xs font-bold text-white flex items-center justify-center min-w-5">
                                {itemCount}
                            </span>
                        )}
                    </button>

                    {isCartOpen && (
                        <div className="absolute right-0 top-full mt-2 w-104.25 bg-white border border-gray-200 rounded-xl shadow-2xl z-50">
                            <div className="flex items-center justify-between p-4 border-b border-gray-200">
                                <h3 className="text-lg font-bold text-gray-900">
                                    Shopping Cart
                                </h3>
                                <button
                                    type="button"
                                    onClick={() => setIsCartOpen(false)}
                                    className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                                    aria-label="Close shopping cart"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="max-h-80 overflow-y-auto p-4">
                                {cartLoading ? (
                                    <p className="text-center text-gray-500 py-8">
                                        Loading shopping cart...
                                    </p>
                                ) : !isAuthenticated ? (
                                    <p className="text-center text-gray-500 py-8">
                                        Please log in to view your shopping cart.
                                    </p>
                                ) : cartItems.length === 0 ? (
                                    <p className="text-center text-gray-500 py-8">
                                        Shopping cart is empty.
                                    </p>
                                ) : (
                                    cartItems.map((item) => {
                                        const imageUrl = getImageUrl(item.product.image);
                                        const unitPrice =
                                            item.product.final_price ?? item.product.price;

                                        return (
                                            <div
                                                key={item.id}
                                                className="flex items-center gap-3 p-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 rounded-lg"
                                            >
                                                <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                                                    {imageUrl ? (
                                                        <img
                                                            src={imageUrl}
                                                            alt={item.product.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                                                            No Image
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-medium text-sm text-gray-900 truncate">
                                                        {item.product.name}
                                                    </h4>
                                                    {item.variant && (
                                                        <p className="text-xs text-gray-500 mt-1 truncate">
                                                            {[
                                                                item.variant.color,
                                                                item.variant.size,
                                                            ]
                                                                .filter(Boolean)
                                                                .join(" / ")}
                                                        </p>
                                                    )}
                                                    <p className="text-sm font-bold text-gray-900">
                                                        {item.quantity} × Rp {formatPrice(unitPrice)}
                                                    </p>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveCartItem(item.id)}
                                                    disabled={removingItemId === item.id}
                                                    aria-label={`Remove ${item.product.name} from cart`}
                                                    className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-all disabled:opacity-50"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-lg font-bold">
                                        Total: Rp {formatPrice(totalPrice)}
                                    </span>
                                </div>
                                <Link
                                    href="/shopping-cart"
                                    onClick={() => setIsCartOpen(false)}
                                    className="block w-full bg-linear-to-r from-yellow-500 to-yellow-600 text-white text-center py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                                >
                                    View Cart
                                </Link>
                            </div>
                        </div>
                    )}
                </li>
            </ul>

            {/* Search Box */}
            {isSearchOpen && (
                <div className="absolute top-full right-0 z-50 mt-4 w-80 sm:w-100 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
                    {/* Input */}
                    <div className="p-3">
                        <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3">
                            <Search
                                size={20}
                                className="text-gray-400 shrink-0"
                            />

                            <input
                                type="text"
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                                placeholder="Search products..."
                                autoFocus
                                className="w-full h-12 outline-none text-sm"
                            />

                            {searchValue && (
                                <button
                                    type="button"
                                    onClick={() => setSearchValue("")}
                                    aria-label="Clear search"
                                >
                                    <X size={18} className="text-gray-400" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Results */}
                    <div className="max-h-100 overflow-y-auto">
                        {loading && (
                            <p className="text-center text-gray-500 py-6">
                                Loading products...
                            </p>
                        )}

                        {!loading && error && (
                            <p className="text-center text-red-500 py-6">
                                {error}
                            </p>
                        )}

                        {!loading &&
                            !error &&
                            searchValue.trim() !== "" &&
                            filteredProducts.length === 0 && (
                                <p className="text-center text-gray-500 py-6">
                                    No products found.
                                </p>
                            )}

                        {!loading &&
                            !error &&
                            searchValue.trim() === "" && (
                                <p className="text-center text-gray-400 py-6 text-sm">
                                    Start typing to search products.
                                </p>
                            )}

                        {!loading &&
                            !error &&
                            searchValue.trim() !== "" &&
                            filteredProducts.map((product) => {
                                const imageUrl = getImageUrl(product.image);

                                return (
                                    <Link
                                        key={product.id}
                                        href={`/product/${product.id}`}
                                        onClick={() => {
                                            setIsSearchOpen(false);
                                            setSearchValue("");
                                        }}
                                        className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors border-t border-gray-100"
                                    >
                                        {imageUrl ? (
                                            <img
                                                src={imageUrl}
                                                alt={product.name}
                                                className="w-16 h-16 rounded-lg object-cover bg-gray-100"
                                            />
                                        ) : (
                                            <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center text-xs text-gray-400">
                                                No Image
                                            </div>
                                        )}

                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-sm text-gray-800 truncate">
                                                {product.name}
                                            </p>

                                            <p className="text-sm text-gray-500 mt-1">
                                                {formatPrice(
                                                    product.final_price ?? product.price
                                                )}
                                            </p>
                                        </div>
                                    </Link>
                                );
                            })}
                    </div>
                </div>
            )}
        </div>
    );
}

export default IconNav;
