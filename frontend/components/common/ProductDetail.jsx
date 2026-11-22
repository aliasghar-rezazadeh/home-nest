"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

import {
    HeartPlus,
    HeartMinus,
    ChevronRight,
    Share2,
    Link as LinkIcon,
    Star,
} from "lucide-react";

import { useDispatch, useSelector } from "react-redux";

import StarRating from "./StarRating";
import { getProductById } from "@/api/services/product.service";
import { getWishlist, toggleWishlistItem } from "@/api/services/wishlist.service";
import { getAccessToken } from "@/api/services/auth.service";
import { addCartItem, getCart, removeCartItem } from "@/api/services/cart.service";
import { addToCompare } from "@/redux/slices/compareSlice";
import { ProductsCardsGrid } from "./ProductsCardsGrid";
import {getProductReviews, createReview, updateReview, deleteReview,} from "@/api/services/review.service";
const API_URL = "http://127.0.0.1:8000";

const getImageUrl = (image) => {
    if (!image) return null;

    return image.startsWith("http")
        ? image
        : `${API_URL}${image}`;
};

export default function ProductDetail() {
    const params = useParams();
    const router = useRouter();

    const id = params.id;

    const dispatch = useDispatch();
    const compareItems = useSelector((state) => state.compare.items);

    const [quantity, setQuantity] = useState(1);
    const [isLiked, setIsLiked] = useState(false);
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [isCartLoading, setIsCartLoading] = useState(false);
    const [cartItemId, setCartItemId] = useState(null);
    const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [selectedColor, setSelectedColor] = useState("");
    const [selectedSize, setSelectedSize] = useState("");
    const [selectedImage, setSelectedImage] = useState("");

    const [activeTab, setActiveTab] = useState("description");

    //استیت های نظر دهی
    const [productReviews, setProductReviews] = useState([]);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState("");
    const [editingReviewId, setEditingReviewId] = useState(null);
    const [isReviewLoading, setIsReviewLoading] = useState(false);
    const [reviewDraftRestored, setReviewDraftRestored] = useState(false);

    // دریافت نظرات محصول از API
    useEffect(() => {
        if (!id) return;

        let cancelled = false;

        const loadReviews = async () => {
            try {
                const data = await getProductReviews(Number(id));

                if (!cancelled) {
                    setProductReviews(
                        Array.isArray(data) ? data : data.results || []
                    );
                }
            } catch (err) {
                console.error("Reviews loading error:", err);
                if (!cancelled) {
                    toast.error(err.message || "خطا در دریافت نظرات.");
                }
            }
        };

        loadReviews();

        return () => {
            cancelled = true;
        };
    }, [id]);

    // بازیابی پیش‌نویس نظر پس از بازگشت از صفحه ورود
    useEffect(() => {
        if (!id) return;

        const draftKey = `product-review-draft-${id}`;
        const savedDraft = sessionStorage.getItem(draftKey);

        if (!savedDraft) return;

        try {
            const draft = JSON.parse(savedDraft);

            setReviewRating(
                Number.isInteger(draft.rating) &&
                draft.rating >= 1 &&
                draft.rating <= 5
                    ? draft.rating
                    : 5
            );

            setReviewComment(
                typeof draft.comment === "string"
                    ? draft.comment
                    : ""
            );

            setActiveTab("reviews");

            toast.info("Your review draft has been restored.");
        } catch (err) {
            console.error("Review draft error:", err);
            sessionStorage.removeItem(draftKey);
        }
    }, [id]);

    // دریافت اطلاعات محصول
    useEffect(() => {
        if (!id) return;

        const fetchProduct = async () => {
            try {
                setLoading(true);
                setError("");

                const data = await getProductById(id);

                setProduct(data);
                setSelectedColor("");
                setSelectedSize("");
                setSelectedImage(getImageUrl(data.image) || "");
            } catch (err) {
                console.error("Product detail error:", err);
                setError("Failed to load product.");
            } finally {
                setLoading(false);
            }
        };

        window.scrollTo(0, 0);
        fetchProduct();
    }, [id]);

    // دریافت وضعیت علاقه‌مندی محصول
    useEffect(() => {
        if (!product?.id) return;

        let cancelled = false;

        const loadWishlist = async () => {
            if (!getAccessToken()) {
                setIsLiked(false);
                return;
            }

            try {
                const wishlist = await getWishlist();

                if (!cancelled) {
                    setIsLiked(
                        wishlist.items.some((item) => item.product.id === product.id)
                    );
                }
            } catch (err) {
                console.error("Wishlist loading error:", err);
            }
        };

        loadWishlist();

        return () => {
            cancelled = true;
        };
    }, [product?.id]);

    // با تغییر محصول یا تنوع انتخاب‌شده، وضعیت همان تنوع را از سبد خرید می‌خوانیم
    useEffect(() => {
        let cancelled = false;

        const loadSelectedCartItem = async () => {
            setCartItemId(null);
            setQuantity(1);
            setIsCartLoading(false);

            if (!product?.id) return;

            const currentVariants = product.variants ?? [];
            const currentColors = [...new Set(currentVariants.map((item) => item.color).filter(Boolean))];
            const currentSizes = [...new Set(currentVariants.map((item) => item.size).filter(Boolean))];
            const currentHasVariants = currentVariants.length > 0;

            const optionsNotSelected = currentHasVariants && (
                (!selectedColor && currentColors.length > 0) ||
                (!selectedSize && currentSizes.length > 0)
            );

            if (optionsNotSelected || !getAccessToken()) return;

            const currentVariant = currentVariants.find((variant) => {
                const colorMatches = !currentColors.length || variant.color === selectedColor;
                const sizeMatches = !currentSizes.length || variant.size === selectedSize;
                return colorMatches && sizeMatches;
            });

            if (currentHasVariants && !currentVariant) return;

            try {
                setIsCartLoading(true);
                const cart = await getCart();
                if (cancelled) return;

                const item = cart.items.find((cartItem) =>
                    cartItem.product.id === product.id &&
                    (cartItem.variant?.id ?? null) === (currentVariant?.id ?? null)
                );

                if (item) {
                    setCartItemId(item.id);
                    setQuantity(item.quantity);
                }
            } catch (err) {
                if (!cancelled) {
                    console.error("Cart loading error:", err);
                    toast.error(err.message || "خطا در دریافت وضعیت سبد خرید.");
                }
            } finally {
                if (!cancelled) setIsCartLoading(false);
            }
        };

        loadSelectedCartItem();

        return () => {
            cancelled = true;
        };
    }, [product?.id, product?.variants, selectedColor, selectedSize]);

    // وضعیت بارگذاری
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                Loading product...
            </div>
        );
    }

    // خطا
    if (error || !product) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4">
                <p>{error || "Product not found!"}</p>

                <button
                    onClick={() => router.push("/")}
                    className="px-5 py-2 bg-gold text-white rounded-lg"
                >
                    Back to Home
                </button>
            </div>
        );
    }

    // اطلاعات محصول
    const {
        name,
        sku,
        description,
        price,
        final_price,
        discount_percentage,
        is_featured,
        stock,
        image,
        category,
        tags = [],
        variants = [],
        images = [],
        specifications = [],
        content_blocks = [],
        reviews = [],
        average_rating = 0,
        reviews_count = 0,
    } = product;

    // تصاویر گالری
    const galleryImages = [
        ...(image ? [image] : []),
        ...images
            .filter((item) => item.image)
            .map((item) => item.image),
    ].filter((item, index, array) => array.indexOf(item) === index);

    // واریانت‌های قابل انتخاب
    const colors = [...new Set(
        variants.map((item) => item.color).filter(Boolean)
    )];

    const sizes = [...new Set(
        variants.map((item) => item.size).filter(Boolean)
    )];

    // واریانت انتخاب‌شده
    const selectedVariant = variants.find((variant) => {
        const colorMatches = !colors.length || variant.color === selectedColor;
        const sizeMatches = !sizes.length || variant.size === selectedSize;

        return colorMatches && sizeMatches;
    });

    const hasVariants = variants.length > 0;

    const availableStock = hasVariants
        ? selectedVariant?.stock ?? 0
        : stock;

    const variantNotSelected =
        hasVariants &&
        ((!selectedColor && colors.length > 0) ||
        (!selectedSize && sizes.length > 0));

    const hasDiscount = Number(discount_percentage) > 0;

    const formattedPrice = Number(final_price ?? price).toLocaleString("en-US");
    const formattedOldPrice = Number(price).toLocaleString("en-US");

    const categoryName =
        typeof category === "object"
            ? category?.name
            : category;

    const isCompared = compareItems.some((item) => item.id === product.id);

    // افزودن یا حذف از علاقه‌مندی‌ها
    const handleToggleWishlist = async () => {
        if (!getAccessToken()) {
            router.push("/login");
            return;
        }

        try {
            setIsTogglingWishlist(true);
            const result = await toggleWishlistItem(product.id);
            setIsLiked(result.is_favorite);
        } catch (err) {
            console.error("Wishlist error:", err);
            toast.error(err.message || "خطا در به‌روزرسانی علاقه‌مندی‌ها.");
        } finally {
            setIsTogglingWishlist(false);
        }
    };

    // افزودن یا حذف از مقایسه
    const handleToggleCompare = () => {
        dispatch(
            addToCompare({
                id: product.id,
                name,
                sku,
                description,
                price,
                final_price,
                stock,
                image,
                category:
                    typeof category === "object"
                        ? category?.id ?? null
                        : category ?? null,
                category_name:
                    typeof category === "object"
                        ? category?.name
                        : undefined,
                average_rating,
                discount_percentage,
                variants,
            })
        );
    };

    // اگر تنوع انتخاب‌شده در سبد باشد، همه تعداد همان تنوع حذف می‌شود؛ در غیر این صورت اضافه می‌شود
    const handleAddToCart = async () => {
        if (!getAccessToken()) {
            router.push("/login");
            return;
        }

        if (variantNotSelected) {
            toast.warning("Please select the product color and size.");
            return;
        }

        if (hasVariants && !selectedVariant) {
            toast.warning("The selected combination of color and size is not valid.");
            return;
        }

        if (cartItemId) {
            try {
                setIsAddingToCart(true);
                await removeCartItem(cartItemId);
                setCartItemId(null);
                setQuantity(1);
                toast.success("All quantities of this variant have been removed from the shopping cart.");
            } catch (err) {
                console.error("Remove from cart error:", err);
                toast.error(err.message || "Error removing the product from the shopping cart.");
            } finally {
                setIsAddingToCart(false);
            }
            return;
        }

        if (availableStock < 1) {
            toast.warning("This product is not in stock.");
            return;
        }

        if (quantity > availableStock) {
            toast.warning("The selected quantity exceeds the product's available stock.");
            return;
        }

        try {
            setIsAddingToCart(true);
            const cart = await addCartItem(product.id, selectedVariant?.id ?? null, quantity);
            const addedItem = cart.items.find((item) =>
                item.product.id === product.id &&
                (item.variant?.id ?? null) === (selectedVariant?.id ?? null)
            );

            if (addedItem) {
                setCartItemId(addedItem.id);
                setQuantity(addedItem.quantity);
            }

            toast.success("The product has been successfully added to the shopping cart.");
        } catch (err) {
            console.error("Add to cart error:", err);
            toast.error(err.message || "Error adding product to the shopping cart.");
        } finally {
            setIsAddingToCart(false);
        }
    };


    // به‌روزرسانی نظرات و اطلاعات امتیاز محصول
    const refreshReviews = async () => {
        const [updatedReviews, updatedProduct] = await Promise.all([
            getProductReviews(Number(id)),
            getProductById(id),
        ]);

        setProductReviews(
            Array.isArray(updatedReviews)
                ? updatedReviews
                : updatedReviews.results || []
        );
        setProduct(updatedProduct);
    };

    // شروع ثبت یا ویرایش نظر
    const handleReviewSubmit = async (e) => {
        e.preventDefault();

        const comment = reviewComment.trim();

        if (!comment) {
            toast.warning("Please write your review.");
            return;
        }

        if (reviewRating < 1 || reviewRating > 5) {
            toast.warning("Please select a rating.");
            return;
        }

        // اگر کاربر وارد نشده، پیش‌نویس را ذخیره و به صفحه ورود هدایت می‌کنیم
        if (!getAccessToken()) {
            sessionStorage.setItem(
                `product-review-draft-${id}`,
                JSON.stringify({
                    rating: reviewRating,
                    comment,
                })
            );

            router.push(
                `/login?next=${encodeURIComponent(`/product/${id}`)}`
            );

            return;
        }

        try {
            setIsReviewLoading(true);

            if (editingReviewId) {
                await updateReview(
                    editingReviewId,
                    reviewRating,
                    comment
                );

                toast.success("Your review has been updated.");
            } else {
                await createReview(
                    Number(id),
                    reviewRating,
                    comment
                );

                toast.success("Your review has been submitted.");
            }

            sessionStorage.removeItem(`product-review-draft-${id}`);

            setReviewRating(5);
            setReviewComment("");
            setEditingReviewId(null);

            await refreshReviews();
        } catch (err) {
            console.error("Review submission error:", err);
            toast.error(err.message || "Failed to submit your review.");
        } finally {
            setIsReviewLoading(false);
        }
    };

    // شروع ویرایش نظر خود کاربر
    const handleEditReview = (review) => {
        setEditingReviewId(review.id);
        setReviewRating(review.rating);
        setReviewComment(review.comment);

        setActiveTab("reviews");

        // window.scrollTo({
        //     top: document.body.scrollHeight,
        //     behavior: "smooth",
        // });
    };

    // لغو ویرایش
    const handleCancelEditReview = () => {
        setEditingReviewId(null);
        setReviewRating(5);
        setReviewComment("");
    };

    // حذف نظر خود کاربر
    const handleDeleteReview = async (reviewId) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete your review?"
        );

        if (!confirmed) return;

        try {
            setIsReviewLoading(true);

            await deleteReview(reviewId);

            toast.success("Your review has been deleted.");

            if (editingReviewId === reviewId) {
                handleCancelEditReview();
            }

            await refreshReviews();
        } catch (err) {
            console.error("Review deletion error:", err);
            toast.error(err.message || "Failed to delete your review.");
        } finally {
            setIsReviewLoading(false);
        }
    };


    return (
        <>
            {/* Breadcrumb */}
            <div className="min-h-25 bg-gold-100 flex items-center gap-4 px-5 xl:pl-24.75 flex-wrap">
                <Link href="/" className="text-[#9F9F9F]">
                    Home
                </Link>

                <ChevronRight />

                <Link href="/shop" className="text-[#9F9F9F]">
                    Shop
                </Link>

                <ChevronRight />

                <p className="border-l py-1 pl-8.5">
                    {name}
                </p>
            </div>

            {/* Product Main Information */}
            <div className="mt-8 flex flex-col lg:flex-row lg:justify-between gap-10 px-5 xl:px-24.75 pb-13.75 pt-8.75">

                {/* Images */}
                <div className="flex flex-col-reverse sm:flex-row gap-5 lg:gap-8">

                    {/* Thumbnail Images */}
                    {galleryImages.length > 1 && (
                        <div className="flex sm:flex-col gap-3 sm:w-19 overflow-x-auto">
                            {galleryImages.map((item, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => setSelectedImage(getImageUrl(item))}
                                    className={`shrink-0 rounded-[10px] overflow-hidden border-2 ${
                                        selectedImage === getImageUrl(item)
                                            ? "border-gold"
                                            : "border-transparent"
                                    }`}
                                >
                                    <img
                                        src={getImageUrl(item)}
                                        alt={`${name} ${index + 1}`}
                                        className="w-19 h-19 object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Main Image */}
                    <div className="w-full sm:w-auto">
                        {selectedImage ? (
                            <img
                                src={selectedImage}
                                alt={name}
                                className="w-full sm:w-105.75 h-100 sm:h-125 object-cover rounded-[10px]"
                            />
                        ) : (
                            <div className="w-full sm:w-105.75 h-100 sm:h-125 rounded-[10px] bg-gray-200 flex items-center justify-center text-gray-500">
                                No Image
                            </div>
                        )}
                    </div>
                </div>

                {/* Product Details */}
                <div className="flex flex-col items-start gap-4 flex-1">

                    {/* Name and Like */}
                    <div className="w-full flex justify-between items-center gap-4">
                        <h1 className="text-3xl lg:text-[42px] font-semibold">
                            {name}
                        </h1>

                        <button
                            type="button"
                            onClick={handleToggleWishlist}
                            disabled={isTogglingWishlist}
                            className="flex items-center h-fit gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-red-50 transition-all"
                        >
                            {isLiked ? (
                                <HeartMinus size={20} strokeWidth={2} color="#f50000"/>
                            ) : (
                                <HeartPlus size={20} strokeWidth={2} />
                            )}
                            <span className="text-sm font-medium">
                                {isLiked ? "Unlike" : "Like"}
                            </span>
                        </button>
                    </div>

                    {/* Price */}
                    <div className="flex items-center gap-4 flex-wrap">
                        <span className="text-2xl font-medium text-gray-900">
                            {formattedPrice}
                        </span>

                        {hasDiscount && (
                            <>
                                <span className="text-xl text-gray-500 line-through">
                                    {formattedOldPrice}
                                </span>

                                <span className="px-4 py-2 bg-red-100 text-red-600 text-lg font-bold rounded-full">
                                    -{discount_percentage}%
                                </span>
                            </>
                        )}
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-3">
                        <StarRating
                            rating={average_rating}
                            className="text-[20px] font-bold"
                        />

                        <span className="text-sm text-gray-500">
                            ({reviews_count} Reviews)
                        </span>
                    </div>

                    {/* Description */}
                    <p className="max-w-2xl text-gray-600 leading-8 line-clamp-3">
                        {description}
                    </p>

                    {/* Size */}
                    {sizes.length > 0 && (
                        <div>
                            <p className="text-gray-500 mb-3">
                                Size
                            </p>

                            <div className="flex gap-4 flex-wrap">
                                {sizes.map((item) => {
                                    const isActive = selectedSize === item;

                                    return (
                                        <button
                                            key={item}
                                            type="button"
                                            onClick={() => setSelectedSize(item)}
                                            className={`min-w-9 h-9 px-2 rounded-[5px] transition ${
                                                isActive
                                                    ? "text-white bg-gold"
                                                    : "text-black bg-gold-100"
                                            } hover:scale-110`}
                                        >
                                            {item}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Color */}
                    {colors.length > 0 && (
                        <div>
                            <p className="text-gray-500 mb-3">
                                Color
                            </p>

                            <div className="flex gap-4 flex-wrap">
                                {colors.map((item) => {
                                    const isActive = selectedColor === item;

                                    return (
                                        <button
                                            key={item}
                                            type="button"
                                            onClick={() => setSelectedColor(item)}
                                            title={item}
                                            style={{ backgroundColor: item }}
                                            className={`h-8 w-8 rounded-full transition ${
                                                isActive
                                                    ? "scale-110 border-2 border-orange-700"
                                                    : "border border-gray-300"
                                            } hover:scale-110`}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Stock */}
                    <div className="text-sm text-gray-500">
                        {variantNotSelected
                            ? "Please select product options."
                            : `Available Stock: ${availableStock}`}
                    </div>

                    {/* Cart Controls */}
                    <div className="flex flex-wrap gap-2.5 mt-4 items-center">
                        <div className="flex w-50 h-16 items-center bg-white border-2 border-gray-200 rounded-xl p-2">
                            <button
                                type="button"
                                onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                                disabled={isCartLoading || Boolean(cartItemId)}
                                className="w-12 h-12 rounded-lg bg-gray-100 hover:bg-gray-200 font-bold text-xl"
                            >
                                -
                            </button>

                            <span className="w-16 text-center text-xl font-bold mx-4">
                                {quantity}
                            </span>

                            <button
                                type="button"
                                onClick={() => setQuantity((current) => Math.min(current + 1, availableStock))}
                                disabled={availableStock < 1 || quantity >= availableStock || isCartLoading || Boolean(cartItemId)}
                                className="w-12 h-12 rounded-lg bg-gray-100 hover:bg-gray-200 font-bold text-xl"
                            >
                                +
                            </button>
                        </div>

                        <button
                            type="button"
                            onClick={handleAddToCart}
                            disabled={isAddingToCart || isCartLoading}
                            className="border h-16 px-6 rounded-[15px]"
                        >
                            {isCartLoading
                                ? "Checking cart..."
                                : isAddingToCart
                                    ? (cartItemId ? "Removing..." : "Adding...")
                                    : cartItemId
                                        ? "Remove from cart"
                                        : "Add to cart"}
                        </button>

                        <button
                            type="button"
                            onClick={handleToggleCompare}
                            className="h-16 px-6 rounded-[15px] border border-gray-300 hover:bg-gray-50"
                        >
                            {isCompared ? "Remove from compare" : "+ Compare"}
                        </button>
                    </div>

                    {/* Product Information */}
                    <div className="border-t border-gray-300 text-gray-500 mt-8 w-full">
                        <table className="w-full mt-8">
                            <tbody>
                                <tr>
                                    <td className="py-2 pr-8 align-top w-28">
                                        SKU
                                    </td>
                                    <td className="pr-4">:</td>
                                    <td>{sku || "Not specified"}</td>
                                </tr>

                                <tr>
                                    <td className="py-2 pr-8 align-top">
                                        Category
                                    </td>
                                    <td className="pr-4">:</td>
                                    <td>{categoryName || "Not specified"}</td>
                                </tr>

                                <tr>
                                    <td className="py-2 pr-8 align-top">
                                        Tags
                                    </td>
                                    <td className="pr-4">:</td>
                                    <td>
                                        {tags.length > 0
                                            ? tags.map((tag) => tag.name).join(", ")
                                            : "No tags"}
                                    </td>
                                </tr>

                                <tr>
                                    <td className="py-2 align-top">
                                        Share
                                    </td>
                                    <td className="pr-4">:</td>
                                    <td>
                                        <div className="flex gap-3 pt-2">
                                            <Share2 size={20} />
                                            <LinkIcon size={20} />
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-y border-gray-300 w-full pb-16 pt-12">
                <div className="text-lg sm:text-2xl font-medium gap-5 sm:gap-13 flex justify-center flex-wrap">
                    <button
                        onClick={() => setActiveTab("description")}
                        className={activeTab === "description" ? "text-black" : "text-gray-400"}
                    >
                        Description
                    </button>

                    <button
                        onClick={() => setActiveTab("information")}
                        className={activeTab === "information" ? "text-black" : "text-gray-400"}
                    >
                        Additional Information
                    </button>

                    <button
                        onClick={() => setActiveTab("reviews")}
                        className={activeTab === "reviews" ? "text-black" : "text-gray-400"}
                    >
                        Reviews [{reviews_count}]
                    </button>
                </div>

                <div className="pt-8 px-5 sm:px-10 lg:px-20 xl:px-51.75">

                    {/* Description Tab */}
                    {activeTab === "description" && (
                        <div className="space-y-6">
                            <p className="leading-8 text-gray-600">
                                {description}
                            </p>

                            {content_blocks
                                .filter((block) => block.block_type === "text" && block.text)
                                .map((block) => (
                                    <p
                                        key={block.id}
                                        className="leading-8 text-gray-600"
                                    >
                                        {block.text}
                                    </p>
                                ))}

                            <div className="flex flex-wrap justify-center gap-7 mt-9">
                                {content_blocks
                                    .filter((block) => block.block_type === "image" && block.image)
                                    .map((block) => (
                                        <img
                                            key={block.id}
                                            src={getImageUrl(block.image)}
                                            alt={name}
                                            className="max-w-full w-100 rounded-lg object-cover"
                                        />
                                    ))}

                                {images
                                    .filter((item) => item.image_type === "description")
                                    .map((item) => (
                                        <img
                                            key={item.id}
                                            src={getImageUrl(item.image)}
                                            alt={name}
                                            className="max-w-full w-100 rounded-lg object-cover"
                                        />
                                    ))}
                            </div>
                        </div>
                    )}

                    {/* Additional Information Tab */}
                    {activeTab === "information" && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-lg">
                            <div className="space-y-3">
                                <p>
                                    <span className="font-semibold">SKU:</span>{" "}
                                    {sku || "Not specified"}
                                </p>

                                <p>
                                    <span className="font-semibold">Category:</span>{" "}
                                    {categoryName || "Not specified"}
                                </p>

                                <p>
                                    <span className="font-semibold">Stock:</span>{" "}
                                    {stock}
                                </p>

                                <p>
                                    <span className="font-semibold">Featured:</span>{" "}
                                    {is_featured ? "Yes" : "No"}
                                </p>
                            </div>

                            <div className="space-y-3">
                                <p>
                                    <span className="font-semibold">Rating:</span>{" "}
                                    {average_rating}/5
                                </p>

                                <p>
                                    <span className="font-semibold">Reviews:</span>{" "}
                                    {reviews_count}
                                </p>

                                {specifications.map((item) => (
                                    <p key={item.id}>
                                        <span className="font-semibold">
                                            {item.key}:
                                        </span>{" "}
                                        {item.value}
                                    </p>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Reviews Tab */}
                    {activeTab === "reviews" && (
                        <div>
                            <h3 className="text-2xl font-bold mb-4">
                                Reviews ({productReviews.length})
                            </h3>

                            <StarRating
                                rating={average_rating}
                                className="mb-5"
                            />

                            {/* Review Form */}
                            {(
                                !productReviews.some((review) => review.is_mine) ||
                                editingReviewId
                            ) && (
                                <form
                                    onSubmit={handleReviewSubmit}
                                    className="border border-gray-200 rounded-xl p-5 mb-8 space-y-5"
                                >
                                    <h4 className="text-xl font-semibold">
                                        {editingReviewId ? "Edit Your Review" : "Write a Review"}
                                    </h4>

                                    {/* Rating Selection */}
                                    <div>
                                        <p className="text-gray-600 mb-3">
                                            Your Rating
                                        </p>

                                        <div className="flex items-center gap-2">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onClick={() => setReviewRating(star)}
                                                    disabled={isReviewLoading}
                                                    aria-label={`Rate ${star} out of 5`}
                                                    className="transition hover:scale-110 disabled:opacity-50"
                                                >
                                                    <Star
                                                        size={27}
                                                        className={
                                                            star <= reviewRating
                                                                ? "fill-yellow-400 text-yellow-400"
                                                                : "text-gray-300"
                                                        }
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Comment */}
                                    <div>
                                        <label
                                            htmlFor="review-comment"
                                            className="block text-gray-600 mb-2"
                                        >
                                            Your Review
                                        </label>

                                        <textarea
                                            id="review-comment"
                                            value={reviewComment}
                                            onChange={(e) => setReviewComment(e.target.value)}
                                            placeholder="Write your experience with this product..."
                                            rows={4}
                                            maxLength={2000}
                                            disabled={isReviewLoading}
                                            className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-gold resize-y"
                                        />

                                        <p className="text-xs text-gray-400 mt-1 text-right">
                                            {reviewComment.length}/2000
                                        </p>
                                    </div>

                                    {/* Form Buttons */}
                                    <div className="flex flex-wrap gap-3">
                                        <button
                                            type="submit"
                                            disabled={isReviewLoading || !reviewComment.trim()}
                                            className="px-6 py-3 bg-gold text-white rounded-lg hover:opacity-90 transition disabled:opacity-50"
                                        >
                                            {isReviewLoading
                                                ? "Please wait..."
                                                : editingReviewId
                                                    ? "Update Review"
                                                    : "Submit Review"}
                                        </button>

                                        {editingReviewId && (
                                            <button
                                                type="button"
                                                onClick={handleCancelEditReview}
                                                disabled={isReviewLoading}
                                                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                                            >
                                                Cancel
                                            </button>
                                        )}
                                    </div>
                                </form>
                            )}

                            {/* Reviews List */}
                            {productReviews.length > 0 ? (
                                <div className="space-y-5">
                                    {productReviews.map((review) => (
                                        <div
                                            key={review.id}
                                            className="border-b border-gray-200 pb-5"
                                        >
                                            <div className="flex justify-between items-start gap-4 flex-wrap">
                                                <div>
                                                    <p className="font-semibold">
                                                        {review.user}
                                                    </p>

                                                    <StarRating rating={review.rating} />

                                                    <p className="text-xs text-gray-400 mt-1">
                                                        {new Date(review.created_at).toLocaleDateString()}
                                                        {review.updated_at !== review.created_at && (
                                                            <span> · Edited</span>
                                                        )}
                                                    </p>
                                                </div>

                                                {review.is_mine && (
                                                    <div className="flex gap-3">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleEditReview(review)}
                                                            disabled={isReviewLoading}
                                                            className="text-sm text-blue-600 hover:underline disabled:opacity-50"
                                                        >
                                                            Edit
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteReview(review.id)}
                                                            disabled={isReviewLoading}
                                                            className="text-sm text-red-600 hover:underline disabled:opacity-50"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            <p className="mt-3 text-gray-700 leading-7 whitespace-pre-wrap">
                                                {review.comment}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 italic">
                                    No reviews yet. Be the first to review this product!
                                </p>
                            )}
                        </div>
                    )}


                </div>
            </div>

            {/* Related Products */}
            <ProductsCardsGrid
                nameH1="Related Products"
                initialLimit={4}
                maxLimit={12}
            />
        </>
    );
}