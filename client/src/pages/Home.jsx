import React, { useEffect, useRef, useState, Suspense, lazy } from "react";
import BlurText from "../components/BlurText";
import { Link } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Factory,
  Cpu,
  Sparkles,
  Check,
  ChevronRightCircle,
  CheckCircle,
  Building,
  Mail,
  Phone,
  User,
  Layers,
  Award,
  Users,
} from "lucide-react";
import { contentAPI, productsAPI, leadsAPI } from "../services/api";

const Hero3DCanvas = lazy(() => import("../components/Hero3DCanvas"));

gsap.registerPlugin(ScrollTrigger);

// Custom Counter Component that animates on scroll
const ScrollCounter = ({
  target,
  duration = 2,
  suffix = "",
  finalValue = "",
}) => {
  const [count, setCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          let start = 0;
          const end = parseInt(target);
          if (start === end) {
            setIsFinished(true);
            return;
          }

          const totalMiliseconds = duration * 1000;
          const incrementTime = Math.max(
            Math.floor(totalMiliseconds / end),
            30,
          );

          const timer = setInterval(() => {
            start += Math.ceil(end / (totalMiliseconds / incrementTime));
            if (start >= end) {
              clearInterval(timer);
              setCount(end);
              setIsFinished(true);
            } else {
              setCount(start);
            }
          }, incrementTime);

          observer.unobserve(elementRef.current);
        }
      },
      { threshold: 0.1 },
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [target, duration]);

  return (
    <span
      ref={elementRef}
      className="font-serif text-5xl md:text-6xl font-bold text-accent"
    >
      {isFinished && finalValue
        ? finalValue
        : `${count.toLocaleString()}${suffix}`}
    </span>
  );
};

