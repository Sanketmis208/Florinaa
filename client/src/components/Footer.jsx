import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Phone, Mail, MapPin, Send, MessageCircle } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const location = useLocation();
  const navigate = useNavigate();

  const handleWhatsApp = () => {
    // Contact details for WhatsApp chat
    window.open(
      "https://wa.me/919896915012?text=Hello%20Florinaa%20team,%20I'm%20interested%20in%20your%20premium%20blankets%20and%20bedding%20collection.",
      "_blank",
    );
  };

  // Handle quick link clicks – smooth scroll if on homepage, navigate first if on another page
  const handleQuickLink = (e, sectionId) => {
    e.preventDefault();
    if (location.pathname === "/") {
      // Already on homepage – just smooth scroll to the section
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      // Navigate to homepage with hash – the homepage will scroll to the section
      navigate("/#" + sectionId);
    }
  };

  return (
    <footer className="bg-primary text-secondary/90 border-t border-[rgba(200,169,126,0.1)] pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
        {/* Brand Column */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center">
            <img
              src="/FLORINAA_Logo_Transparent.png"
              alt="Florinaa Logo"
              className="h-10 w-auto object-contain"
            />
          </div>
          <p className="text-secondary/70 text-sm leading-relaxed mt-2 font-light">
            Sleep in Style. Florinaa brings together timeless design, premium
            comfort, and everyday luxury for modern homes.
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
              <a
                href="/#collection"
                onClick={(e) => handleQuickLink(e, "collection")}
                className="hover:text-accent hover:translate-x-1.5 transition-all duration-300 block w-fit"
              >
                Luxury Collection
              </a>
            </li>
            <li>
              <a
                href="/#excellence"
                onClick={(e) => handleQuickLink(e, "excellence")}
                className="hover:text-accent hover:translate-x-1.5 transition-all duration-300 block w-fit"
              >
                Manufacturing Excellence
              </a>
            </li>
            <li>
              <a
                href="/#process"
                onClick={(e) => handleQuickLink(e, "process")}
                className="hover:text-accent hover:translate-x-1.5 transition-all duration-300 block w-fit"
              >
                Our Weaving Process
              </a>
            </li>
            <li>
              <a
                href="/#testimonials"
                onClick={(e) => handleQuickLink(e, "testimonials")}
                className="hover:text-accent hover:translate-x-1.5 transition-all duration-300 block w-fit"
              >
                Client Testimonials
              </a>
            </li>
            <li>
              <Link
                to="/products"
                className="hover:text-accent hover:translate-x-1.5 transition-all duration-300 block w-fit"
              >
                Products Catalogue
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 3: Plant Address */}
        <div className="flex flex-col gap-4">
          <h3 className="font-serif text-white text-base tracking-wider uppercase font-medium border-b border-accent/20 pb-2">
            Plant / Mill Address
          </h3>
          <ul className="flex flex-col gap-3.5 text-sm text-secondary/70">
            <li className="flex items-start gap-2.5">
              <MapPin size={20} className="text-accent shrink-0 mt-0.5" />
              <div className="flex flex-col text-left">
                <span className="font-light text-xs leading-relaxed">
                  Khasra No.-61//11/1/1, Barsat Road, Faridpur Road, Village
                  Pundri, Gharunda, Haryana-132114
                </span>
                <span className="text-[10px] text-accent/80 mt-1.5 font-semibold">
                  GST: 06AAOCM1201A1Z7
                </span>
              </div>
            </li>

            {/* Embedded Google Map */}
            <li className="w-full h-32 rounded-xl overflow-hidden border border-accent/25 shadow-inner mt-1">
              <iframe
                title="Maulifab Plant Location Map"
                src="https://maps.google.com/maps?q=Khasra+No.61,+Maulifab+Private+Limited,+11,+Faridpur+Rd,+Pundri,+Gharaunda,+Haryana+132114&t=&z=14&ie=UTF8&iwloc=&output=embed"
                className="w-full h-full border-0"
                allowFullScreen=""
                loading="lazy"
              />
            </li>

            <li className="border-t border-accent/10 my-1" />
            <li className="flex items-center gap-2.5">
              <Mail size={16} className="text-accent shrink-0" />
              <span>sandeep11184@hotmail.com</span>
            </li>
          </ul>
        </div>

        {/* Column 4: City Office Address */}
        <div className="flex flex-col gap-4">
          <h3 className="font-serif text-white text-base tracking-wider uppercase font-medium border-b border-accent/20 pb-2">
            City Office & Sales
          </h3>
          <ul className="flex flex-col gap-3.5 text-sm text-secondary/70">
            <li className="flex items-start gap-2.5">
              <MapPin size={18} className="text-accent shrink-0 mt-0.5" />
              <div className="flex flex-col text-left">
                <span className="font-light text-xs leading-relaxed">
                  193, Sec 29 Part-2, Huda Panipat-132103, Haryana, India
                </span>
              </div>
            </li>

            {/* Embedded Google Map */}
            <li className="w-full h-32 rounded-xl overflow-hidden border border-accent/25 shadow-inner mt-1">
              <iframe
                title="Florinaa City Office Location Map"
                src="https://maps.google.com/maps?q=FLORINAA,+193,+Sector+29+Part+II,+Huda,+Panipat,+Haryana+132108&t=&z=14&ie=UTF8&iwloc=&output=embed"
                className="w-full h-full border-0"
                allowFullScreen=""
                loading="lazy"
              />
            </li>

            <li className="border-t border-accent/10 my-1" />
            <li className="flex items-start gap-2.5">
              <Phone size={16} className="text-accent shrink-0 mt-0.5" />
              <div className="flex flex-col text-left">
                <span className="font-semibold text-white">
                  Mr Sandeep Tayal
                </span>
                <span className="text-xs">+91 9896915012</span>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 border-t border-[rgba(200,169,126,0.08)] pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-secondary/50">
        <p>© {currentYear} Florinaa. All rights reserved.</p>
        <p className="mt-2 sm:mt-0">
          Crafted by <span className="text-accent">Florinaa</span>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
