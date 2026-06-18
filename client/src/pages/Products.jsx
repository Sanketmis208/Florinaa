import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Filter, 
  Search, 
  ArrowUpDown, 
  X, 
  Info, 
  Check, 
  MessageSquare,
  Sparkles,
  ArrowRight,
  Download,
  AlertCircle,
  FileText
} from "lucide-react";
import { productsAPI, categoriesAPI, leadsAPI } from "../services/api";

const Products = () => {
  const location = useLocation();
  
  // Search & Filters State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("default");
  
  // Detail Modal State
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  // Quote Form State
  const [quoteForm, setQuoteForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [quoteSuccess, setQuoteSuccess] = useState(false);
  const [quoteError, setQuoteError] = useState("");

  // Parse category from URL query parameters (e.g. ?category=blankets)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cat = params.get("category");
    if (cat) {
      setSelectedCategory(cat);
    }
  }, [location.search]);

  // Fetch products and categories
  const { data: products, isLoading: productsLoading, error: productsError } = useQuery({
    queryKey: ["products"],
    queryFn: productsAPI.getAll,
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: categoriesAPI.getAll,
  });

  // Submit quote request mutation
  const quoteMutation = useMutation({
    mutationFn: (data) => leadsAPI.submit(data),
    onSuccess: () => {
      setQuoteSuccess(true);
      setQuoteError("");
      setQuoteForm({ name: "", email: "", phone: "", message: "" });
      setTimeout(() => {
        setQuoteSuccess(false);
      }, 5000);
    },
    onError: (err) => {
      setQuoteError(err.response?.data?.error || "Failed to submit request.");
    },
  });

  // Filter and Sort logic
  const filteredProducts = products
    ? products.filter((product) => {
        const matchesVisibility = product.visible !== false;
        const matchesCategory = selectedCategory === "all" || product.category?.slug === selectedCategory;
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.gsm.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (product.material && product.material.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesVisibility && matchesCategory && matchesSearch;
      })
    : [];

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "name-asc") {
      return a.name.localeCompare(b.name);
    }
    if (sortBy === "name-desc") {
      return b.name.localeCompare(a.name);
    }
    if (sortBy === "gsm-desc") {
      // Extract numeric value from GSM string, e.g. "420 GSM" -> 420
      const aGsm = parseInt(a.gsm) || 0;
      const bGsm = parseInt(b.gsm) || 0;
      return bGsm - aGsm;
    }
    if (sortBy === "gsm-asc") {
      const aGsm = parseInt(a.gsm) || 0;
      const bGsm = parseInt(b.gsm) || 0;
      return aGsm - bGsm;
    }
    return 0; // Default
  });

  const handleOpenModal = (product) => {
    setSelectedProduct(product);
    setActiveImageIdx(0);
    setIsModalOpen(true);
    setQuoteSuccess(false);
    setQuoteError("");
  };

  const handleQuoteSubmit = (e) => {
    e.preventDefault();
    if (!quoteForm.name || !quoteForm.email || !quoteForm.phone) {
      setQuoteError("Please fill out your contact details.");
      return;
    }
    quoteMutation.mutate({
      name: quoteForm.name,
      email: quoteForm.email,
      phone: quoteForm.phone,
      requirement: `Quotation requested for: ${selectedProduct.name}. Message: ${quoteForm.message || "No specific comments"}`,
      type: "inquiry",
    });
  };

  return (
    <div className="pt-24 pb-20 min-h-screen bg-secondary">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Banner Section */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs uppercase tracking-widest text-accent font-semibold mb-2 block">
            Exporters Collection
          </span>
          <h1 className="heading-luxury text-4xl md:text-5xl text-primary font-medium">
            The Weaving Catalogue
          </h1>
          <div className="w-16 h-[1.5px] bg-accent mx-auto my-5" />
          <p className="text-neutral-600 text-sm leading-relaxed">
            Browse our catalog of blankets, sheets, quilts, and soft floor textiles. Click any product to view its technical specifications and request wholesale pricing.
          </p>
        </div>

        {/* Filter Controls Row */}
        <div className="bg-white rounded-2xl p-6 shadow-md border border-accent/10 mb-8 flex flex-col gap-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Search Box */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-3 text-neutral-400" size={18} />
              <input
                type="text"
                placeholder="Search blankets, materials..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-300 focus:border-accent bg-secondary/30 text-sm focus:outline-none transition-colors"
              />
            </div>
            
            {/* Sorter */}
            <div className="relative w-full md:w-48 flex items-center gap-2">
              <ArrowUpDown size={16} className="text-neutral-400 shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-neutral-300 focus:border-accent bg-secondary/30 text-xs uppercase tracking-wider font-semibold focus:outline-none transition-colors cursor-pointer"
              >
                <option value="default">Default Sort</option>
                <option value="name-asc">A - Z Name</option>
                <option value="name-desc">Z - A Name</option>
                <option value="gsm-desc">Highest GSM First</option>
                <option value="gsm-asc">Lowest GSM First</option>
              </select>
            </div>
          </div>

          <div className="w-full border-t border-neutral-100" />

          {/* Category Quick Filter */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 w-full py-1">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2 rounded-full text-xs font-medium tracking-wide uppercase transition-colors shrink-0 cursor-pointer ${
                selectedCategory === "all"
                  ? "bg-primary text-white"
                  : "bg-secondary text-neutral-600 hover:bg-neutral-200"
              }`}
            >
              All Items
            </button>
            {categories?.map((cat) => (
              <button
                key={cat._id}
                onClick={() => setSelectedCategory(cat.slug)}
                className={`px-4 py-2 rounded-full text-xs font-medium tracking-wide uppercase transition-colors shrink-0 cursor-pointer ${
                  selectedCategory === cat.slug
                    ? "bg-primary text-white"
                    : "bg-secondary text-neutral-600 hover:bg-neutral-200"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Loading / Error / Grid States */}
        {productsLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
            <span className="text-neutral-500 font-light italic">Loading Florinaa collection...</span>
          </div>
        ) : productsError ? (
          <div className="flex items-center gap-3 justify-center py-20 text-red-500">
            <AlertCircle size={24} />
            <span>Failed to load product catalog. Please try again.</span>
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-neutral-300">
            <Info className="mx-auto text-neutral-400 mb-3" size={32} />
            <h3 className="font-serif text-xl font-medium text-neutral-600">No Products Found</h3>
            <p className="text-neutral-400 text-sm mt-1">Try resetting your search query or category filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {sortedProducts.map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-2xl overflow-hidden shadow-md border border-accent/10 flex flex-col h-full group hover:shadow-xl transition-all duration-300"
              >
                {/* Product Image */}
                <div className="h-64 overflow-hidden relative bg-neutral-100 cursor-pointer" onClick={() => handleOpenModal(product)}>
                  <img
                    src={product.images?.[0] || "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=600&q=85"}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {product.featured && (
                    <span className="absolute top-3 right-3 bg-accent/90 backdrop-blur-sm text-primary font-bold text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-full shadow">
                      Featured
                    </span>
                  )}
                </div>

                {/* Card Details */}
                <div className="p-5 flex flex-col justify-between flex-grow text-left">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-accent tracking-wider block mb-1">
                      {product.category?.name || "Blankets"}
                    </span>
                    <h3
                      onClick={() => handleOpenModal(product)}
                      className="font-serif text-lg font-medium text-primary hover:text-accent cursor-pointer transition-colors line-clamp-1"
                    >
                      {product.name}
                    </h3>
                    
                    {/* Key Specs */}
                    <div className="flex items-center gap-4 mt-3 text-xs text-neutral-500">
                      <div>
                        <span className="block text-[9px] font-bold text-neutral-400 uppercase tracking-wide">Weight</span>
                        <span className="font-semibold text-neutral-700">{product.gsm}</span>
                      </div>
                      <div className="border-l border-neutral-200 h-6" />
                      <div className="max-w-[120px] truncate">
                        <span className="block text-[9px] font-bold text-neutral-400 uppercase tracking-wide">Size</span>
                        <span className="font-semibold text-neutral-700 truncate block" title={product.dimensions}>{product.dimensions}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-neutral-100 flex items-center justify-between">
                    <button
                      onClick={() => handleOpenModal(product)}
                      className="text-xs uppercase tracking-widest font-semibold text-primary hover:text-accent transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      Specifications <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. PRODUCT SPECIFICATIONS DETAIL MODAL */}
      {isModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm transition-opacity duration-300">
          <div
            className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl p-6 md:p-10 border border-accent/20 flex flex-col animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 p-2 text-primary/60 hover:text-accent rounded-full transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>

            {/* Modal Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10">
              {/* Left Column - Gallery */}
              <div className="lg:col-span-6 flex flex-col gap-4">
                <div className="h-[300px] md:h-[380px] rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-200">
                  <img
                    src={selectedProduct.images?.[activeImageIdx] || "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=800&q=85"}
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Thumbnails */}
                {selectedProduct.images && selectedProduct.images.length > 1 && (
                  <div className="flex items-center gap-2 overflow-x-auto py-1">
                    {selectedProduct.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImageIdx(idx)}
                        className={`w-16 h-16 rounded-lg overflow-hidden border-2 shrink-0 cursor-pointer ${
                          idx === activeImageIdx ? "border-accent" : "border-neutral-200 hover:border-accent/40"
                        }`}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column - Product Specs & Inquiry Form */}
              <div className="lg:col-span-6 flex flex-col gap-6 text-left">
                <div>
                  <span className="text-xs uppercase font-bold text-accent tracking-wider">
                    {selectedProduct.category?.name || "Blankets Collection"}
                  </span>
                  <h2 className="heading-luxury text-3xl text-primary font-medium mt-1">
                    {selectedProduct.name}
                  </h2>
                  <div className="w-12 h-[1px] bg-accent my-3" />
                </div>

                {/* Specs list */}
                <div className="space-y-3 bg-secondary/50 p-4 rounded-xl border border-accent/10 text-sm text-neutral-700">
                  <div className="flex justify-between border-b border-neutral-200/50 pb-2">
                    <span className="font-semibold text-neutral-500 uppercase text-[10px] tracking-wider">Weight (GSM)</span>
                    <span className="font-medium text-primary">{selectedProduct.gsm}</span>
                  </div>
                  <div className="flex justify-between border-b border-neutral-200/50 pb-2">
                    <span className="font-semibold text-neutral-500 uppercase text-[10px] tracking-wider">Dimensions</span>
                    <span className="font-medium text-primary">{selectedProduct.dimensions}</span>
                  </div>
                  <div className="flex justify-between border-b border-neutral-200/50 pb-2">
                    <span className="font-semibold text-neutral-500 uppercase text-[10px] tracking-wider">Material</span>
                    <span className="font-medium text-primary">{selectedProduct.material || "Microfiber Soft Blend"}</span>
                  </div>
                  {selectedProduct.washCare && selectedProduct.washCare.length > 0 && (
                    <div className="flex flex-col gap-1.5 pt-1">
                      <span className="font-semibold text-neutral-500 uppercase text-[10px] tracking-wider">Wash & Care</span>
                      <ul className="grid grid-cols-2 gap-1 text-[11px] text-neutral-600 pl-1">
                        {selectedProduct.washCare.map((item, idx) => (
                          <li key={idx} className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                            <span className="truncate">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Instant Quote Box */}
                <div className="border border-neutral-200 p-5 rounded-2xl bg-white shadow-inner flex flex-col gap-3">
                  <h4 className="font-serif text-sm font-semibold text-primary uppercase tracking-wider flex items-center gap-1.5">
                    <MessageSquare size={16} className="text-accent" />
                    Request Quote for this Item
                  </h4>

                  {quoteSuccess ? (
                    <div className="py-4 text-center">
                      <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Check className="text-emerald-600" size={20} />
                      </div>
                      <span className="text-xs font-semibold text-emerald-700 block">Pricing request sent successfully!</span>
                      <span className="text-[10px] text-neutral-400 mt-1 block">Panipat desk will contact you.</span>
                    </div>
                  ) : (
                    <form onSubmit={handleQuoteSubmit} className="space-y-3">
                      {quoteError && (
                        <div className="p-2 text-[11px] bg-red-50 text-red-600 border border-red-200 rounded-lg">
                          {quoteError}
                        </div>
                      )}
                      
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          required
                          placeholder="Your Name"
                          value={quoteForm.name}
                          onChange={(e) => setQuoteForm({ ...quoteForm, name: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-neutral-300 bg-white text-xs focus:border-accent focus:outline-none transition-colors"
                        />
                        <input
                          type="tel"
                          required
                          placeholder="Phone Number"
                          value={quoteForm.phone}
                          onChange={(e) => setQuoteForm({ ...quoteForm, phone: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-neutral-300 bg-white text-xs focus:border-accent focus:outline-none transition-colors"
                        />
                      </div>
                      
                      <input
                        type="email"
                        required
                        placeholder="Email Address"
                        value={quoteForm.email}
                        onChange={(e) => setQuoteForm({ ...quoteForm, email: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-neutral-300 bg-white text-xs focus:border-accent focus:outline-none transition-colors"
                      />

                      <input
                        type="text"
                        placeholder="Notes (quantity, destination port, customization)"
                        value={quoteForm.message}
                        onChange={(e) => setQuoteForm({ ...quoteForm, message: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-neutral-300 bg-white text-xs focus:border-accent focus:outline-none transition-colors"
                      />

                      <button
                        type="submit"
                        disabled={quoteMutation.isPending}
                        className="w-full py-2.5 rounded-lg bg-primary hover:bg-neutral-900 text-white font-medium text-xs uppercase tracking-wider transition-colors shadow disabled:bg-neutral-400 cursor-pointer"
                      >
                        {quoteMutation.isPending ? "Submitting Inquiry..." : "Send Price Inquiry"}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
