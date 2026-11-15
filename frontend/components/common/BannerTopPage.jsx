
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

function BannerTopPage({ pageName = "" }) {
    const pathname = usePathname();
    const location = pathname.split("/").filter(Boolean);

    return (
        <div
            style={{
                backgroundImage: "url('/assets/images/BannerPage.png')",
            }}
            className="w-full h-80 bg-cover bg-center flex justify-center items-center"
        >
            <div className="flex items-center justify-center flex-col">
                <p className="font-medium text-[48px]">{pageName}</p>

                <div className="flex items-center">
                    <Link href="/" className="font-medium">
                        Home
                    </Link>

                    <ChevronRight />

                    <p>{pageName || location[location.length - 1]}</p>
                </div>
            </div>
        </div>
    );
}

export default BannerTopPage;
