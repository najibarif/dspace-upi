import { useEffect, useState } from "react";

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      aria-label='Back to top'
      onClick={scrollTop}
      className={`fixed bottom-6 right-6 md:bottom-8 md:right-8 z-40 rounded-full shadow-lg transition-all duration-200 bg-[#D52727] text-white p-3 md:p-3.5 hover:bg-[#bb1f1f] focus:outline-none focus:ring-4 focus:ring-[#D52727]/30 ${
        visible
          ? "opacity-100 translate-y-0"
          : "opacity-0 pointer-events-none translate-y-3"
      }`}
    >
      <svg
        xmlns='http://www.w3.org/2000/svg'
        viewBox='0 0 24 24'
        fill='currentColor'
        className='w-5 h-5'
      >
        <path
          fillRule='evenodd'
          d='M12 20.25a.75.75 0 01-.75-.75V7.31l-3.22 3.22a.75.75 0 11-1.06-1.06l4.5-4.5a.75.75 0 011.06 0l4.5 4.5a.75.75 0 11-1.06 1.06L12.75 7.31V19.5a.75.75 0 01-.75.75z'
          clipRule='evenodd'
        />
      </svg>
    </button>
  );
}
