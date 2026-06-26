import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Award,
  Globe,
  Heart,
  Factory,
  Calendar,
} from "lucide-react";
import BlurText from "../components/BlurText";

const About = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const milestones = [
    { year: "Elegant", label: "DESIGN & COMFORT", icon: Calendar },
    { year: "46+", label: "Years of Textile Mastery", icon: Award },
    { year: "Luxury", label: "Designed for Modern Homes", icon: Heart },
    { year: "Global", label: "Worldwide Distribution", icon: Globe },
  ];

  return (
    <div className="min-h-screen bg-secondary">
      {/* ─── Hero Banner ─── */}
      <section className="relative h-[60vh] min-h-[420px] flex items-center justify-center bg-primary overflow-hidden">
        {/* Background */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{
            backgroundImage:
              'url("https://images.unsplash.com/photo-1558618666-fcd25c85f82e?auto=format&fit=crop&w=1800&q=80")',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/50 to-black/30" />

        {/* Content */}
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <motion.span
            className="text-[10px] md:text-xs uppercase tracking-[0.3em] text-accent font-semibold mb-4 block"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            Our Story
          </motion.span>
          <BlurText
            text="About Florinaa"
            tag="h1"
            delay={150}
            animateBy="words"
            direction="top"
            className="heading-luxury text-5xl md:text-7xl tracking-tight leading-tight text-white justify-center"
          />
          <motion.div
            className="w-16 h-[1.5px] bg-accent mx-auto mt-6"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          />
        </div>
      </section>

      {/* ─── Main Content ─── */}
      <section className="py-20 md:py-28">
        <div className="max-w-5xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            {/* Left — Text Content */}
            <div className="lg:col-span-7 space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.7 }}
              >
                <p className="text-lg md:text-xl text-primary/90 leading-relaxed font-light">
                  At Florinaa, we specialize in creating premium flannel
                  products—bedsheets, blankets, duvet covers, and more—that
                  bring warmth, softness, and timeless style into homes
                  worldwide.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.7, delay: 0.15 }}
              >
                <p className="text-base text-neutral-600 leading-relaxed">
                  Florinaa is the proud extension of{" "}
                  <span className="font-semibold text-primary">
                    Ess Pee Exports
                  </span>
                  , a Panipat-based textile company with over{" "}
                  <span className="font-semibold text-accent">
                    46 years of expertise
                  </span>{" "}
                  in global trade and manufacturing. This rich heritage is the
                  foundation of Florinaa, ensuring that every product reflects
                  decades of craftsmanship, reliability, and innovation.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.7, delay: 0.3 }}
              >
                <p className="text-base text-neutral-600 leading-relaxed">
                  Our vision is to make flannel more than just fabric—it's a
                  lifestyle of comfort and trust. Each piece is thoughtfully
                  designed, blending traditional textile artistry with modern
                  design sensibilities, so your home feels both stylish and
                  inviting.
                </p>
              </motion.div>

              <motion.div
                className="bg-primary/[0.03] border-l-2 border-accent rounded-r-xl p-6 md:p-8"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.7, delay: 0.4 }}
              >
                <p className="text-base text-primary/80 leading-relaxed italic font-light">
                  "With Florinaa, you don't just choose flannel—you embrace a
                  brand shaped by heritage, driven by innovation, and perfected
                  through nearly half a century of textile mastery."
                </p>
              </motion.div>

              {/* CTA */}
              <motion.div
                className="flex flex-col sm:flex-row gap-4 pt-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <Link
                  to="/products"
                  className="inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full bg-primary hover:bg-primary/90 text-white text-[11px] font-bold tracking-[0.15em] uppercase shadow-lg transition-all duration-300"
                >
                  Explore Collection
                  <ArrowRight size={14} />
                </Link>
              </motion.div>
            </div>

            {/* Right — Milestones */}
            <div className="lg:col-span-5">
              <div className="grid grid-cols-2 gap-4">
                {milestones.map((item, idx) => (
                  <motion.div
                    key={idx}
                    className="bg-white rounded-2xl p-6 shadow-sm border border-primary/5 hover:shadow-md hover:border-accent/20 transition-all duration-300 group text-center"
                    initial={{ opacity: 0, y: 25 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                  >
                    <div className="w-11 h-11 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-accent/20 transition-colors">
                      <item.icon size={18} className="text-accent" />
                    </div>
                    <span className="block text-2xl md:text-3xl font-bold text-primary tracking-tight">
                      {item.year}
                    </span>
                    <span className="text-[11px] uppercase tracking-widest text-neutral-500 font-medium mt-1 block">
                      {item.label}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
