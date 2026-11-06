
import Link from "next/link";

import {
  User,
  Search,
  Heart,
  ShoppingCart,
  ArrowRightLeft,
} from "lucide-react";

function IconNav() {
  const icons = [
    { label: "Account", href: "/", icon: User },
    { label: "Search", href: "/", icon: Search },
    { label: "Wishlist", href: "/wishlist", icon: Heart },
    { label: "Compare", href: "/compare", icon: ArrowRightLeft },
    { label: "Cart", href: "/shopping-cart", icon: ShoppingCart },
  ];

  return (
    <ul className="flex items-center gap-4">
      {icons.map((item) => {
        const Icon = item.icon;

        return (
          <li key={item.label}>
            <Link
              href={item.href}
              aria-label={item.label}
              className="rounded-md p-2 text-gray-600 transition-colors hover:text-blue-600"
            >
              <Icon strokeWidth={1.5} />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export default IconNav;
