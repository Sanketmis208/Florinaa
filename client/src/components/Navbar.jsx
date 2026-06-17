import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, ArrowRight, Download, Phone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Pages that have a dark hero banner at the top
const DARK_HERO_PAGES = ["/", "/about"];

const Navbar = ({ onDownloadCatalog }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Whether the current page has a dark hero — if so, use light text before scroll
  const hasDarkHero = DARK_HERO_PAGES.includes(location.pathname);

  // Determine if text should be light (white) or dark
  const isLight = hasDarkHero && !isScrolled;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isMobileMenuOpen]);

  const handleNavClick = useCallback((sectionId) => {
    setIsMobileMenuOpen(false);
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
      }, 400);
    } else {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
    }
  }, [location.pathname, navigate]);

  const navLinks = [
    { label: "Collection", action: () => handleNavClick("collection") },
    { label: "Excellence", action: () => handleNavClick("excellence") },
    { label: "Process", action: () => handleNavClick("process") },
    { label: "Testimonials", action: () => handleNavClick("testimonials") },
    { label: "Products", path: "/products", isLink: true },
    { label: "About", path: "/about", isLink: true },
  ];

  // Animation variants for mobile menu
  const overlayVariants = {
    closed: { opacity: 0 },
    open: { opacity: 1 },
  };

  const panelVariants = {
    closed: { x: "100%" },
    open: { x: 0, transition: { type: "spring", damping: 30, stiffness: 300 } },
  };

  const linkVariants = {
    closed: { opacity: 0, x: 30 },
    open: (i) => ({
      opacity: 1,
      x: 0,
      transition: { delay: 0.15 + i * 0.06, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
    }),
  };

  // Dynamic color classes
  const linkColor = isLight
    ? "text-white/80 hover:text-white"
    : "text-primary/75 hover:text-primary";

  const catalogBtnColor = isLight
    ? "text-white/70 hover:text-accent border-white/20 hover:border-accent/40"
    : "text-primary/70 hover:text-accent border-primary/15 hover:border-accent/40";

  const mobileBtnColor = isLight
    ? "border-white/20 text-white/60 hover:text-accent hover:border-accent/40"
    : "border-primary/15 text-primary/60 hover:text-accent hover:border-accent/40";

  return (
    <>
      {/* ─── Main Navigation ─── */}
      <motion.header
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ease-out ${
          isScrolled
            ? "glass-panel shadow-[0_4px_30px_rgba(0,0,0,0.06)]"
            : "bg-transparent"
        }`}
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className={`flex items-center justify-between transition-all duration-500 ${
            isScrolled ? "h-16 md:h-[68px]" : "h-18 md:h-20"
          }`}>
            
            {/* ─── Logo ─── */}
            <Link to="/" className="flex items-center group shrink-0">
              <img
                src="/FLORINAA_Logo_Transparent.png"
                alt="Florinaa"
                className={`w-auto object-contain transition-all duration-500 group-hover:scale-[1.03] ${
                  isScrolled ? "h-9 md:h-10" : "h-10 md:h-12"
                } ${isLight ? "brightness-0 invert" : ""}`}
              />
            </Link>

            {/* ─── Desktop Navigation Links ─── */}
            <nav className="hidden lg:flex items-center">
              <ul className="flex items-center gap-1">
                {navLinks.map((link, idx) => (
                  <li key={idx}>
                    {link.isLink ? (
                      <Link
                        to={link.path}
                        className={`relative px-4 py-2 text-[11px] font-semibold tracking-[0.15em] uppercase nav-link-hover transition-colors duration-300 ${linkColor}`}
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <button
                        onClick={link.action}
                        className={`relative px-4 py-2 text-[11px] font-semibold tracking-[0.15em] uppercase cursor-pointer nav-link-hover transition-colors duration-300 ${linkColor}`}
                      >
                        {link.label}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </nav>

            {/* ─── Desktop CTAs ─── */}
            <div className="hidden lg:flex items-center gap-3">
              <button
                onClick={onDownloadCatalog}
                className={`group flex items-center gap-2 px-5 py-2.5 text-[10px] font-bold tracking-[0.15em] uppercase border rounded-full transition-all duration-300 cursor-pointer ${catalogBtnColor}`}
              >
                <Download size={13} className="transition-transform duration-300 group-hover:-translate-y-[1px]" />
                Catalogue
              </button>
              <button
                onClick={() => handleNavClick("inquiry")}
                className={`group flex items-center gap-2 px-6 py-2.5 text-[10px] font-bold tracking-[0.15em] uppercase rounded-full transition-all duration-300 cursor-pointer ${
                  isLight
                    ? "text-primary bg-white hover:bg-white/90 shadow-[0_2px_16px_rgba(255,255,255,0.15)]"
                    : "text-white bg-primary hover:bg-primary/90 shadow-[0_2px_16px_rgba(17,17,17,0.15)] hover:shadow-[0_4px_24px_rgba(17,17,17,0.25)]"
                }`}
              >
                Get Quote
                <ArrowRight size={13} className="transition-transform duration-300 group-hover:translate-x-[2px]" />
              </button>
            </div>

            {/* ─── Mobile Controls ─── */}
            <div className="flex items-center gap-2.5 lg:hidden">
              <button
                onClick={onDownloadCatalog}
                className={`w-10 h-10 flex items-center justify-center rounded-full border transition-all duration-300 cursor-pointer ${mobileBtnColor}`}
                aria-label="Download Catalogue"
              >
                <Download size={15} />
              </button>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`relative w-10 h-10 flex items-center justify-center rounded-full cursor-pointer transition-all duration-300 active:scale-95 ${
                  isLight ? "bg-white text-primary" : "bg-primary text-white"
                }`}
                aria-label={isMobileMenuOpen ? "Close Menu" : "Open Menu"}
              >
                <AnimatePresence mode="wait">
                  {isMobileMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <X size={18} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Menu size={18} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* ─── Mobile Full-Screen Menu ─── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Dimmed Backdrop */}
            <motion.div
              className="fixed inset-0 z-40 bg-black/40"
              variants={overlayVariants}
              initial="closed"
              animate="open"
              exit="closed"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Slide-in Panel */}
            <motion.div
              className="fixed top-0 right-0 bottom-0 z-[45] w-full max-w-sm bg-secondary shadow-2xl flex flex-col"
              variants={panelVariants}
              initial="closed"
              animate="open"
              exit="closed"
            >
              {/* Panel Header */}
              <div className="flex items-center justify-between px-8 h-20 border-b border-primary/5">
                <div className="flex items-center">
                  <img
                    src="/FLORINAA_Logo_Transparent.png"
                    alt="Florinaa"
                    className="h-8 w-auto object-contain"
                  />
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-primary/5 text-primary/60 hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Nav Links */}
              <nav className="flex-grow px-8 py-10 flex flex-col gap-1">
                {navLinks.map((link, idx) => (
                  <motion.div
                    key={idx}
                    custom={idx}
                    variants={linkVariants}
                    initial="closed"
                    animate="open"
                  >
                    {link.isLink ? (
                      <Link
                        to={link.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center justify-between py-4 border-b border-primary/5 text-primary text-base font-medium tracking-wider hover:text-accent transition-colors group"
                      >
                        <span>{link.label}</span>
                        <ArrowRight size={14} className="text-accent/40 group-hover:text-accent group-hover:translate-x-1 transition-all duration-300" />
                      </Link>
                    ) : (
                      <button
                        onClick={link.action}
                        className="w-full flex items-center justify-between py-4 border-b border-primary/5 text-primary text-base font-medium tracking-wider hover:text-accent transition-colors cursor-pointer group text-left"
                      >
                        <span>{link.label}</span>
                        <ArrowRight size={14} className="text-accent/40 group-hover:text-accent group-hover:translate-x-1 transition-all duration-300" />
                      </button>
                    )}
                  </motion.div>
                ))}
              </nav>

              {/* Panel Footer CTAs */}
              <motion.div
                className="px-8 pb-8 pt-4 border-t border-primary/5 space-y-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.4 }}
              >
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onDownloadCatalog();
                  }}
                  className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-full border border-primary/15 text-primary text-[11px] font-bold tracking-[0.15em] uppercase hover:border-accent hover:text-accent transition-all cursor-pointer"
                >
                  <Download size={14} />
                  Download Catalogue
                </button>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleNavClick("inquiry");
                  }}
                  className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-full bg-primary text-white text-[11px] font-bold tracking-[0.15em] uppercase shadow-lg hover:bg-primary/90 transition-all cursor-pointer"
                >
                  Get a Quote
                  <ArrowRight size={14} />
                </button>

                <div className="text-center pt-4">
                  <a
                    href="tel:+919879619815"
                    className="inline-flex items-center gap-1.5 text-[10px] tracking-widest uppercase text-accent font-semibold hover:text-accent-dark transition-colors"
                  >
                    <Phone size={10} />
                    +91 98796 19815
                  </a>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
