
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SlidersHorizontal, LayoutGrid } from "lucide-react";

import BannerTopPage from "@/components/common/BannerTopPage";
import ServiceHighlights from "@/components/common/ServiceHighlights";
import Product from "@/components/common/Product";
import { getProducts } from "@/api/services/product.service";

const ShowProduct = 8;

function Shop() {
    const [products, setProducts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(ShowProduct);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                setError("");

                const data = await getProducts();
                setProducts(data);
            } catch (err) {
                console.error("Shop products error:", err);
                setError("Failed to load products.");
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    const handleItemsPerPageChange = (e) => {
        const raw = e.target.value;
        const value = raw === "" ? ShowProduct : Number(raw);

        if (!Number.isFinite(value) || value < 1) return;

        setItemsPerPage(value);
        setCurrentPage(1);
    };

    const totalPages = Math.ceil(products.length / itemsPerPage);

    const currentProducts = products.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const goToPage = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    return (
        <>
            <BannerTopPage pageName="Shop" />

            <div className="w-full h-25 flex items-center justify-around bg-gold-100">
                <div className="flex gap-7">
                    <p className="flex gap-2">
                        <SlidersHorizontal />
                        Filter
                    </p>

                    <LayoutGrid />

                    <img
                        src="/assets/images/SVG/bi_view-list.svg"
                        alt="List view"
                        className="w-6 h-6 object-contain"
                    />

                    <p className="border-l pl-8.5">
                        Showing {products.length > 0 ? startIndex + 1 : 0}–
                        {Math.min(endIndex, products.length)} of {products.length} results
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <p>Show</p>

                    <input
                        type="number"
                        placeholder={ShowProduct}
                        onChange={handleItemsPerPageChange}
                        className="h-13.75 w-13.75 bg-white p-4.25"
                    />

                    <p className="pl-4">Short by</p>

                    <input
                        type="text"
                        placeholder="Default"
                        className="p-4.25 bg-white w-47"
                    />
                </div>
            </div>

            <div className="flex flex-col items-center my-15 2xl:px-25.5">
                {loading && (
                    <p className="text-gray-500 mt-8">
                        Loading products...
                    </p>
                )}

                {!loading && error && (
                    <p className="text-red-500 mt-8">{error}</p>
                )}

                {!loading && !error && products.length === 0 && (
                    <p className="text-gray-500 mt-8">
                        No products found.
                    </p>
                )}

                {!loading && !error && products.length > 0 && (
                    <div className="flex flex-row flex-wrap content-center justify-center items-center 2xl:grid 2xl:grid-cols-4 2xl:gap-1.5">
                        {currentProducts.map((product) => (
                            <Product
                                key={product.id}
                                data={product}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Pagination */}
            {!loading && !error && totalPages > 1 && (
                <div className="flex flex-wrap justify-center items-center gap-2 p-8 mx-auto">
                    {/* Previous */}
                    {currentPage > 1 && (
                        <button
                            onClick={() => goToPage(currentPage - 1)}
                            className="h-15 px-6 py-3 bg-gold-100 rounded-xl hover:bg-gold-200 font-light text-[20px] text-gray-700 transition-all"
                        >
                            Previous
                        </button>
                    )}

                    {/* Page Numbers */}
                    {Array.from(
                        { length: totalPages },
                        (_, i) => i + 1
                    ).map((page) => (
                        <button
                            key={page}
                            onClick={() => goToPage(page)}
                            className={`h-15 w-15 px-4 py-3 mx-1 rounded-xl text-[20px] transition-all shadow-sm ${
                                currentPage === page
                                    ? "bg-gold text-white shadow-lg scale-105"
                                    : "bg-gold-100 hover:bg-gold-200 hover:border-gold text-gray-700 hover:shadow-md"
                            }`}
                        >
                            {page}
                        </button>
                    ))}

                    {/* Next */}
                    {currentPage < totalPages && (
                        <button
                            onClick={() => goToPage(currentPage + 1)}
                            className="h-15 w-24.5 px-6 py-3 bg-gold-100 rounded-xl hover:bg-gold-200 font-light text-[20px] text-gray-700 transition-all"
                        >
                            Next
                        </button>
                    )}
                </div>
            )}

            <ServiceHighlights />
        </>
    );
}

export default Shop;
