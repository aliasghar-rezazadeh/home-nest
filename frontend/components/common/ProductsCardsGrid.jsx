
"use client";

import { useEffect, useState } from "react";
import Product from "./Product";
import { getProducts } from "@/api/services/product.service";

export const ProductsCardsGrid = ({
    nameH1 = "Our Products",
    initialLimit = 8,
    maxLimit = 20,
    categoryId = undefined,
}) => {
    const [products, setProducts] = useState([]);
    const [displayCount, setDisplayCount] = useState(initialLimit);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                setError("");
                setDisplayCount(initialLimit);

                const data = await getProducts(categoryId);
                setProducts(data);
            } catch (err) {
                console.error("Products error:", err);
                setError("Failed to load products.");
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [categoryId, initialLimit]);

    const handleShowMore = () => {
        setDisplayCount((prev) => Math.min(prev + 4, maxLimit));
    };

    const limitedProducts = products.slice(
        0,
        Math.min(displayCount, maxLimit)
    );

    const hasMore =
        displayCount < products.length && displayCount < maxLimit;

    return (
        <div className="flex flex-col items-center my-15 2xl:px-25.5">

            {/* Section Title */}
            <p className="font-bold text-[30px] mb-4">
                {nameH1}
            </p>

            {/* Loading */}
            {loading && (
                <p className="text-gray-500 mt-4">
                    Loading products...
                </p>
            )}

            {/* Error */}
            {!loading && error && (
                <p className="text-red-500 mt-4">
                    {error}
                </p>
            )}

            {/* Empty Products */}
            {!loading && !error && products.length === 0 && (
                <p className="text-gray-500 mt-4">
                    No products found.
                </p>
            )}

            {/* Products Grid */}
            {!loading && !error && products.length > 0 && (
                <>
                    <div className="flex flex-row flex-wrap content-center justify-center items-center 2xl:grid 2xl:grid-cols-4 2xl:gap-1.5">
                        {limitedProducts.map((productData) => (
                            <Product
                                key={productData.id}
                                data={productData}
                            />
                        ))}
                    </div>

                    {/* Show More */}
                    {hasMore && (
                        <button
                            onClick={handleShowMore}
                            className="Action_Buttun text-base-medium w-61.25 h-15 text-custom-main bg-white mt-4 border-2 border-custom-main hover:bg-custom-main hover:text-white hover:border-none transition-all"
                        >
                            <span>
                                Show More ({products.length - displayCount} left)
                            </span>
                        </button>
                    )}

                    {/* All Products Loaded */}
                    {!hasMore && displayCount >= products.length && (
                        <p className="text-gray-500 mt-4">
                            All products loaded.!!
                        </p>
                    )}
                </>
            )}
        </div>
    );
};

export default ProductsCardsGrid;
