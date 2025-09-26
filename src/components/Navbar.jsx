import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import logoUpi from "../assets/logo-upi.png";
import logoLppm from "../assets/logo-lppm.png";
import { Link } from "react-router-dom";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Profiles", href: "/profiles" },
  { label: "Organization", href: "/organization" },
  { label: "Paper", href: "/paper" },
  { label: "Project", href: "/project" },
  { label: "Patent", href: "/patent" },
  { label: "Outreach", href: "/outreach" },
  { label: "Thesis", href: "/thesis" },
  { label: "Equipment", href: "/equipment" },
];

export default function Navbar() {
  const [showNav, setShowNav] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const lastYRef = useRef(0);
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth >= 768 : false
  );
  const [activeItem, setActiveItem] = useState("Home");

  useEffect(() => {
    const onResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener("resize", onResize);

    lastYRef.current = window.scrollY;
    const onScroll = () => {
      const currentY = window.scrollY;
      const delta = currentY - lastYRef.current;
      const isScrollingDown = delta > 3;
      const isScrollingUp = delta < -3;

      if (isDesktop) {
        setShowNav(currentY < 8);
        if (currentY >= 8) setMobileOpen(false);
      } else {
        if (currentY < 8) {
          setShowNav(true);
        } else if (isScrollingDown) {
          setShowNav(false);
          setMobileOpen(false);
        } else if (isScrollingUp) {
          setShowNav(true);
        }
      }

      lastYRef.current = currentY;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [isDesktop]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 text-white bg-[#D52727]">
      <div className="w-full px-6 md:px-24 py-3 flex items-center">
        {/* Logo */}
        <div className="flex-1 min-w-0 flex items-center gap-3">
          <img src={logoUpi} alt="Logo UPI" className="h-8 md:h-10 w-auto" />
          <img src={logoLppm} alt="Logo LPPM" className="h-7 md:h-9 w-auto" />
        </div>

        {/* Mobile button */}
        <button
          className="md:hidden inline-flex items-center justify-center rounded-md px-3 py-2 bg-white/10 hover:bg-white/20 transition ml-3 shrink-0"
          aria-label="Toggle Menu"
          onClick={() => setMobileOpen((v) => !v)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-6 h-6"
          >
            <path
              fillRule="evenodd"
              d="M3.75 5.25a.75.75 0 01.75-.75h15a.75.75 0 010 1.5h-15a.75.75 0 01-.75-.75zm0 
                 6.75c0-.414.336-.75.75-.75h15a.75.75 0 
                 010 1.5h-15a.75.75 0 01-.75-.75zm.75 
                 6a.75.75 0 000 1.5h15a.75.75 0 
                 000-1.5h-15z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {/* Desktop nav */}
      <motion.nav
        initial={{ height: 48, opacity: 1 }}
        animate={{
          height: isDesktop ? (showNav ? 48 : 0) : showNav ? "auto" : 0,
          opacity: showNav ? 1 : 0,
        }}
        transition={{ type: "tween", duration: 0.25 }}
        className="w-full md:border-t md:border-white/20 overflow-hidden"
      >
        <div className="hidden md:flex items-center justify-between w-full px-6 md:px-36 h-12">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              onClick={() => setActiveItem(item.label)}
              className={`text-sm font-medium transition whitespace-nowrap ${
                activeItem === item.label
                  ? "text-white"
                  : "text-white/80 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Mobile nav */}
        <div className="md:hidden">
          <motion.div
            initial={false}
            animate={{
              height: mobileOpen && showNav ? "auto" : 0,
              opacity: mobileOpen && showNav ? 1 : 0,
            }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-6 py-3 grid grid-cols-2 gap-3">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  className={`text-sm font-medium transition ${
                    activeItem === item.label
                      ? "text-white"
                      : "text-white/80 hover:text-white"
                  }`}
                  onClick={() => {
                    setActiveItem(item.label);
                    setMobileOpen(false);
                  }}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.nav>
    </header>
  );
}
