
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { getProducts } from "@/api/services/product.service";
import { ProductsCardsGrid } from "./ProductsCardsGrid";

export default function ProductCategoryPage() {
    const params = useParams();
    const router = useRouter();

    const categoryId = Number(params.id);

    const [category, setCategory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!Number.isInteger(categoryId) || categoryId <= 0) {
            setError("Invalid category.");
            setLoading(false);
            return;
        }

        const fetchCategory = async () => {
            try {
                setLoading(true);
                setError("");

                const products = await getProducts(categoryId);

                if (products.length > 0) {
                    setCategory(products[0].category);
                } else {
                    // در دسته‌بندی خالی، نام دسته از API محصولات قابل دریافت نیست.
                    setCategory(null);
                }
            } catch (err) {
                console.error("Category error:", err);
                setError("Failed to load category.");
            } finally {
                setLoading(false);
            }
        };

        fetchCategory();
    }, [categoryId]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                Loading category...
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4">
                <p>{error}</p>
                <button
                    onClick={() => router.push("/")}
                    className="px-5 py-2 bg-gold text-white rounded-lg"
                >
                    Back to Home
                </button>
            </div>
        );
    }

    return (
        <>
            <div className="min-h-25 bg-gold-100 flex items-center gap-4 px-5 xl:pl-24.75 flex-wrap">
                <Link href="/" className="text-[#9F9F9F]">
                    Home
                </Link>

                <ChevronRight />

                <span className="text-gray-500">
                    Categories
                </span>

                <ChevronRight />

                <span className="border-l py-1 pl-8.5">
                    {category?.name || `Category ${categoryId}`}
                </span>
            </div>

            <ProductsCardsGrid
                nameH1={category?.name || "Category Products"}
                categoryId={categoryId}
                initialLimit={8}
                maxLimit={20}
            />
        </>
    );
}
