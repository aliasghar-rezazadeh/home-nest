function Logo() {
    return (
        <div className="flex items-center">
            <img
                src="/images/Logos.svg"
                alt="HomeNest logo"
                width="50"
                height="50"
                style={{
                    width: "50px",
                    height: "50px",
                    objectFit: "contain",
                }}
            />
            <p className="text-[38px] font-bold text-black">
                Furniro
            </p>
        </div>
    );
}

export default Logo;
