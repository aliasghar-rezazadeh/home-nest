
import { Suspense } from "react";
import ProductCategoryPage from "@/components/common/ProductCategoryPage";

export default function CategoryPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center">
                    Loading category...
                </div>
            }
        >
            <ProductCategoryPage />
        </Suspense>
    );
}
