"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import IconNav from "./IconNav";
import Logo from "./Logo";
import MobileMenu from "./MobileMenu";
import Navigation from "@/components/common/Navigation";

function Header() {
    const [open, setOpen] = useState(false);

    return (
        <header id="header" className="sticky top-0 z-50 max-w-full bg-[#ffffff29] py-2.5 shadow-md backdrop-blur-lg">
            <div id="laptop"
                className="hidden h-15 w-full flex-row items-center justify-between text-black xl:flex xl:px-5 2xl:px-25"
            >
                <Logo />

                <nav>
                <ul className="flex flex-2 justify-center list-none">
                    <Navigation className="2xl:mx-[37.5px] xl:mx-5" />
                </ul>
                </nav>

                <IconNav />
            </div>

            {/* Mobile */}
            <div
                id="mobile"
                className="flex h-10 flex-row items-center justify-between px-4 xl:hidden"
            >
                <Logo />

                <div className="hidden lg:flex xl:hidden">
                <IconNav />
                </div>

                <Dialog.Root open={open} onOpenChange={setOpen}>
                <Dialog.Trigger asChild>
                    <button
                    type="button"
                    aria-label="باز کردن منو"
                    className="relative flex h-6 w-8 flex-col items-center justify-between"
                    >
                    <span
                        className={`block h-0.75 w-8 bg-black transition-all duration-300 ${
                        open ? "translate-y-2 rotate-45" : ""
                        }`}
                    />

                    <span
                        className={`block h-0.75 w-8 bg-black transition-all duration-300 ${
                        open ? "opacity-0" : ""
                        }`}
                    />

                    <span
                        className={`block h-0.75 w-8 bg-black transition-all duration-300 ${
                        open ? "-translate-y-2 -rotate-45" : ""
                        }`}
                    />
                    </button>
                </Dialog.Trigger>

                <MobileMenu onClose={() => setOpen(false)} />
                </Dialog.Root>
            </div>
        </header>
    );
}

export default Header;