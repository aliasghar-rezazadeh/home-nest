
"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";

const BannerSlider = () => {
    const slides = [
        {
            id: 1,
            title: "Bed Room",
            subtitle: "Inner Peace",
            image: "/assets/images/BannerSlider/01.png"
        },
        {
            id: 2,
            title: "Living Room",
            subtitle: "Cozy Vibes",
            image: "/assets/images/BannerSlider/02.png"
        },
        {
            id: 3,
            title: "Kitchen",
            subtitle: "Modern Style",
            image: "/assets/images/BannerSlider/03.png"
        }
    ];

    const [currentSlide, setCurrentSlide] = useState(0);

    const goToSlide = (index) => {
        setCurrentSlide(index);
    };

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
    };

    const current = slides[currentSlide];
    const nextSlideIndex = (currentSlide + 1) % slides.length;
    const nextPreview = slides[nextSlideIndex];

    return (
        <div className="bg-linear-to-r from-amber-50 to-gray-50 p-8 max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                <div className="lg:col-span-1 space-y-6">
                    <div className="space-y-2">
                        <h1 className="text-5xl lg:text-6xl font-bold bg-linear-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                            50+ Beautiful rooms
                        </h1>

                        <p className="text-xl text-gray-600 leading-relaxed">
                            Our designer already made a lot of beautiful
                            <span className="font-semibold"> prototype of rooms</span>
                            that inspire you
                        </p>
                    </div>

                    <button className="px-8 py-4 bg-linear-to-r from-yellow-500 to-yellow-600 text-white font-semibold text-lg rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
                        Explore More
                    </button>
                </div>

                <div className="lg:col-span-2 grid grid-cols-2 gap-6 h-125">

                    <div className="relative col-span-2 lg:col-span-1 row-span-2 group aspect-square lg:aspect-3/4">

                        <div
                            className="absolute inset-0 bg-cover bg-center rounded-3xl shadow-2xl overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform duration-300"
                            style={{ backgroundImage: `url(${current.image})` }}
                        />

                        <div className="absolute inset-0 bg-black/20 rounded-3xl" />

                        <div className="absolute bottom-8 left-6 right-6">
                            <div className="flex items-center space-x-3 mb-4">
                                <span className="w-10 h-10 bg-white/30 backdrop-blur-sm rounded-xl flex items-center justify-center text-lg font-bold text-white">
                                    {current.id}
                                </span>

                                <span className="text-sm font-medium text-white/90">
                                    {current.title}
                                </span>
                            </div>

                            <h3 className="text-3xl font-bold text-white drop-shadow-lg">
                                {current.subtitle}
                            </h3>
                        </div>

                        <div className="absolute bottom-8 right-8 flex space-x-2">
                            {slides.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => goToSlide(index)}
                                    className={`w-3 h-3 rounded-full transition-all duration-300 cursor-pointer ${
                                        index === currentSlide
                                            ? "w-8 bg-yellow-400 shadow-lg"
                                            : "bg-white/50 hover:bg-white/70"
                                    }`}
                                    aria-label={`Go to slide ${index + 1}`}
                                />
                            ))}
                        </div>

                        <button
                            onClick={nextSlide}
                            className="absolute -right-4 top-1/2 -translate-y-1/2 w-16 h-16 bg-yellow-500/90 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-xl font-bold shadow-2xl hover:scale-110 transition-all duration-300 z-10"
                            aria-label="Next slide"
                        >
                            <ChevronRight />
                        </button>
                    </div>

                    <div
                        className="relative aspect-square bg-cover bg-center rounded-2xl shadow-xl overflow-hidden hover:scale-105 hover:shadow-2xl cursor-pointer transition-all duration-300 border-4 border-white/50 hover:border-yellow-400/70"
                        style={{ backgroundImage: `url(${nextPreview.image})` }}
                        onClick={() => goToSlide(nextSlideIndex)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                goToSlide(nextSlideIndex);
                            }
                        }}
                    >
                        <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent rounded-2xl" />

                        <div className="absolute bottom-4 left-4 text-white text-sm">
                            <div className="font-semibold">
                                {nextPreview.subtitle}
                            </div>

                            <div className="text-xs opacity-90">
                                Next • Click to view
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default BannerSlider;
