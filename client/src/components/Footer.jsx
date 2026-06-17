import React from "react";
import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Send, MessageCircle } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const handleWhatsApp = () => {
    // Panipat Office/Maulifab contact details
    window.open("https://wa.me/919879619815?text=Hello%20Florinaa%20team,%20I'm%20interested%20in%20your%20premium%20blankets%20and%20bedding%20collection.", "_blank");
  };

  return (
    <footer className="bg-primary text-secondary/90 border-t border-[rgba(200,169,126,0.1)] pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
        {/* Brand Column */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center">
            <img
              src="/FLORINAA_Logo_Transparent.png"
              alt="Florinaa Logo"
              className="h-10 w-auto object-contain brightness-0 invert"
            />
          </div>
          <p className="text-secondary/70 text-sm leading-relaxed mt-2">
            Sleep in Style. A lifestyle home brand backed by Maulifab's state-of-the-art manufacturing discipline. Delivering quiet luxury to premium homes worldwide.
          </p>
          <button
            onClick={handleWhatsApp}
            className="flex items-center justify-center gap-2 mt-4 px-6 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs uppercase transition-colors shadow-lg shadow-emerald-950/20 cursor-pointer w-fit"
          >
            <MessageCircle size={16} />
            Chat on WhatsApp
          </button>
        </div>

        {/* Quick Navigation */}
        <div className="flex flex-col gap-4">
          <h3 className="font-serif text-white text-base tracking-wider uppercase font-medium border-b border-accent/20 pb-2">
            Quick Links
          </h3>
          <ul className="flex flex-col gap-2.5 text-sm text-secondary/70">
            <li>
              <a href="#collection" className="hover:text-accent transition-colors">
                Luxury Collection
              </a>
            </li>
            <li>
              <a href="#excellence" className="hover:text-accent transition-colors">
                Manufacturing Excellence
              </a>
            </li>
            <li>
              <a href="#process" className="hover:text-accent transition-colors">
                Our Weaving Process
              </a>
            </li>
            <li>
              <a href="#testimonials" className="hover:text-accent transition-colors">
                Client Testimonials
              </a>
            </li>
            <li>
              <Link to="/products" className="hover:text-accent transition-colors">
                Products Catalogue
              </Link>
            </li>
          </ul>
        </div>

        {/* Corporate Address */}
        <div className="flex flex-col gap-4">
          <h3 className="font-serif text-white text-base tracking-wider uppercase font-medium border-b border-accent/20 pb-2">
            Panipat Head Office
          </h3>
          <ul className="flex flex-col gap-3.5 text-sm text-secondary/70">
            <li className="flex items-start gap-3">
              <MapPin size={18} className="text-accent shrink-0 mt-0.5" />
              <span>Maulifab Pvt. Limited Plant, Panipat Industrial Area, Haryana, India</span>
            </li>
            <li className="flex items-center gap-3">
              <Phone size={16} className="text-accent shrink-0" />
              <span>+91 9879619815</span>
            </li>
            <li className="flex items-center gap-3">
              <Mail size={16} className="text-accent shrink-0" />
              <span>info@maulifab.com</span>
            </li>
          </ul>
        </div>

        {/* Admin and Newsletter */}
        <div className="flex flex-col gap-4">
          <h3 className="font-serif text-white text-base tracking-wider uppercase font-medium border-b border-accent/20 pb-2">
            Administration
          </h3>
          <p className="text-secondary/70 text-sm leading-relaxed">
            Authorized administrators can access database settings and lead management panels below.
          </p>
          <Link
            to="/admin"
            className="flex items-center gap-2 mt-2 px-5 py-2 rounded border border-secondary/20 hover:border-accent hover:text-accent text-xs uppercase font-medium transition-colors w-fit"
          >
            Admin Dashboard
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 border-t border-[rgba(200,169,126,0.08)] pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-secondary/50">
        <p>© {currentYear} Florinaa. All rights reserved.</p>
        <p className="mt-2 sm:mt-0">
          Crafted by <span className="text-accent">Maulifab Pvt. Limited</span>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
