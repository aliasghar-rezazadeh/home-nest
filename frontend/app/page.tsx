const background = "/assets/images/background1.png";
import CategoryHome from "@/components/common/CategoryHome";
import { ProductsCardsGrid } from "@/components/common/ProductsCardsGrid";
import BannerSlider from "@/components/common/BannerSlider";
import "../components/template/buttonStyle.css";
import Image from "next/image";
import Link from "next/link";
export default function Home() {
    return (
        <>
            <div id="baner" className='lg:h-dvh lg:w-full bg-fixed bg-no-repeat bg-cover bg-bottom flex items-center lg:pr-15'style={{ backgroundImage: `url(${background})` , direction: "rtl"}}>
                <div style={{direction: "rtl"}} className=" font-poppins lg:h-120.5 w-full lg:w-165 lg:rounded-[15px] py-3.75 px-5 lg:py-20 lg:px-12.5 bg-[#FFF3E3] flex items-end flex-col justify-between gap-2 lg:gap-0">
                    <p className="text-[20px] font-medium">New Arrival</p>
                    <p className="text-[42px] lg:text-[52px] font-bold text-gold lg:w-101.25 text-end  leading-none ">Discover Our  New Collection</p>
                    <p className="text-base-medium lg:text-[18px] font-light text-left leading-none">Lorem ipsum dolor sit amet, consectetur adipiscing elit Ut elit tellus, luctus nec ullamcorper mattis</p>
                    <Link
                        href="/shop"
                        className="Action_Buttun text-[20px] font-bold text-white bg-linear-to-r from-yellow-500 to-yellow-600 w-39.25 lg:w-55.5 h-12.5 lg:h-20 lg:text-[25px] border-none flex items-center justify-center"
                    >
                        <span>BUY Now</span>
                    </Link>
                </div>
            </div>
            <CategoryHome/>
            
            <ProductsCardsGrid
                nameH1="Our Products"
                initialLimit={8}
                maxLimit={20}
            />

            <BannerSlider />

            <div className="my-15 flex flex-col items-center">
                <p className="text-[20px] font-semibold text-[#616161] mt-1.75 mb-6.25">
                    Share your setup with
                </p>

                <p className="font-bold text-[30px] xl:text-[40px]">
                    #FuniroFurniture
                </p>

                <Image
                    src="/assets/images/baner.png"
                    alt="Funiro Furniture"
                    width={1920}
                    height={600}
                    className="w-full h-auto"
                />
            </div>
        </>
    );
}
