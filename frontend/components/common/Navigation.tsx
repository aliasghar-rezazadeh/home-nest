
import Link from "next/link";
import "../template/menuLine.css";

type NavigationProps = {
  className?: string;
  onNavigate?: () => void;
};

function Navigation({
  className = "",
  onNavigate,
}: NavigationProps) {
  const navItems = [
    { href: "/", text: "Home" },
    { href: "/shop", text: "Shop" },
    { href: "/", text: "About" },
    { href: "/contact", text: "Contact" },
  ];

  return (
    <>
      {navItems.map((item) => (
        <li key={item.text} className={`${className} list-none`}>
          <Link
            href={item.href}
            className="menu-a"
            onClick={onNavigate}
          >
            {item.text}
          </Link>
        </li>
      ))}
    </>
  );
}

export default Navigation;