const Home = ({ onDownloadCatalog }) => {
  const horizontalSectionRef = useRef(null);
  const horizontalTriggerRef = useRef(null);
  const heroRef = useRef(null);
  const mouseLightRef = useRef(null);
  const mouseX = useRef(0);
  const mouseY = useRef(0);

  const [activeStep, setActiveStep] = useState(1);
  const [inquiryForm, setInquiryForm] = useState({
    companyName: "",
    contactName: "",
    requirement: "",
    category: "blankets",
    email: "",
    phone: "",
  });
  const [inquirySuccess, setInquirySuccess] = useState(false);
  const [inquiryError, setInquiryError] = useState("");

  const [activeTestimonial, setActiveTestimonial] = useState(0);

  // Fetch content and products from API
  const { data: contentData } = useQuery({
    queryKey: ["content"],
    queryFn: contentAPI.get,
  });

  const { data: productsData } = useQuery({
    queryKey: ["products"],
    queryFn: productsAPI.getAll,
  });

  // Featured products filter
  const visibleProducts =
    productsData?.filter((p) => p.visible !== false) || [];
  const featuredProducts = visibleProducts.filter((p) => p.featured);

  // Submit inquiry mutation
  const inquiryMutation = useMutation({
    mutationFn: (data) => leadsAPI.submit(data),
    onSuccess: (data, variables) => {
      setInquirySuccess(true);
      setInquiryError("");

      // Redirect to WhatsApp
      const name = variables.name || "";
      const company = variables.companyName || "Personal";
      const email = variables.email || "";
      const phone = variables.phone || "";
      const requirement = variables.requirement || "";

      const whatsappText = `Hello, I've submitted a wholesale inquiry:\n\n*Customer Name:* ${name}\n*Company:* ${company}\n*Email:* ${email}\n*Phone:* ${phone}\n\n*Inquiry Details:*\n${requirement}`;
      const whatsappUrl = `https://wa.me/919879619815?text=${encodeURIComponent(whatsappText)}`;
      window.open(whatsappUrl, "_blank");

      setInquiryForm({
        companyName: "",
        contactName: "",
        requirement: "",
        category: "blankets",
        email: "",
        phone: "",
      });
      setTimeout(() => {
        setInquirySuccess(false);
        setActiveStep(1);
      }, 5000);
    },
    onError: (err) => {
      setInquiryError(
        err.response?.data?.error || "Inquiry submission failed.",
      );
    },
  });

  // Hero Mouse Movement Effect
  const handleHeroMouseMove = (e) => {
    if (!heroRef.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } =
      heroRef.current.getBoundingClientRect();
    
    // Normalize coordinates to [-1, 1] for WebGL 3D Canvas
    mouseX.current = ((clientX - left) / width) * 2 - 1;
    mouseY.current = -(((clientY - top) / height) * 2 - 1);

    const x = ((clientX - left) / width - 0.5) * 30; // Max offset 30px
    const y = ((clientY - top) / height - 0.5) * 30;

    gsap.to(".hero-bg-image", {
      x: x,
      y: y,
      duration: 1.5,
      ease: "power2.out",
    });

    if (mouseLightRef.current) {
      gsap.to(mouseLightRef.current, {
        x: clientX - left - 150,
        y: clientY - top - 150,
        duration: 0.8,
        ease: "power3.out",
      });
    }
  };

  // GSAP animations on mount
  useEffect(() => {
    // 1. Hero Content Entrance
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.from(".hero-canvas-container", {
        opacity: 0,
        duration: 1.8,
        ease: "power2.inOut",
      });

      tl.from(".hero-sub", {
        opacity: 0,
        y: 40,
        duration: 1.2,
      }, "-=1.0");

      tl.from(".hero-ctas", {
        opacity: 0,
        y: 30,
        duration: 1.0,
      }, "-=0.8");

      // 2. Parallax Hero Scroll Effect
      gsap.to(".hero-bg-image", {
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
        scale: 1.15,
        yPercent: 20,
      });

      // 3. GSAP Horizontal Scroll for Product Experience
      if (horizontalSectionRef.current && featuredProducts.length > 1) {
        gsap.to(horizontalSectionRef.current, {
          x: () => -(horizontalSectionRef.current.scrollWidth - window.innerWidth),
          ease: "none",
          scrollTrigger: {
            trigger: horizontalTriggerRef.current,
            pin: true,
            scrub: 1,
            start: "top top",
            end: () =>
              `+=${horizontalSectionRef.current.scrollWidth - window.innerWidth}`,
            invalidateOnRefresh: true,
          },
        });
      }
    });

    return () => ctx.revert();
  }, [featuredProducts.length]);

  // Testimonials Auto-sliding
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const testimonials = [
    {
      quote:
        "Florinaa blankets have elevated our hotel rooms to a whole new level. Our guests regularly comment on the luxury softness and weight of the mink blankets.",
      author: "Radisson Blu, Sourcing Manager",
      location: "New Delhi",
      rating: 5,
    },
    {
      quote:
        "As textile exporters to European markets, Maulifab's finishing and quality check procedures are second to none. Reliable GSM weight and exquisite packaging.",
      author: "V. K. Export House, Managing Director",
      location: "Mumbai Port",
      rating: 5,
    },
    {
      quote:
        "Custom dimensions and bespoke weaving patterns were delivered on time. The hotel collection sheets feel exactly like Egyptian cotton but with higher longevity.",
      author: "Taj Gateway Resorts, Operations Lead",
      location: "Goa",
      rating: 5,
    },
  ];

  const handleNextStep = () => {
    if (
      activeStep === 1 &&
      (!inquiryForm.contactName || !inquiryForm.companyName)
    ) {
      setInquiryError("Please enter your name and company name.");
      return;
    }
    if (activeStep === 2 && !inquiryForm.requirement) {
      setInquiryError("Please describe your bulk procurement requirements.");
      return;
    }
    setInquiryError("");
    setActiveStep(activeStep + 1);
  };

  const handlePrevStep = () => {
    setInquiryError("");
    setActiveStep(activeStep - 1);
  };

  const handleInquirySubmit = (e) => {
    e.preventDefault();
    if (!inquiryForm.email || !inquiryForm.phone) {
      setInquiryError("Please fill out your email and phone details.");
      return;
    }
    setInquiryError("");
    inquiryMutation.mutate({
      name: inquiryForm.contactName,
      companyName: inquiryForm.companyName,
      requirement: `Category: ${inquiryForm.category}\nRequirements: ${inquiryForm.requirement}`,
      email: inquiryForm.email,
      phone: inquiryForm.phone,
      type: "inquiry",
    });
  };

  return (
    <div className="overflow-x-hidden">
      {/* 1. HERO SECTION */}
      <section
        ref={heroRef}
        onMouseMove={handleHeroMouseMove}
        className="relative h-screen w-full flex items-center justify-center bg-primary overflow-hidden"
      >
        {/* Lazy Loaded 3D WebGL Canvas Layer (with mobile/reduced motion 2D fallback) */}
        <div className="hero-canvas-container absolute inset-0 z-0">
          <Suspense fallback={
            <div className="absolute inset-0 bg-gradient-to-tr from-primary via-[#161412] to-[#251e18]" />
          }>
            <Hero3DCanvas mouseX={mouseX} mouseY={mouseY} />
          </Suspense>
        </div>

        {/* Ambient Dark Overlay for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/40 to-black/50 z-10" />

        {/* Hero Content */}
        <div className="relative z-20 max-w-5xl mx-auto px-6 md:px-12 pt-20 text-center text-secondary">
          <div className="hero-title-reveal mb-4">
            <BlurText
              text="Sleep in Luxury"
              tag="h1"
              delay={150}
              animateBy="words"
              direction="top"
              className="heading-luxury text-5xl md:text-7xl lg:text-8xl tracking-tight leading-tight text-white justify-center"
            />
          </div>

          <p className="hero-sub font-sans text-lg md:text-2xl text-secondary/80 font-light tracking-wide max-w-2xl mx-auto mb-10 leading-relaxed">
            {contentData?.heroSubtitle ||
              "Crafted Premium Blankets & Textile Excellence Since 2012."}
          </p>

          <div className="hero-ctas flex flex-col sm:flex-row items-center justify-center gap-5">
            <Link
              to="/products"
              className="shimmer-glow flex items-center gap-2.5 px-8 py-4 rounded-full bg-accent hover:bg-accent-dark text-primary font-semibold text-sm uppercase tracking-wider shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer w-full sm:w-auto text-center justify-center"
            >
              Explore Collection
              <ArrowRight size={16} />
            </Link>
            <button
              onClick={onDownloadCatalog}
              className="shimmer-glow flex items-center justify-center gap-2.5 px-8 py-4 rounded-full border border-white/30 hover:border-white bg-white/5 hover:bg-white/10 text-white font-medium text-sm uppercase tracking-wider transition-all duration-300 cursor-pointer w-full sm:w-auto"
            >
              Download Catalogue
            </button>
          </div>
        </div>

        {/* Decorative Down Arrow */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-1.5">
            <div className="w-1.5 h-3 bg-accent rounded-full animate-scroll-down" />
          </div>
        </div>
      </section>

      {/* 2. COLLECTION SHOWCASE SECTION */}
      <section id="collection" className="py-24 bg-secondary">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs uppercase tracking-widest text-accent font-semibold mb-3 block">
              Curated Masterpieces
            </span>
            <BlurText
              text="A Taste of Quiet Luxury"
              tag="h2"
              delay={120}
              animateBy="words"
              direction="bottom"
              className="heading-luxury text-4xl md:text-5xl text-primary font-medium justify-center"
            />
            <div className="w-16 h-[1.5px] bg-accent mx-auto my-6" />
            <p className="text-neutral-600 text-sm md:text-base leading-relaxed">
              Explore our diverse textile arrays engineered for exports, hotel
              suites, and premium home styling.
            </p>
          </div>

          {/* Asymmetric Collection Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Luxury Collection Card */}
            <div className="md:col-span-7 group relative h-[450px] overflow-hidden rounded-2xl shadow-xl transition-all duration-500 hover:shadow-2xl">
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105"
                style={{
                  backgroundImage: `url(https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=1200&q=85)`,
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/30 to-black/10 z-10" />
              <div className="absolute bottom-8 left-8 right-8 z-20">
                <span className="text-xs uppercase text-accent font-semibold tracking-wider">
                  Premium Softness
                </span>
                <h3 className="heading-luxury text-3xl text-white mt-1 mb-3">
                  Luxury Flannel Collection
                </h3>
                <p className="text-secondary/70 text-sm max-w-md mb-4 font-light">
                  Ultra-plush high-density blankets with beautiful embossing and
                  double-sided warmth.
                </p>
                <Link
                  to="/products?category=blankets"
                  className="flex items-center gap-1.5 text-accent font-medium text-xs uppercase tracking-widest hover:text-accent-light transition-colors"
                >
                  View Catalog <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* Winter Warmth Card */}
            <div className="md:col-span-5 group relative h-[450px] overflow-hidden rounded-2xl shadow-xl transition-all duration-500 hover:shadow-2xl">
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105"
                style={{
                  backgroundImage: `url(https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=85)`,
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/30 to-black/10 z-10" />
              <div className="absolute bottom-8 left-8 right-8 z-20">
                <span className="text-xs uppercase text-accent font-semibold tracking-wider">
                  Insulated Quilting
                </span>
                <h3 className="heading-luxury text-3xl text-white mt-1 mb-3">
                  Premium Quilts & Duvets
                </h3>
                <p className="text-secondary/70 text-sm mb-4 font-light">
                  Hollow siliconized fiber filling providing light-weight,
                  cloud-like comfort for cold nights.
                </p>
                <Link
                  to="/products?category=quilts"
                  className="flex items-center gap-1.5 text-accent font-medium text-xs uppercase tracking-widest hover:text-accent-light transition-colors"
                >
                  View Catalog <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* Hotel Collection Card */}
            <div className="md:col-span-5 group relative h-[450px] overflow-hidden rounded-2xl shadow-xl transition-all duration-500 hover:shadow-2xl">
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105"
                style={{
                  backgroundImage: `url(https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=85)`,
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/30 to-black/10 z-10" />
              <div className="absolute bottom-8 left-8 right-8 z-20">
                <span className="text-xs uppercase text-accent font-semibold tracking-wider">
                  Coordinated Comfort
                </span>
                <h3 className="heading-luxury text-3xl text-white mt-1 mb-3">
                  Complete Bedding set
                </h3>
                <p className="text-secondary/70 text-sm mb-4 font-light">
                  Coordinated luxury bedding sets including matching sheets, pillow cases, and duvets designed for an exquisite sleep experience.
                </p>
                <Link
                  to="/products?category=fitted-sheets"
                  className="flex items-center gap-1.5 text-accent font-medium text-xs uppercase tracking-widest hover:text-accent-light transition-colors"
                >
                  View Catalog <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* Export & Rugs Collection */}
            <div className="md:col-span-7 group relative h-[450px] overflow-hidden rounded-2xl shadow-xl transition-all duration-500 hover:shadow-2xl">
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105"
                style={{
                  backgroundImage: `url(https://images.unsplash.com/photo-1600166898405-da9535204843?auto=format&fit=crop&w=1200&q=85)`,
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/30 to-black/10 z-10" />
              <div className="absolute bottom-8 left-8 right-8 z-20">
                <span className="text-xs uppercase text-accent font-semibold tracking-wider">
                  Soft Floor Accent
                </span>
                <h3 className="heading-luxury text-3xl text-white mt-1 mb-3">
                  Flano Carpets & Rugs
                </h3>
                <p className="text-secondary/70 text-sm max-w-md mb-4 font-light">
                  Dense anti-skid floor runners and carpets bringing comfort to
                  every footstep.
                </p>
                <Link
                  to="/products?category=flano-carpets"
                  className="flex items-center gap-1.5 text-accent font-medium text-xs uppercase tracking-widest hover:text-accent-light transition-colors"
                >
                  View Catalog <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. MANUFACTURING EXCELLENCE SECTION */}
      <section
        id="excellence"
        className="py-24 bg-primary text-white relative overflow-hidden"
      >
        {/* Glow ambient backgrounds */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-accent/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-accent/5 blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <span className="text-xs uppercase tracking-widest text-accent font-semibold">
                Behind the Weaves
              </span>
              <BlurText
                text="Craftsmanship at Scale"
                tag="h2"
                delay={130}
                animateBy="words"
                direction="top"
                className="heading-luxury text-4xl md:text-5xl text-white font-medium leading-tight"
              />
              <p className="text-secondary/75 text-sm md:text-base leading-relaxed font-light">
                Our plant is equipped with high-efficiency carding and
                double-needle weaving machineries, supporting the bulk
                production pipeline of 1lac+ blankets monthly. Quality audits
                examine fiber density, color-fastness, and dimensional symmetry
                before any piece departs Panipat.
              </p>
              <div className="flex flex-col gap-4 mt-2">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-accent/15 flex items-center justify-center border border-accent/30">
                    <Check size={12} className="text-accent" />
                  </div>
                  <span className="text-sm font-light text-secondary/90">
                    OEKO-TEX Certified Safe Fibers
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-accent/15 flex items-center justify-center border border-accent/30">
                    <Check size={12} className="text-accent" />
                  </div>
                  <span className="text-sm font-light text-secondary/90">
                    Anti-Pilling, Double-Stitched Borders
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-accent/15 flex items-center justify-center border border-accent/30">
                    <Check size={12} className="text-accent" />
                  </div>
                  <span className="text-sm font-light text-secondary/90">
                    Custom Branding and Exporters Packaging
                  </span>
                </div>
              </div>
            </div>

            {/* Right Counters Grid */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-8">
              {/* Counter 1 */}
              <div className="p-8 rounded-2xl glass-panel-dark border border-accent/15 flex flex-col gap-3 hover:-translate-y-2 hover:shadow-2xl hover:shadow-accent/5 hover:border-accent/35 transition-all duration-500 group">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center border border-accent/20 mb-2 group-hover:scale-110 group-hover:bg-accent/15 transition-all duration-300">
                  <Factory size={22} className="text-accent" />
                </div>
                <ScrollCounter target="40" duration={1.5} suffix="+" />
                <h4 className="font-serif text-lg text-white font-medium">
                  Years Experience
                </h4>
                <p className="text-xs text-secondary/50 font-light">
                  Continuous manufacturing scaling since 2016.
                </p>
              </div>

              {/* Counter 2 */}
              <div className="p-8 rounded-2xl glass-panel-dark border border-accent/15 flex flex-col gap-3 hover:-translate-y-2 hover:shadow-2xl hover:shadow-accent/5 hover:border-accent/35 transition-all duration-500 group">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center border border-accent/20 mb-2 group-hover:scale-110 group-hover:bg-accent/15 transition-all duration-300">
                  <Layers size={22} className="text-accent" />
                </div>
                <ScrollCounter
                  target="99999"
                  duration={1.5}
                  finalValue="1 lac +"
                />
                <h4 className="font-serif text-lg text-white font-medium">
                  Monthly Blankets
                </h4>
                <p className="text-xs text-secondary/50 font-light">
                  Delivering high-volume orders without scheduling lag.
                </p>
              </div>

              {/* Counter 3 */}
              <div className="p-8 rounded-2xl glass-panel-dark border border-accent/15 flex flex-col gap-3 hover:-translate-y-2 hover:shadow-2xl hover:shadow-accent/5 hover:border-accent/35 transition-all duration-500 group">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center border border-accent/20 mb-2 group-hover:scale-110 group-hover:bg-accent/15 transition-all duration-300">
                  <Users size={22} className="text-accent" />
                </div>
                <ScrollCounter target="500" duration={1.8} suffix="+" />
                <h4 className="font-serif text-lg text-white font-medium">
                  Business Clients
                </h4>
                <p className="text-xs text-secondary/50 font-light">
                  Serving hotels, distributors, exporters, and wholesale houses.
                </p>
              </div>

              {/* Counter 4 */}
              <div className="p-8 rounded-2xl glass-panel-dark border border-accent/15 flex flex-col gap-3 hover:-translate-y-2 hover:shadow-2xl hover:shadow-accent/5 hover:border-accent/35 transition-all duration-500 group">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center border border-accent/20 mb-2 group-hover:scale-110 group-hover:bg-accent/15 transition-all duration-300">
                  <Award size={22} className="text-accent" />
                </div>
                <ScrollCounter target="100" duration={1.5} suffix="%" />
                <h4 className="font-serif text-lg text-white font-medium">
                  Finishing Quality
                </h4>
                <p className="text-xs text-secondary/50 font-light">
                  Strict thread checks, clean packaging boxes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. PRODUCT EXPERIENCE (GSAP HORIZONTAL SCROLL) */}
      {featuredProducts.length > 0 && (
        <div ref={horizontalTriggerRef} className="bg-secondary relative">
        <div className="max-w-7xl mx-auto px-6 md:px-12 pt-24 pb-8">
          <span className="text-xs uppercase tracking-widest text-accent font-semibold block mb-2">
            Bespoke Comfort
          </span>
          <BlurText
            text="Featured Creations"
            tag="h2"
            delay={140}
            animateBy="words"
            direction="bottom"
            className="heading-luxury text-4xl md:text-5xl text-primary font-medium"
          />
          <p className="text-neutral-500 text-sm mt-3 max-w-xl">
            Swipe through a closer inspection of our premium items. Look at
            custom fabric weaves, dimensions, and specifications.
          </p>
        </div>

        {/* Scroll Container */}
        <div className="overflow-hidden w-full h-[650px] relative">
          <div
            ref={horizontalSectionRef}
            className="flex h-full pl-6 md:pl-12 w-[400%]"
            style={{ width: `${featuredProducts.length * 100}vw` }}
          >
            {featuredProducts.length > 0 ? (
              featuredProducts.map((product, index) => (
                <div
                  key={product._id}
                  className="horizontal-panel w-screen h-full shrink-0 flex items-center pr-6 md:pr-24"
                >
                  <div className="w-full h-[480px] bg-white rounded-3xl overflow-hidden shadow-xl border border-accent/10 p-6 md:p-12 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                    {/* Left - Image Carousel Hook */}
                    <div className="h-full rounded-2xl overflow-hidden relative group">
                      <img
                        src={
                          product.images?.[0] ||
                          "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=800&q=85"
                        }
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300" />
                    </div>

                    {/* Right - Product Details */}
                    <div className="flex flex-col gap-4 text-left">
                      <span className="text-xs uppercase tracking-wider font-semibold text-accent">
                        {product.category?.name || "Premium beddings"}
                      </span>
                      <h3 className="heading-luxury text-3xl md:text-4xl text-primary font-medium">
                        {product.name}
                      </h3>
                      <p className="text-sm text-neutral-600 leading-relaxed max-w-md">
                        {product.material ||
                          "Crafted using premium high-longevity yarn with special thermal traps for maximum winter isolation and breathability."}
                      </p>

                      {/* Specs badges */}
                      <div className="grid grid-cols-2 gap-3 max-w-md my-2">
                        <div className="p-3 bg-secondary rounded-xl flex flex-col border border-accent/10">
                          <span className="text-[10px] uppercase font-bold text-neutral-500">
                            Weight GSM
                          </span>
                          <span className="text-sm font-semibold text-primary">
                            {product.gsm}
                          </span>
                        </div>
                        <div className="p-3 bg-secondary rounded-xl flex flex-col border border-accent/10">
                          <span className="text-[10px] uppercase font-bold text-neutral-500">
                            Dimensions
                          </span>
                          <span
                            className="text-sm font-semibold text-primary truncate"
                            title={product.dimensions}
                          >
                            {product.dimensions}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 mt-2">
                        <a
                          href="#inquiry"
                          onClick={() => {
                            setInquiryForm((prev) => ({
                              ...prev,
                              requirement: `Inquiry regarding: ${product.name} (${product.gsm}, ${product.dimensions})`,
                            }));
                          }}
                          className="px-6 py-3 rounded-full bg-primary hover:bg-neutral-900 text-white font-medium text-xs uppercase tracking-wider transition-colors shadow-md text-center cursor-pointer"
                        >
                          Request Quotation
                        </a>
                        <Link
                          to={`/products`}
                          className="text-xs uppercase tracking-widest font-semibold text-accent hover:text-accent-dark transition-colors inline-flex items-center gap-1.5"
                        >
                          Full Catalogue <ArrowRight size={14} />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="w-screen flex items-center justify-center text-neutral-500 font-light italic">
                Loading products showcase...
              </div>
            )}
          </div>
        </div>
      </div>
      )}

      {/* 5. FACTORY PROCESS TIMELINE */}
      <section id="process" className="py-24 bg-secondary">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs uppercase tracking-widest text-accent font-semibold mb-3 block">
              Weaving Discipline
            </span>
            <BlurText
              text="From Yarn to Sleeping Style"
              tag="h2"
              delay={110}
              animateBy="words"
              direction="top"
              className="heading-luxury text-4xl md:text-5xl text-primary font-medium justify-center"
            />
            <div className="w-16 h-[1.5px] bg-accent mx-auto my-6" />
            <p className="text-neutral-600 text-sm md:text-base leading-relaxed">
              Every blanket and sheet passes through our controlled factory
              pipeline in Panipat.
            </p>
          </div>

          {/* Timeline Grid */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-[60px] left-[10%] right-[10%] h-[1.5px] bg-accent/20 z-0" />

            {/* Step 1 */}
            <div className="flex flex-col items-center text-center relative z-10 group">
              <div className="w-20 h-20 rounded-full bg-white group-hover:bg-accent group-hover:text-primary transition-all duration-500 flex items-center justify-center shadow-lg border border-accent/20 text-accent mb-6">
                <Cpu size={30} />
              </div>
              <span className="text-xs text-accent font-bold uppercase tracking-widest mb-2">
                01 / Selection
              </span>
              <h3 className="font-serif text-lg font-semibold text-primary mb-2">
                Raw Material
              </h3>
              <p className="text-xs text-neutral-500 px-4 leading-relaxed font-light">
                Procuring fine long-staple cotton yarn and premium polyester
                microfibers.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center relative z-10 group">
              <div className="w-20 h-20 rounded-full bg-white group-hover:bg-accent group-hover:text-primary transition-all duration-500 flex items-center justify-center shadow-lg border border-accent/20 text-accent mb-6">
                <Factory size={30} />
              </div>
              <span className="text-xs text-accent font-bold uppercase tracking-widest mb-2">
                02 / Processing
              </span>
              <h3 className="font-serif text-lg font-semibold text-primary mb-2">
                Precision Weaving
              </h3>
              <p className="text-xs text-neutral-500 px-4 leading-relaxed font-light">
                High-speed double-needle weaving to create uniform density and
                mesh locks.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center relative z-10 group">
              <div className="w-20 h-20 rounded-full bg-white group-hover:bg-accent group-hover:text-primary transition-all duration-500 flex items-center justify-center shadow-lg border border-accent/20 text-accent mb-6">
                <Layers size={30} />
              </div>
              <span className="text-xs text-accent font-bold uppercase tracking-widest mb-2">
                03 / Refinement
              </span>
              <h3 className="font-serif text-lg font-semibold text-primary mb-2">
                Luxurious Finishing
              </h3>
              <p className="text-xs text-neutral-500 px-4 leading-relaxed font-light">
                Special combing, pile raising, and border satin bindings.
              </p>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col items-center text-center relative z-10 group">
              <div className="w-20 h-20 rounded-full bg-white group-hover:bg-accent group-hover:text-primary transition-all duration-500 flex items-center justify-center shadow-lg border border-accent/20 text-accent mb-6">
                <Sparkles size={30} />
              </div>
              <span className="text-xs text-accent font-bold uppercase tracking-widest mb-2">
                04 / Assurance
              </span>
              <h3 className="font-serif text-lg font-semibold text-primary mb-2">
                Quality Check
              </h3>
              <p className="text-xs text-neutral-500 px-4 leading-relaxed font-light">
                Weight verification, stitching alignment audit, and blemish
                examination.
              </p>
            </div>

            {/* Step 5 */}
            <div className="flex flex-col items-center text-center relative z-10 group">
              <div className="w-20 h-20 rounded-full bg-white group-hover:bg-accent group-hover:text-primary transition-all duration-500 flex items-center justify-center shadow-lg border border-accent/20 text-accent mb-6">
                <CheckCircle size={30} />
              </div>
              <span className="text-xs text-accent font-bold uppercase tracking-widest mb-2">
                05 / Dispatch
              </span>
              <h3 className="font-serif text-lg font-semibold text-primary mb-2">
                Smart Packaging
              </h3>
              <p className="text-xs text-neutral-500 px-4 leading-relaxed font-light">
                Compressed folding, moisture-proof vacuum packing, and exporter
                grade boxes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CLIENT TESTIMONIALS */}
      <section
        id="testimonials"
        className="py-24 bg-primary text-white relative overflow-hidden"
      >
        <div className="absolute top-1/2 left-12 w-[350px] h-[350px] rounded-full bg-accent/5 blur-[100px] pointer-events-none" />

        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <span className="text-xs uppercase tracking-widest text-accent font-semibold mb-3 block">
            Endorsements
          </span>

          <div className="relative h-[250px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTestimonial}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.6 }}
                className="flex flex-col items-center justify-center gap-6"
              >
                <p className="font-serif text-xl md:text-3xl italic leading-relaxed text-secondary/90 font-light">
                  "{testimonials[activeTestimonial].quote}"
                </p>
                <div className="flex flex-col items-center">
                  <h4 className="font-serif text-lg font-medium text-accent">
                    {testimonials[activeTestimonial].author}
                  </h4>
                  <span className="text-xs text-secondary/40 uppercase tracking-widest mt-1">
                    {testimonials[activeTestimonial].location}
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Dots Indicator */}
          <div className="flex items-center justify-center gap-3 mt-10">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveTestimonial(idx)}
                className={`w-2.5 h-2.5 rounded-full cursor-pointer transition-all ${
                  idx === activeTestimonial
                    ? "bg-accent scale-125"
                    : "bg-white/20 hover:bg-white/40"
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 7. INQUIRY SECTION (MULTI-STEP FORM) */}
      <section id="inquiry" className="py-24 bg-secondary">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-xs uppercase tracking-widest text-accent font-semibold mb-3 block">
              Business Partnership
            </span>
            <BlurText
              text="Start Wholesale Inquiry"
              tag="h2"
              delay={120}
              animateBy="words"
              direction="bottom"
              className="heading-luxury text-4xl md:text-5xl text-primary font-medium justify-center"
            />
            <div className="w-16 h-[1.5px] bg-accent mx-auto my-6" />
            <p className="text-neutral-600 text-sm max-w-lg mx-auto">
              Ready to stock Florinaa bedding? Fill out our 3-step conversion
              funnel. Our Panipat corporate desk will respond within 24 hours.
            </p>
          </div>

          {/* Form Container */}
          <div className="glass-panel rounded-3xl p-8 md:p-12 shadow-2xl border border-accent/15 backdrop-blur-md">
            {/* Step Indicators */}
            <div className="flex items-center justify-between mb-10 max-w-md mx-auto relative">
              <div className="absolute top-[18px] left-[15%] right-[15%] h-[1.5px] bg-neutral-200 -z-10" />
              <div
                className="absolute top-[18px] left-[15%] h-[1.5px] bg-accent -z-10 transition-all duration-500"
                style={{ width: `${(activeStep - 1) * 35}%` }}
              />

              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 font-semibold text-sm transition-all duration-300 ${
                    activeStep >= 1
                      ? "border-accent bg-accent text-primary"
                      : "border-neutral-200 bg-white text-neutral-400"
                  }`}
                >
                  1
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-500 mt-2">
                  Company
                </span>
              </div>

              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 font-semibold text-sm transition-all duration-300 ${
                    activeStep >= 2
                      ? "border-accent bg-accent text-primary"
                      : "border-neutral-200 bg-white text-neutral-400"
                  }`}
                >
                  2
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-500 mt-2">
                  Details
                </span>
              </div>

              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 font-semibold text-sm transition-all duration-300 ${
                    activeStep >= 3
                      ? "border-accent bg-accent text-primary"
                      : "border-neutral-200 bg-white text-neutral-400"
                  }`}
                >
                  3
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-500 mt-2">
                  Contact
                </span>
              </div>
            </div>

            {/* Error notifications */}
            {inquiryError && (
              <div className="mb-6 p-4 text-xs bg-red-50 text-red-600 border border-red-200 rounded-xl">
                {inquiryError}
              </div>
            )}

            {/* Multi-step Form Content */}
            {!inquirySuccess ? (
              <form onSubmit={handleInquirySubmit} className="space-y-6">
                <AnimatePresence mode="wait">
                  {activeStep === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 15 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-5"
                    >
                      <div className="text-left">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2">
                          Business / Company Name
                        </label>
                        <div className="relative">
                          <Building
                            className="absolute left-4 top-3.5 text-neutral-400"
                            size={18}
                          />
                          <input
                            type="text"
                            required
                            placeholder="e.g. Radisson Sourcing Hub"
                            value={inquiryForm.companyName}
                            onChange={(e) =>
                              setInquiryForm({
                                ...inquiryForm,
                                companyName: e.target.value,
                              })
                            }
                            className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-neutral-300 focus:border-accent bg-white text-sm focus:outline-none transition-colors"
                          />
                        </div>
                      </div>

                      <div className="text-left">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2">
                          Contact Person Name
                        </label>
                        <div className="relative">
                          <User
                            className="absolute left-4 top-3.5 text-neutral-400"
                            size={18}
                          />
                          <input
                            type="text"
                            required
                            placeholder="e.g. John Doe"
                            value={inquiryForm.contactName}
                            onChange={(e) =>
                              setInquiryForm({
                                ...inquiryForm,
                                contactName: e.target.value,
                              })
                            }
                            className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-neutral-300 focus:border-accent bg-white text-sm focus:outline-none transition-colors"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeStep === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 15 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-5"
                    >
                      <div className="text-left">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2">
                          Product Category Interest
                        </label>
                        <select
                          value={inquiryForm.category}
                          onChange={(e) =>
                            setInquiryForm({
                              ...inquiryForm,
                              category: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3.5 rounded-xl border border-neutral-300 focus:border-accent bg-white text-sm focus:outline-none transition-colors"
                        >
                          <option value="blankets">
                            Luxury Flannel Blankets
                          </option>
                          <option value="dohar">Cotton Dohar & Quilts</option>
                          <option value="fitted-sheets">
                            Fitted Bed Sheets
                          </option>
                          <option value="flano-carpets">
                            Soft-floor Carpets & Rugs
                          </option>
                        </select>
                      </div>

                      <div className="text-left">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2">
                          Procurement Requirements
                        </label>
                        <textarea
                          required
                          rows={4}
                          placeholder="Please specify weights (GSM), dimensions, quantity, or packaging customization guidelines..."
                          value={inquiryForm.requirement}
                          onChange={(e) =>
                            setInquiryForm({
                              ...inquiryForm,
                              requirement: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3.5 rounded-xl border border-neutral-300 focus:border-accent bg-white text-sm focus:outline-none transition-colors resize-none"
                        />
                      </div>
                    </motion.div>
                  )}

                  {activeStep === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 15 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-5"
                    >
                      <div className="text-left">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2">
                          Email Address
                        </label>
                        <div className="relative">
                          <Mail
                            className="absolute left-4 top-3.5 text-neutral-400"
                            size={18}
                          />
                          <input
                            type="email"
                            required
                            placeholder="partner@company.com"
                            value={inquiryForm.email}
                            onChange={(e) =>
                              setInquiryForm({
                                ...inquiryForm,
                                email: e.target.value,
                              })
                            }
                            className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-neutral-300 focus:border-accent bg-white text-sm focus:outline-none transition-colors"
                          />
                        </div>
                      </div>

                      <div className="text-left">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2">
                          Mobile / Phone Number
                        </label>
                        <div className="relative">
                          <Phone
                            className="absolute left-4 top-3.5 text-neutral-400"
                            size={18}
                          />
                          <input
                            type="tel"
                            required
                            placeholder="+91 98765 43210"
                            value={inquiryForm.phone}
                            onChange={(e) =>
                              setInquiryForm({
                                ...inquiryForm,
                                phone: e.target.value,
                              })
                            }
                            className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-neutral-300 focus:border-accent bg-white text-sm focus:outline-none transition-colors"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Form Nav Buttons */}
                <div className="flex items-center gap-4 pt-4">
                  {activeStep > 1 && (
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      className="px-6 py-3.5 rounded-xl border border-neutral-300 text-neutral-700 font-medium text-xs uppercase tracking-wider hover:bg-neutral-50 transition-colors cursor-pointer"
                    >
                      Back
                    </button>
                  )}

                  {activeStep < 3 ? (
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="flex-grow flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary hover:bg-neutral-900 text-white font-medium text-xs uppercase tracking-wider transition-colors shadow-md cursor-pointer"
                    >
                      Next Step
                      <ArrowRight size={14} />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={inquiryMutation.isPending}
                      className="flex-grow flex items-center justify-center gap-2 py-3.5 rounded-xl bg-accent hover:bg-accent-dark text-primary font-semibold text-xs uppercase tracking-wider transition-colors shadow-lg disabled:bg-neutral-300 cursor-pointer"
                    >
                      {inquiryMutation.isPending
                        ? "Submitting..."
                        : "Submit Inquiry"}
                    </button>
                  )}
                </div>
              </form>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-200">
                  <CheckCircle className="text-emerald-600" size={32} />
                </div>
                <h3 className="font-serif text-2xl text-primary font-medium">
                  Inquiry Submitted Successfully
                </h3>
                <p className="text-sm text-neutral-600 max-w-sm mx-auto mt-2 leading-relaxed">
                  Thank you for contacting Florinaa. Our corporate office in
                  Panipat has received your details and will follow up shortly.
                </p>
                <div className="mt-8 text-xs text-neutral-400 animate-pulse">
                  Resetting form...
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
