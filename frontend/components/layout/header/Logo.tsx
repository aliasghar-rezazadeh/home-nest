import Image from "next/image";

function Logo() {
    return (
        <div className="flex items-center">
            <Image
                src="/images/Logos.svg"
                alt="HomeNest logo"
                width={50}
                height={50}
                className="w-12.5 object-contain sm:h-11"
            />

            <p className="text-[38px] font-bold text-black">
                Furniro
            </p>
        </div>
    );
}

export default Logo;
