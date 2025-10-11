import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import logoUpi from "../assets/logo-upi.png";
import logoLppm from "../assets/logo-lppm.png";
import { Link, useLocation } from "react-router-dom";
import { FaBars, FaTimes, FaInstagram, FaYoutube } from "react-icons/fa";

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
  const location = useLocation();
  const [showNav, setShowNav] = useState(true);
  const [showImportantLinks, setShowImportantLinks] = useState(() =>
    typeof window !== "undefined" ? window.scrollY < 8 : true
  );
  const [mobileOpen, setMobileOpen] = useState(false);
  const lastYRef = useRef(0);
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth >= 768 : false
  );
  const [activeItem, setActiveItem] = useState("");

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
        if (currentY < 8) {
          setShowImportantLinks(true);
          setShowNav(true);
        } else {
          setShowImportantLinks(false);
          if (isScrollingDown) {
            setShowNav(false);
            setMobileOpen(false);
          } else if (isScrollingUp) {
            setShowNav(true);
          }
        }
      } else {
        if (currentY < 8) {
          setShowImportantLinks(true);
          setShowNav(true);
        } else {
          setShowImportantLinks(false);
          if (isScrollingDown) {
            setShowNav(false);
            setMobileOpen(false);
          } else if (isScrollingUp) {
            setShowNav(true);
          }
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

  const isHome = location.pathname === "/";

  // Update active item based on current pathname
  useEffect(() => {
    const currentPath = location.pathname;
    const activeNav = navItems.find(item => 
      item.href === "/" ? currentPath === "/" : currentPath.startsWith(item.href)
    );
    
    if (activeNav) {
      setActiveItem(activeNav.label);
    } else {
      setActiveItem("");
    }
  }, [location.pathname]);

  return (
    <header className='fixed top-0 left-0 right-0 z-50 text-white'>
      <motion.div
        initial={{
          height: showImportantLinks ? "auto" : 0,
          opacity: showImportantLinks ? 1 : 0,
        }}
        animate={{
          height: showImportantLinks ? "auto" : 0,
          opacity: showImportantLinks ? 1 : 0,
        }}
        transition={{ type: "tween", duration: 0.25 }}
        className='bg-black overflow-hidden'
      >
        <div className='py-2 md:py-4'>
          <div className='mx-auto px-3 md:px-24'>
            <div className='md:hidden'>
              <div className='flex flex-wrap justify-center items-center gap-0.5 text-[11px]'>
                <a
                  href='https://sinta.kemdiktisaintek.go.id/affiliations/profile/414'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='font-medium transition text-white hover:text-white/80 px-1 py-0.5 leading-none'
                >
                  SINTA UPI
                </a>
                <span className='text-white/40 text-[8px]'>•</span>
                <a
                  href='https://litabmas.upi.edu/'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='font-medium transition text-white hover:text-white/80 px-1 py-0.5 leading-none'
                >
                  Litabmas
                </a>
                <span className='text-white/40 text-[8px]'>•</span>
                <a
                  href='https://kkn.upi.edu/login'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='font-medium transition text-white hover:text-white/80 px-1 py-0.5 leading-none'
                >
                  KKN
                </a>
                <span className='text-white/40 text-[8px]'>•</span>
                <a
                  href='https://bima.kemdiktisaintek.go.id/'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='font-medium transition text-white hover:text-white/80 px-1 py-0.5 leading-none'
                >
                  BIMA
                </a>
                <div className='flex items-center ml-0.5'>
                  <a
                    href='https://www.instagram.com/dppmupi_untukindonesia/'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-white/80 hover:text-white transition-colors p-0.5'
                    aria-label='Instagram'
                  >
                    <FaInstagram className='w-2.5 h-2.5' />
                  </a>
                  <a
                    href='https://www.youtube.com/@lppmupi3369'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-white/80 hover:text-white transition-colors p-0.5'
                    aria-label='YouTube'
                  >
                    <FaYoutube className='w-2.5 h-2.5' />
                  </a>
                </div>
              </div>
            </div>

            <div className='hidden md:flex flex-wrap justify-end gap-4'>
              <a
                href='https://sinta.kemdiktisaintek.go.id/affiliations/profile/414'
                target='_blank'
                rel='noopener noreferrer'
                className='text-sm font-medium transition whitespace-nowrap text-white hover:text-white/80'
              >
                SINTA UPI
              </a>
              <a
                href='https://litabmas.upi.edu/'
                target='_blank'
                rel='noopener noreferrer'
                className='text-sm font-medium transition whitespace-nowrap text-white hover:text-white/80'
              >
                Litabmas UPI
              </a>
              <a
                href='https://kkn.upi.edu/login'
                target='_blank'
                rel='noopener noreferrer'
                className='text-sm font-medium transition whitespace-nowrap text-white hover:text-white/80'
              >
                KKN Tematik & P2MB
              </a>
              <a
                href='https://bima.kemdiktisaintek.go.id/'
                target='_blank'
                rel='noopener noreferrer'
                className='text-sm font-medium transition whitespace-nowrap text-white hover:text-white/80'
              >
                BIMA
              </a>

              <div className='flex items-center gap-3 ml-4'>
                <a
                  href='https://www.instagram.com/dppmupi_untukindonesia/'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-white/80 hover:text-white transition-colors'
                  aria-label='Instagram'
                >
                  <FaInstagram className='w-4 h-4' />
                </a>
                <a
                  href='https://www.youtube.com/@lppmupi3369'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-white/80 hover:text-white transition-colors'
                  aria-label='YouTube'
                >
                  <FaYoutube className='w-4 h-4' />
                </a>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className='bg-[#D52727]'>
        <div className='w-full px-4 md:px-24 py-3 flex items-center'>
          <div className='flex-1 min-w-0 flex items-center gap-3'>
            <img src={logoUpi} alt='Logo UPI' className='h-8 md:h-14 w-auto' />
            <img
              src={logoLppm}
              alt='Logo LPPM'
              className='h-6 md:h-11 w-auto'
            />
          </div>

          {!isHome && (
            <button
              className='md:hidden inline-flex items-center justify-center rounded-md p-1.5 bg-white/10 hover:bg-white/20 transition ml-2 shrink-0'
              aria-label={mobileOpen ? 'Tutup Menu' : 'Buka Menu'}
              onClick={() => {
                setShowNav(true);
                setMobileOpen((v) => !v);
              }}
            >
              {mobileOpen ? (
                <FaTimes className='w-5 h-5' />
              ) : (
                <FaBars className='w-5 h-5' />
              )}
            </button>
          )}
        </div>
      </div>

      {!isHome && (
        <motion.nav
          initial={{ height: 0, opacity: 0 }}
          animate={{
            height: isDesktop
              ? 48
              : mobileOpen
              ? 'auto'
              : 0,
            opacity: isDesktop || mobileOpen ? 1 : 0,
          }}
          transition={{ type: "tween", duration: 0.25 }}
          className='w-full bg-[#D52727] md:border-t md:border-white/20 overflow-hidden'
        >
          <div className='hidden md:flex items-center justify-between w-full px-6 md:px-36 h-12'>
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                onClick={() => setActiveItem(item.label)}
                className={`px-4 py-2 text-sm font-medium transition whitespace-nowrap hover:text-white/90 ${
                  (item.href === '/' ? location.pathname === '/' : location.pathname.startsWith(item.href))
                    ? 'text-white font-semibold'
                    : 'text-white/60'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className='md:hidden'>
            <motion.div
              initial={false}
              animate={{
                opacity: mobileOpen && showNav ? 1 : 0,
              }}
              transition={{ duration: 0.25 }}
              className='overflow-hidden'
            >
              <div className='px-4 py-2 grid grid-cols-2 gap-2 text-sm mb-2'>
                {navItems.map((item) => (
                  <Link
                    key={item.label}
                    to={item.href}
                    className={`text-[13px] font-medium transition ${
                      activeItem === item.label
                        ? "text-white font-semibold"
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
      )}
    </header>
  );
}
