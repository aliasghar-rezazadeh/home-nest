// "use client";

// import { useEffect, useState } from "react";
// import { categoryService } from "../../api/services/category.service";
// import type { Category } from "../../api/types/category";
// import { getCategoryIcon } from "../../lib/category-icons";

// function CategoryHome() {
//     const [CATEGORIES, setCategories] = useState<Category[]>([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState("");

//     useEffect(() => {
//         const fetchCategories = async () => {
//             try {
//                 const data = await categoryService.getAll();
//                 setCategories(data.results);
//             } catch (err) {
//                 console.error("Category API Error:", err);
//                 setError("Failed to load categories.");
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchCategories();
//     }, []);

//     if (loading) {
//         return (
//             <div className="flex justify-center mt-16.25 mb-15">
//                 Loading categories...
//             </div>
//         );
//     }

//     if (error) {
//         return (
//             <div className="flex justify-center mt-16.25 mb-15 text-red-500">
//                 {error}
//             </div>
//         );
//     }

//     return (
//         <div className="flex flex-col items-center mt-16.25 mx-3.75 mb-15 xl:mx-0">
//             <p className="text-[30px] font-bold">
//                 Product Categories
//             </p>

//             <p className="text-[20px] mt-1.75 mb-6.25 text-center">
//                 Discover a variety of interior decoration products from different categories.
//             </p>

//             <div className="flex gap-8 flex-row items-center flex-wrap justify-center">
//                 {CATEGORIES.map((Data) => {
//                     const Icon = getCategoryIcon(Data.name);

//                     return (
//                         <div key={Data.id} className="flex relative w-98.5 h-53 overflow-hidden rounded-xl cursor-pointer items-center flex-col justify-center flex-nowrap group">
//                             <div className="relative w-full h-full overflow-hidden">

//                                 {Data.image ? (
//                                     <img src={Data.image} alt={Data.name} className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"/>
//                                 ) : (
//                                     <div className="w-full h-full bg-gray-200" />
//                                 )}

//                                 <div className="absolute top-0 left-0 w-full h-full bg-black/30 transition-colors duration-300 ease-in-out group-hover:bg-black/40" />

//                                 <div className="absolute bottom-0 text-white z-2 flex gap-2.5 w-full h-full flex-col items-center justify-evenly py-7.5">

//                                     <span className="text-[25px] xl:text-[30px] rounded-[50%] bg-[#ffffff78] p-3.75 flex items-center justify-center">
//                                         <Icon size={32} strokeWidth={1.8} />
//                                     </span>

//                                     <p className="m-0 font-bold text-[30px]">
//                                         {Data.name}
//                                     </p>

//                                     <p>
//                                         +{Data.products_count} products
//                                     </p>

//                                 </div>
//                             </div>
//                         </div>
//                     );
//                 })}
//             </div>
//         </div>
//     );
// }

// export default CategoryHome;



"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { categoryService } from "../../api/services/category.service";
import type { Category } from "../../api/types/category";
import { getCategoryIcon } from "../../lib/category-icons";

function CategoryHome() {
    const [CATEGORIES, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await categoryService.getAll();
                setCategories(data.results);
            } catch (err) {
                console.error("Category API Error:", err);
                setError("Failed to load categories.");
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center mt-16.25 mb-15">
                Loading categories...
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center mt-16.25 mb-15 text-red-500">
                {error}
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center mt-16.25 mx-3.75 mb-15 xl:mx-0">

            <p className="text-[30px] font-bold">
                Product Categories
            </p>

            <p className="text-[20px] mt-1.75 mb-6.25 text-center">
                Discover a variety of interior decoration products from different categories.
            </p>

            <div className="flex gap-8 flex-row items-center flex-wrap justify-center">

                {CATEGORIES.map((Data) => {
                    const Icon = getCategoryIcon(Data.name);

                    return (
                        <Link
                            key={Data.id}
                            href={`/categories/${Data.id}`}
                            className="flex relative w-98.5 h-53 overflow-hidden rounded-xl cursor-pointer items-center flex-col justify-center flex-nowrap group"
                        >
                            <div className="relative w-full h-full overflow-hidden">

                                {Data.image ? (
                                    <img
                                        src={Data.image}
                                        alt={Data.name}
                                        className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gray-200" />
                                )}

                                <div className="absolute top-0 left-0 w-full h-full bg-black/30 transition-colors duration-300 ease-in-out group-hover:bg-black/40" />

                                <div className="absolute bottom-0 text-white z-2 flex gap-2.5 w-full h-full flex-col items-center justify-evenly py-7.5">

                                    <span className="text-[25px] xl:text-[30px] rounded-[50%] bg-[#ffffff78] p-3.75 flex items-center justify-center">
                                        <Icon size={32} strokeWidth={1.8} />
                                    </span>

                                    <p className="m-0 font-bold text-[30px]">
                                        {Data.name}
                                    </p>

                                    <p>
                                        +{Data.products_count} products
                                    </p>

                                </div>
                            </div>
                        </Link>
                    );
                })}

            </div>
        </div>
    );
}

export default CategoryHome;
