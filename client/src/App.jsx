import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Products from "./pages/Products";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import About from "./pages/About";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { Download, X, CheckCircle } from "lucide-react";
import { leadsAPI } from "./services/api";
import { useMutation } from "@tanstack/react-query";

const ScrollToTop = () => {
  const { pathname, search } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname, search]);
  return null;
};

const App = () => {
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [downloadForm, setDownloadForm] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [formError, setFormError] = useState("");

  // Mutation to submit catalogue lead
  const leadMutation = useMutation({
    mutationFn: (data) => leadsAPI.submit(data),
    onSuccess: (data) => {
      setDownloadSuccess(true);
      setFormError("");

      // Trigger actual browser download
      // Default fallback path, will be updated to value from settings if fetched
      const link = document.createElement("a");
      link.href = "/Florinaa_catalogue.pdf";
      link.download = "Florinaa_catalogue.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Close modal after delay
      setTimeout(() => {
        setIsDownloadModalOpen(false);
        setDownloadSuccess(false);
        setDownloadForm({ name: "", email: "", phone: "" });
      }, 2500);
    },
    onError: (error) => {
      setFormError(
        error.response?.data?.error ||
          "Failed to submit request. Please try again.",
      );
    },
  });

  const handleDownloadSubmit = (e) => {
    e.preventDefault();
    if (!downloadForm.name || !downloadForm.email || !downloadForm.phone) {
      setFormError("Please fill out all fields.");
      return;
    }
    leadMutation.mutate({
      name: downloadForm.name,
      email: downloadForm.email,
      phone: downloadForm.phone,
      type: "catalogue-download",
      requirement: "Requested exports catalogue download.",
    });
  };

  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <div
      className={`flex flex-col ${isAdminRoute ? "h-screen overflow-hidden" : "min-h-screen"} bg-secondary`}
    >
      <ScrollToTop />
      {/* Header / Navigation */}
      {!isAdminRoute && (
        <Navbar onDownloadCatalog={() => setIsDownloadModalOpen(true)} />
      )}

      {/* Main Routes */}
      <main
        className={`flex-grow ${isAdminRoute ? "h-full overflow-hidden" : ""}`}
      >
        <Routes>
          <Route
            path="/"
            element={
              <Home onDownloadCatalog={() => setIsDownloadModalOpen(true)} />
            }
          />
          <Route path="/products" element={<Products />} />
          <Route path="/about" element={<About />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Footer */}
      {!isAdminRoute && <Footer />}

      {/* Catalogue Download Modal */}
      {isDownloadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300">
          <div
            className="relative w-full max-w-md p-8 rounded-2xl glass-panel shadow-2xl border border-accent/20 animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsDownloadModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-primary/60 hover:text-accent rounded-full transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>

            {!downloadSuccess ? (
              <>
                <div className="text-center mb-6">
                  <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Download className="text-accent" size={24} />
                  </div>
                  <h3 className="font-serif text-2xl text-primary font-medium">
                    Download Catalogue
                  </h3>
                  <p className="text-sm text-neutral-600 mt-2">
                    Please enter your contact details to gain access to our
                    premium collections catalogue.
                  </p>
                </div>

                <form onSubmit={handleDownloadSubmit} className="space-y-4">
                  {formError && (
                    <div className="p-3 text-xs bg-red-50 text-red-600 rounded-lg border border-red-200">
                      {formError}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-1.5">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={downloadForm.name}
                      onChange={(e) =>
                        setDownloadForm({
                          ...downloadForm,
                          name: e.target.value,
                        })
                      }
                      placeholder="John Doe"
                      className="w-full px-4 py-3 rounded-lg border border-neutral-300 bg-white text-primary text-sm focus:border-accent focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={downloadForm.email}
                      onChange={(e) =>
                        setDownloadForm({
                          ...downloadForm,
                          email: e.target.value,
                        })
                      }
                      placeholder="john@example.com"
                      className="w-full px-4 py-3 rounded-lg border border-neutral-300 bg-white text-primary text-sm focus:border-accent focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-1.5">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      required
                      value={downloadForm.phone}
                      onChange={(e) =>
                        setDownloadForm({
                          ...downloadForm,
                          phone: e.target.value,
                        })
                      }
                      placeholder="+91 98765 43210"
                      className="w-full px-4 py-3 rounded-lg border border-neutral-300 bg-white text-primary text-sm focus:border-accent focus:outline-none transition-colors"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={leadMutation.isPending}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-lg bg-primary hover:bg-neutral-900 text-white font-medium text-sm tracking-wide uppercase transition-colors shadow-lg disabled:bg-neutral-400 cursor-pointer"
                  >
                    {leadMutation.isPending
                      ? "Generating Access..."
                      : "Download Now"}
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="text-emerald-600" size={36} />
                </div>
                <h3 className="font-serif text-2xl text-primary font-medium">
                  Thank You!
                </h3>
                <p className="text-sm text-neutral-600 mt-2">
                  Your catalogue download has started.
                </p>
                <p className="text-xs text-neutral-400 mt-6 animate-pulse">
                  Closing window automatically...
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
