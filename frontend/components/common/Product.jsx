
"use client";

import StarRating from "./StarRating";
import {
    HeartPlus,
    HeartMinus,
    ArrowRightLeft,
    Share2,
    CheckLine,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import {
    getWishlist,
    toggleWishlistItem,
} from "@/api/services/wishlist.service";

import { getAccessToken } from "@/api/services/auth.service";

import { useDispatch, useSelector } from "react-redux";
import { addToCompare } from "@/redux/slices/compareSlice";

const API_URL = "http://127.0.0.1:8000";

const Product = (props) => {
    const {
        id,
        name,
        description,
        image,
        is_featured,
        average_rating,
        price,
        final_price,
        discount_percentage,
    } = props?.data || {};

    const router = useRouter();

    const dispatch = useDispatch();

    const compareItems = useSelector(
        (state) => state.compare.items
    );

    const isInCompare = compareItems.some(
        (item) => item.id === id
    );

    const handleCompare = (e) => {
        e.preventDefault();
        e.stopPropagation();

        dispatch(
            addToCompare({
                ...props.data,
            })
        );
    };

    const [isLiked, setIsLiked] = useState(false);
    const [likeMessage, setLikeMessage] = useState("");
    const [isLikeLoading, setIsLikeLoading] = useState(false);

    // بررسی وضعیت اولیه علاقه‌مندی محصول
    useEffect(() => {
        let isMounted = true;

        const checkWishlist = async () => {
            if (!id || !getAccessToken()) return;

            try {
                const data = await getWishlist();

                const exists = data.items.some(
                    (item) => item.product.id === id
                );

                if (isMounted) {
                    setIsLiked(exists);
                }
            } catch (error) {
                console.error("Wishlist loading error:", error);
            }
        };

        checkWishlist();

        return () => {
            isMounted = false;
        };
    }, [id]);

    const handleWishlistToggle = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!getAccessToken()) {
            router.push("/login");
            return;
        }

        if (isLikeLoading) return;

        try {
            setIsLikeLoading(true);

            const result = await toggleWishlistItem(id);

            setIsLiked(result.is_favorite);
            setLikeMessage(result.message);

            // اگر محصول حذف شده، صفحه Wishlist را هم به‌روزرسانی کن
            if (!result.is_favorite) {
                props.onWishlistChange?.(id);
            }

        } catch (error) {
            console.error("Wishlist error:", error);
            setLikeMessage("Failed to update wishlist.");
        } finally {
            setIsLikeLoading(false);
        }
    };


    if (!props?.data) return null;

    // ساخت آدرس کامل تصویر محصول
    const imageUrl = image
        ? image.startsWith("http")
            ? image
            : `${API_URL}${image}`
        : null;

    // بررسی وجود تخفیف
    const hasDiscount = Number(discount_percentage) > 0;

    // فرمت قیمت
    const formattedPrice = Number(final_price ?? price).toLocaleString("en-US");
    const formattedOldPrice = Number(price).toLocaleString("en-US");

    return (
        <div className="rounded-[5px] m-4 bg-[#F4F5F7] w-71.25 relative overflow-hidden cursor-pointer group">

            {/* Product Image */}
            {imageUrl ? (
                <img
                    className="w-full h-75.25 block object-cover"
                    src={imageUrl}
                    alt={name}
                />
            ) : (
                <div className="w-full h-75.25 flex items-center justify-center bg-gray-200 text-gray-500">
                    No Image
                </div>
            )}

            {/* Hover Overlay */}
            <div className="absolute top-0 left-0 w-full h-75.25 bg-[#3c3c3c9b] flex flex-col items-center justify-center opacity-0 transition-opacity delay-200 group-hover:opacity-100 duration-200">

                {/* Add to Cart */}
                <button
                    type="button"
                    className="Action_Buttun text-custom-main bg-white text-base-medium w-47.5 h-12 cursor-pointer mb-9 border-none font-poppins font-bold"
                >
                    Add to cart
                </button>

                {/* Action Buttons */}
                <div className="flex gap-3 text-white">

                    {/* Share */}
                    <button
                        type="button"
                        className="menu-a text-[12px] text-white cursor-pointer font-poppins flex gap-1 p-2 rounded hover:bg-white/20"
                    >
                        <Share2 size={20} strokeWidth={2} />
                        <span className="mt-0.5 mx-0.5 mb-0.5">
                            Share
                        </span>
                    </button>

                    {/* Compare */}
                    <button
                        type="button"
                        onClick={handleCompare}
                        className={`menu-a text-[12px] text-white cursor-pointer font-poppins flex gap-1 p-2 rounded hover:bg-white/20 ${
                            isInCompare ? "bg-white/20" : ""
                        }`}
                        title={isInCompare ? "Remove from Compare" : "Add to Compare"}
                    >
                        {isInCompare ? (
                            <CheckLine size={20} strokeWidth={2} />
                        ) : (
                            <ArrowRightLeft size={20} strokeWidth={2} />
                        )}

                        <span className="mt-0.5 mx-0.5 mb-0.5">
                            {isInCompare ? "Compared" : "Compare"}
                        </span>
                    </button>

                    {/* Wishlist */}
                    <button
                        type="button"
                        onClick={handleWishlistToggle}
                        disabled={isLikeLoading}
                        title={likeMessage || "Add to Wishlist"}
                        className="text-[12px] text-white cursor-pointer flex gap-1 menu-a p-2 rounded hover:bg-white/20 disabled:opacity-50"
                    >
                        {isLiked ? (
                            <HeartMinus
                                size={20}
                                strokeWidth={2}
                                color="#f50000"
                            />
                        ) : (
                            <HeartPlus
                                size={20}
                                strokeWidth={2}
                            />
                        )}

                        <span className="mt-0.5 mx-0.5 mb-0.5">
                            {isLiked ? "Unlike" : "Like"}
                        </span>
                    </button>

                </div>
            </div>

            {/* Featured Badge */}
            {is_featured && (
                <span className="text-base-medium absolute top-2.5 right-2.5 bg-[#2EC1AC] text-white rounded-[12%] p-1.75 font-poppins opacity-100 group-hover:opacity-0 transition-opacity duration-300">
                    Featured
                </span>
            )}

            {/* Discount Badge */}
            {hasDiscount && (
                <span className="text-base-medium absolute h-fit top-2.5 left-2.5 bg-[#E97171] text-white rounded-full p-1.75 font-poppins opacity-100 group-hover:opacity-0 transition-opacity duration-300">
                    -{discount_percentage}%
                </span>
            )}

            {/* Product Information */}
            <Link href={`/product/${id}`} className="block">

                <div className="pt-4 pb-7.5 px-4 flex flex-col flex-wrap items-stretch text-black">

                    {/* Product Name */}
                    <p className="text-[24px] w-fit mb-2 font-bold menu-a">
                        {name}
                    </p>

                    {/* Product Description */}
                    <div className="mt-0.75 mx-0 mb-3.75">
                        <span className="text-gray-400 text-base-medium line-clamp-2">
                            {description}
                        </span>
                    </div>

                    {/* Product Rating */}
                    <StarRating
                        rating={average_rating ?? 0}
                        className="text-[20px] font-bold"
                    />

                    {/* Product Price */}
                    <p className="flex flex-row justify-between items-center mt-2">

                        <span className="font-semibold text-[20px]">
                            {formattedPrice}
                        </span>

                        {hasDiscount && (
                            <span className="line-through text-gray-600 text-base-medium">
                                {formattedOldPrice}
                            </span>
                        )}

                    </p>

                </div>

            </Link>

        </div>
    );
};

export default Product;
