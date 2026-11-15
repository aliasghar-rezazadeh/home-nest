
import { Suspense } from "react";
import ProductDetail from "@/components/common/ProductDetail";
export const instant = false;
export default function ProductPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center">
                    Loading product...
                </div>
            }
        >
            <ProductDetail />
        </Suspense>
    );
}
