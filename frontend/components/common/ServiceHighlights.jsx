
function ServiceHighlights() {
    const service = [
        {
            id: 1,
            title: "High Quality",
            description: "crafted from top materials",
            icon: "/assets/images/SVG/trophy.svg",
        },
        {
            id: 2,
            title: "Warranty Protection",
            description: "Over 2 years",
            icon: "/assets/images/SVG/guarantee.svg",
        },
        {
            id: 3,
            title: "Free Shipping",
            description: "Order over 150 $",
            icon: "/assets/images/SVG/shipping.svg",
        },
        {
            id: 4,
            title: "24 / 7 Support",
            description: "Dedicated support",
            icon: "/assets/images/SVG/customer-support.svg",
        },
    ];

    return (
        <div className="w-full py-20 bg-[#FAF3EA] mt-21.25 flex justify-evenly">
            {service.map((item) => (
                <div className="flex gap-3" key={item.id}>
                    <img
                        src={item.icon}
                        alt={item.title}
                        className="w-15 h-15 object-contain"
                    />

                    <div>
                        <p className="text-[25px] font-semibold">
                            {item.title}
                        </p>

                        <p className="text-[20px] font-medium text-gray-400">
                            {item.description}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default ServiceHighlights;
