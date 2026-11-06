
"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { motion } from "framer-motion";
import { X, User, Search, Heart, ShoppingCart } from "lucide-react";
import Link from "next/link";
import Navigation from "@/components/common/Navigation";

type MobileMenuProps = {
  onClose: () => void;
};

function MobileMenu({ onClose }: MobileMenuProps) {
  const iconItems = [
    { label: "User", href: "/", icon: <User /> },
    { label: "Search", href: "/", icon: <Search /> },
    { label: "Wishlist", href: "/wishlist", icon: <Heart /> },
    { label: "Shop", href: "/shop", icon: <ShoppingCart /> },
  ];

  return (
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40" />

      <Dialog.Content className="fixed right-0 top-0 z-50 w-full bg-white p-4 shadow-xl">
        <Dialog.Title className="sr-only">
          Mobile menu
        </Dialog.Title>

        <Dialog.Description className="sr-only">
          Navigation links and useful icons for the mobile menu.
        </Dialog.Description>

        <Dialog.Close asChild>
          <button
            type="button"
            className="absolute right-4 top-4 rounded-md p-2 text-gray-600 hover:text-gray-900"
            aria-label="بستن منو"
          >
            <X size={24} />
          </button>
        </Dialog.Close>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-11 p-2.5"
        >
          <nav onClick={onClose}>
            <ul className="flex flex-col items-center justify-center">
              <Navigation className="w-full border-b border-gray-100 py-2" />
            </ul>
          </nav>

          <div className="mt-4 flex justify-between gap-12 lg:hidden">
            {iconItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-gray-500"
                onClick={onClose}
                aria-label={item.label}
              >
                {item.icon}
              </Link>
            ))}
          </div>
        </motion.div>
      </Dialog.Content>
    </Dialog.Portal>
  );
}

export default MobileMenu;
