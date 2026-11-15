
"use client";

import { useEffect, useState } from "react";
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
import { useAuth } from "@/context/AuthContext";

import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";

const API_URL = "http://127.0.0.1:8000";

function IconNav() {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchValue, setSearchValue] = useState("");
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const { isAuthenticated, isLoading } = useAuth();

    const compareItems = useSelector(
        (state: RootState) => state.compare.items
    );

    const compareCount = compareItems.length;

    const icons = [
        {
            label: "Account",
            href: isAuthenticated ? "/profile" : "/login",
            icon: User,
        },
        { label: "Wishlist", href: "/wishlist", icon: Heart },
        { label: "Compare", href: "/compare", icon: ArrowRightLeft },
        { label: "Cart", href: "/shopping-cart", icon: ShoppingCart },
    ];

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

    return (
        <div className="relative">
            <ul className="flex items-center gap-4">
                {icons.slice(0, 1).map((item) => {
                    const Icon = item.icon;

                    return (
                        <li key={item.label}>
                            <Link
                                href={isLoading ? "#" : item.href}
                                aria-label={item.label}
                                aria-disabled={isLoading}
                                className={`rounded-md p-2 text-gray-600 transition-colors hover:text-blue-600 ${
                                    isLoading
                                        ? "pointer-events-none opacity-50"
                                        : ""
                                }`}
                            >
                                <Icon strokeWidth={1.5} />
                            </Link>
                        </li>
                    );
                })}

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

                {icons.slice(1).map((item) => {
                    const Icon = item.icon;

                    return (
                        <li key={item.label} className="relative">
                            <Link
                                href={item.href}
                                aria-label={item.label}
                                className="rounded-md p-2 text-gray-600 transition-colors hover:text-blue-600 relative flex items-center"
                            >
                                <Icon strokeWidth={1.5} />

                                {item.label === "Compare" &&
                                    compareCount > 0 && (
                                        <span className="absolute -right-3 -top-3 h-5 w-5 rounded-full bg-orange-500 text-xs font-bold text-white flex items-center justify-center min-w-5">
                                            {compareCount}
                                        </span>
                                    )}
                            </Link>
                        </li>
                    );
                })}
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
                                onChange={(e) =>
                                    setSearchValue(e.target.value)
                                }
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
                                    <X
                                        size={18}
                                        className="text-gray-400"
                                    />
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
