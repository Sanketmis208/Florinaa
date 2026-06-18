import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  LayoutDashboard, 
  FolderTree, 
  ShoppingBag, 
  Users, 
  Settings, 
  Upload, 
  LogOut, 
  Plus, 
  Edit, 
  Trash2, 
  Download, 
  ExternalLink,
  CheckCircle,
  FileSpreadsheet,
  Image,
  Eye,
  EyeOff,
  AlertCircle,
  X
} from "lucide-react";
import { 
  authAPI, 
  productsAPI, 
  categoriesAPI, 
  leadsAPI, 
  contentAPI, 
  uploadAPI 
} from "../services/api";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");

  // Edit/Add states
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // null means adding new
  const [productForm, setProductForm] = useState({
    name: "", category: "", gsm: "", dimensions: "", material: "", washCare: "", images: "", featured: false, visible: true
  });

  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({ name: "", order: 1 });

  const [mediaFile, setMediaFile] = useState(null);
  const [uploadedUrl, setUploadedUrl] = useState("");
  const [uploadLoading, setUploadLoading] = useState(false);

  const [formError, setFormError] = useState("");

  // Queries
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["me"],
    queryFn: authAPI.getMe,
    retry: false,
  });

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ["products-admin"],
    queryFn: productsAPI.getAll,
    enabled: !!user,
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories-admin"],
    queryFn: categoriesAPI.getAll,
    enabled: !!user,
  });

  const { data: leads, isLoading: leadsLoading } = useQuery({
    queryKey: ["leads-admin"],
    queryFn: leadsAPI.getAll,
    enabled: !!user,
  });

  const { data: content, isLoading: contentLoading } = useQuery({
    queryKey: ["content-admin"],
    queryFn: contentAPI.get,
    enabled: !!user,
  });

  // Settings State Form
  const [settingsForm, setSettingsForm] = useState({
    heroTitle: "", heroSubtitle: "", heroImage: "", catalogueUrl: "", aboutText: ""
  });

  useEffect(() => {
    if (content) {
      setSettingsForm({
        heroTitle: content.heroTitle || "",
        heroSubtitle: content.heroSubtitle || "",
        heroImage: content.heroImage || "",
        catalogueUrl: content.catalogueUrl || "",
        aboutText: content.aboutText || "",
      });
    }
  }, [content]);

  // Auth Guard
  useEffect(() => {
    if (!userLoading && !user) {
      navigate("/admin");
    }
  }, [user, userLoading, navigate]);

  // Mutations
  const logoutMutation = useMutation({
    mutationFn: authAPI.logout,
    onSuccess: () => {
      queryClient.setQueryData(["me"], null);
      navigate("/admin");
    },
  });

  // Products Mutation
  const productCreateMutation = useMutation({
    mutationFn: productsAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries(["products-admin"]);
      queryClient.invalidateQueries(["products"]);
      setProductModalOpen(false);
    },
    onError: (err) => setFormError(err.response?.data?.error || "Failed to create product"),
  });

  const productUpdateMutation = useMutation({
    mutationFn: ({ id, data }) => productsAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["products-admin"]);
      queryClient.invalidateQueries(["products"]);
      setProductModalOpen(false);
    },
    onError: (err) => setFormError(err.response?.data?.error || "Failed to update product"),
  });

  const productDeleteMutation = useMutation({
    mutationFn: productsAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(["products-admin"]);
      queryClient.invalidateQueries(["products"]);
    },
  });

  // Categories Mutation
  const categoryCreateMutation = useMutation({
    mutationFn: categoriesAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries(["categories-admin"]);
      queryClient.invalidateQueries(["categories"]);
      setCategoryModalOpen(false);
    },
    onError: (err) => setFormError(err.response?.data?.error || "Failed to create category"),
  });

  const categoryUpdateMutation = useMutation({
    mutationFn: ({ id, data }) => categoriesAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["categories-admin"]);
      queryClient.invalidateQueries(["categories"]);
      setCategoryModalOpen(false);
    },
    onError: (err) => setFormError(err.response?.data?.error || "Failed to update category"),
  });

  const categoryDeleteMutation = useMutation({
    mutationFn: categoriesAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(["categories-admin"]);
      queryClient.invalidateQueries(["categories"]);
    },
    onError: (err) => alert(err.response?.data?.error || "Failed to delete category"),
  });

  // Leads Mutation
  const leadStatusMutation = useMutation({
    mutationFn: ({ id, status }) => leadsAPI.updateStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries(["leads-admin"]),
  });

  // Content Settings Mutation
  const settingsMutation = useMutation({
    mutationFn: contentAPI.update,
    onSuccess: () => {
      queryClient.invalidateQueries(["content-admin"]);
      queryClient.invalidateQueries(["content"]);
      alert("Website content updated successfully!");
    },
    onError: (err) => alert(err.response?.data?.error || "Update failed"),
  });

  // Upload handler inside product form
  const handleProductImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadLoading(true);
    try {
      const res = await uploadAPI.uploadFile(file);
      // Append URL
      setProductForm(prev => ({
        ...prev,
        images: prev.images ? `${prev.images}\n${res.url}` : res.url
      }));
    } catch (err) {
      alert("Image upload failed");
    } finally {
      setUploadLoading(false);
    }
  };

  // General Media Library Upload handler
  const handleGeneralUpload = async (e) => {
    e.preventDefault();
    if (!mediaFile) return;
    setUploadLoading(true);
    try {
      const res = await uploadAPI.uploadFile(mediaFile);
      setUploadedUrl(res.url);
      setMediaFile(null);
    } catch (err) {
      alert("Upload failed");
    } finally {
      setUploadLoading(false);
    }
  };

  const handleOpenProductAdd = () => {
    setEditingProduct(null);
    setProductForm({
      name: "",
      category: categories?.[0]?._id || "",
      gsm: "",
      dimensions: "",
      material: "",
      washCare: "Machine wash gentle, Do not bleach, Tumble dry low",
      images: "",
      featured: false,
      visible: true,
    });
    setFormError("");
    setProductModalOpen(true);
  };

  const handleOpenProductEdit = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name || "",
      category: product.category?._id || product.category || "",
      gsm: product.gsm || "",
      dimensions: product.dimensions || "",
      material: product.material || "",
      washCare: Array.isArray(product.washCare) ? product.washCare.join(", ") : product.washCare || "",
      images: Array.isArray(product.images) ? product.images.join("\n") : product.images || "",
      featured: product.featured || false,
      visible: product.visible !== false,
    });
    setFormError("");
    setProductModalOpen(true);
  };

  const handleProductSubmit = (e) => {
    e.preventDefault();
    if (!productForm.name || !productForm.category || !productForm.gsm || !productForm.dimensions) {
      setFormError("Please fill out all required fields.");
      return;
    }

    const payload = {
      ...productForm,
      images: productForm.images.split("\n").map(u => u.trim()).filter(Boolean),
      washCare: productForm.washCare.split(",").map(w => w.trim()).filter(Boolean),
    };

    if (editingProduct) {
      productUpdateMutation.mutate({ id: editingProduct._id, data: payload });
    } else {
      productCreateMutation.mutate(payload);
    }
  };

  const handleOpenCategoryAdd = () => {
    setEditingCategory(null);
    setCategoryForm({ name: "", order: (categories?.length || 0) + 1 });
    setFormError("");
    setCategoryModalOpen(true);
  };

  const handleOpenCategoryEdit = (cat) => {
    setEditingCategory(cat);
    setCategoryForm({ name: cat.name, order: cat.order });
    setFormError("");
    setCategoryModalOpen(true);
  };

  const handleCategorySubmit = (e) => {
    e.preventDefault();
    if (!categoryForm.name) {
      setFormError("Name is required");
      return;
    }
    if (editingCategory) {
      categoryUpdateMutation.mutate({ id: editingCategory._id, data: categoryForm });
    } else {
      categoryCreateMutation.mutate(categoryForm);
    }
  };

  const triggerExportCsv = () => {
    // Navigate direct connection
    window.open("/api/leads/admin/export", "_blank");
  };

  if (userLoading || !user) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const sidebarLinks = [
    { id: "overview", label: "Dashboard", icon: LayoutDashboard },
    { id: "products", label: "Products CRUD", icon: ShoppingBag },
    { id: "categories", label: "Categories", icon: FolderTree },
    { id: "leads", label: "Leads Hub", icon: Users },
    { id: "settings", label: "Settings", icon: Settings },
    { id: "media", label: "Media Uploader", icon: Upload },
  ];

  return (
    <div className="min-h-screen bg-secondary flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-primary text-secondary/70 flex flex-col border-r border-[rgba(200,169,126,0.15)] shrink-0 hidden md:flex">
        <div className="p-6 border-b border-secondary/10 flex flex-col items-center justify-center gap-3.5 text-center">
          <img src="/FLORINAA_Logo_Transparent.png" alt="" className="h-[58px] w-auto brightness-0 invert" />
          <span className="font-serif text-[15px] uppercase tracking-[0.25em] font-bold text-accent mt-1">Admin Panel</span>
        </div>
        <nav className="flex-grow p-4 space-y-1.5">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            const isActive = activeTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => setActiveTab(link.id)}
                className={`w-full flex items-center gap-3.5 px-4.5 py-3.5 rounded-xl text-xs uppercase tracking-widest font-semibold transition-all duration-300 cursor-pointer ${
                  isActive
                    ? "bg-accent text-primary shadow-[0_4px_20px_rgba(200,169,126,0.25)] scale-[1.02]"
                    : "text-secondary/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon size={16} className={isActive ? "text-primary" : "text-accent/60"} />
                {link.label}
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t border-secondary/10">
          <button
            onClick={() => logoutMutation.mutate()}
            className="w-full flex items-center gap-3.5 px-4.5 py-3.5 rounded-xl text-xs uppercase tracking-widest font-semibold text-red-400 hover:bg-red-950/20 hover:text-red-300 transition-all cursor-pointer"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Panel Content */}
      <main className="flex-grow p-6 md:p-10 overflow-y-auto">
        {/* Mobile Navigation Header */}
        <div className="flex md:hidden bg-white p-4.5 rounded-2xl shadow-sm border border-accent/10 mb-6 items-center justify-between">
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value)}
            className="px-3 py-2 rounded-xl border border-neutral-200 font-serif text-sm focus:outline-none bg-secondary/50 cursor-pointer"
          >
            {sidebarLinks.map(l => (
              <option key={l.id} value={l.id}>{l.label}</option>
            ))}
          </select>
          <button
            onClick={() => logoutMutation.mutate()}
            className="text-red-500 hover:text-red-600 font-semibold text-xs tracking-wider uppercase flex items-center gap-1.5"
          >
            <LogOut size={14} /> Logout
          </button>
        </div>

        {/* 1. OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="space-y-8 text-left">
            <div>
              <h2 className="heading-luxury text-3xl font-medium text-primary">Overview Dashboard</h2>
              <p className="text-neutral-400 text-xs mt-1">Real-time statistics and latest wholesale activity.</p>
            </div>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: "Total Products", value: products?.length || 0 },
                { label: "Categories", value: categories?.length || 0 },
                { label: "Inquiry Leads", value: leads?.filter(l => l.type === "inquiry").length || 0 },
                { label: "Catalog Downloads", value: leads?.filter(l => l.type === "catalogue-download").length || 0 },
              ].map((stat, idx) => (
                <div key={idx} className="bg-white p-6 rounded-2xl border border-accent/15 hover:border-accent/30 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_10px_30px_rgba(200,169,126,0.08)] transition-all duration-300 flex flex-col gap-2 group hover:-translate-y-0.5">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest group-hover:text-accent transition-colors">{stat.label}</span>
                  <span className="text-3xl font-serif font-bold text-primary">{stat.value}</span>
                </div>
              ))}
            </div>

            {/* Recent Leads Preview */}
            <div className="bg-white rounded-2xl shadow-sm border border-accent/10 p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-serif text-lg font-medium text-primary">Recent Wholesale Leads</h3>
                  <p className="text-neutral-400 text-xs mt-0.5">The latest inquiries generated from your public website forms.</p>
                </div>
                <button
                  onClick={() => setActiveTab("leads")}
                  className="text-xs text-accent font-semibold hover:text-accent-dark uppercase tracking-widest flex items-center gap-1 cursor-pointer transition-colors"
                >
                  View All Hub →
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-neutral-600 text-left">
                  <thead>
                    <tr className="border-b border-neutral-100 text-[10px] uppercase text-neutral-400 font-bold tracking-wider">
                      <th className="py-4 px-6 bg-neutral-50/50 rounded-l-xl">Contact</th>
                      <th className="py-4 px-6 bg-neutral-50/50">Company</th>
                      <th className="py-4 px-6 bg-neutral-50/50">Lead Type</th>
                      <th className="py-4 px-6 bg-neutral-50/50">Phone / Email</th>
                      <th className="py-4 px-6 bg-neutral-50/50 text-center rounded-r-xl">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads?.slice(0, 5).map((lead) => (
                      <tr key={lead._id} className="border-b border-neutral-50 hover:bg-secondary/10 transition-colors">
                        <td className="py-4 px-6 font-semibold text-primary">{lead.name}</td>
                        <td className="py-4 px-6">{lead.companyName || "Personal"}</td>
                        <td className="py-4 px-6">
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] uppercase font-bold tracking-wider ${
                            lead.type === "catalogue-download" ? "bg-accent/15 text-accent-dark" : "bg-blue-50 text-blue-600"
                          }`}>
                            {lead.type === "catalogue-download" ? "Catalogue" : "Quote Request"}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-xs">
                          <div className="font-medium">{lead.phone}</div>
                          <div className="text-neutral-400 mt-0.5">{lead.email}</div>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] uppercase font-bold tracking-wider ${
                            lead.status === "new" ? "bg-red-50 text-red-600 border border-red-100" :
                            lead.status === "contacted" ? "bg-amber-50 text-amber-600 border border-amber-100" :
                            lead.status === "responded" ? "bg-blue-50 text-blue-600 border border-blue-100" :
                            "bg-emerald-50 text-emerald-600 border border-emerald-100"
                          }`}>
                            {lead.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {(!leads || leads.length === 0) && (
                      <tr>
                        <td colSpan={5} className="text-center py-8 text-neutral-400 italic">No wholesale leads found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 2. PRODUCTS CRUD TAB */}
        {activeTab === "products" && (
          <div className="space-y-6 text-left">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="heading-luxury text-3xl font-medium text-primary">Manage Products</h2>
                <p className="text-neutral-400 text-xs mt-1">Create, update, or temporarily hide wholesale product listings.</p>
              </div>
              <button
                onClick={handleOpenProductAdd}
                className="flex items-center gap-2 px-6 py-3.5 rounded-full bg-primary hover:bg-neutral-900 text-white font-semibold text-xs uppercase tracking-wider shadow-[0_4px_14px_rgba(17,17,17,0.15)] hover:shadow-[0_6px_20px_rgba(17,17,17,0.25)] transition-all cursor-pointer"
              >
                <Plus size={16} /> Add Product
              </button>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-accent/10 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-neutral-600 text-left">
                  <thead className="bg-neutral-50/50">
                    <tr className="border-b border-neutral-100 text-[10px] uppercase text-neutral-400 font-bold tracking-wider">
                      <th className="py-4 px-6">Image</th>
                      <th className="py-4 px-6">Name</th>
                      <th className="py-4 px-6">Category</th>
                      <th className="py-4 px-6">GSM</th>
                      <th className="py-4 px-6">Size</th>
                      <th className="py-4 px-6 text-center">Featured</th>
                      <th className="py-4 px-6 text-center">Visible</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products?.map((product) => (
                      <tr key={product._id} className="border-b border-neutral-50 hover:bg-secondary/10 transition-colors">
                        <td className="py-3 px-6">
                          <img
                            src={product.images?.[0] || "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=100&q=85"}
                            alt=""
                            className="w-12 h-12 rounded-xl object-cover border border-neutral-200 shadow-sm"
                          />
                        </td>
                        <td className="py-3 px-6 font-semibold text-primary">{product.name}</td>
                        <td className="py-3 px-6 text-neutral-500 font-medium">{product.category?.name || "Unassigned"}</td>
                        <td className="py-3 px-6 font-mono text-xs">{product.gsm}</td>
                        <td className="py-3 px-6 max-w-[150px] truncate text-xs" title={product.dimensions}>{product.dimensions}</td>
                        <td className="py-3 px-6 text-center">
                          {product.featured ? (
                            <span className="inline-block px-2.5 py-0.5 rounded-full bg-accent/15 text-accent-dark text-[9px] font-bold uppercase tracking-wider">Yes</span>
                          ) : (
                            <span className="inline-block px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-400 text-[9px] font-bold uppercase tracking-wider">No</span>
                          )}
                        </td>
                        <td className="py-3 px-6 text-center">
                          <button
                            onClick={() => {
                              productUpdateMutation.mutate({
                                id: product._id,
                                data: { visible: !product.visible }
                              });
                            }}
                            className="mx-auto block p-1 rounded-xl hover:bg-neutral-100 transition-all cursor-pointer border border-transparent hover:border-neutral-200"
                            title={product.visible ? "Hide from catalog" : "Show in catalog"}
                            disabled={productUpdateMutation.isPending}
                          >
                            {product.visible ? (
                              <Eye className="text-emerald-600 bg-emerald-50 p-1 rounded-full" size={24} />
                            ) : (
                              <EyeOff className="text-neutral-400 bg-neutral-50 p-1 rounded-full" size={24} />
                            )}
                          </button>
                        </td>
                        <td className="py-3 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenProductEdit(product)}
                              className="p-2 text-primary hover:text-accent bg-secondary hover:bg-primary/5 rounded-xl transition-all duration-200 cursor-pointer border border-primary/5"
                              title="Edit Product"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Are you sure you want to delete ${product.name}?`)) {
                                  productDeleteMutation.mutate(product._id);
                                }
                              }}
                              className="p-2 text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100/60 rounded-xl transition-all duration-200 cursor-pointer border border-red-100"
                              title="Delete Product"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {(!products || products.length === 0) && (
                      <tr>
                        <td colSpan={8} className="text-center py-8 text-neutral-400 italic">No products found. Add your first item.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 3. CATEGORIES TAB */}
        {activeTab === "categories" && (
          <div className="space-y-6 text-left">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="heading-luxury text-3xl font-medium text-primary">Manage Categories</h2>
                <p className="text-neutral-400 text-xs mt-1">Configure layout categories and specify rendering order.</p>
              </div>
              <button
                onClick={handleOpenCategoryAdd}
                className="flex items-center gap-2 px-6 py-3.5 rounded-full bg-primary hover:bg-neutral-900 text-white font-semibold text-xs uppercase tracking-wider shadow-[0_4px_14px_rgba(17,17,17,0.15)] hover:shadow-[0_6px_20px_rgba(17,17,17,0.25)] transition-all cursor-pointer"
              >
                <Plus size={16} /> Add Category
              </button>
            </div>

            {/* Categories list */}
            <div className="max-w-2xl bg-white rounded-2xl shadow-sm border border-accent/10 overflow-hidden">
              <table className="w-full text-sm text-neutral-600 text-left">
                <thead className="bg-neutral-50/50">
                  <tr className="border-b border-neutral-100 text-[10px] uppercase text-neutral-400 font-bold tracking-wider">
                    <th className="py-4 px-6">Sequence Order</th>
                    <th className="py-4 px-6">Name</th>
                    <th className="py-4 px-6">Slug</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories?.map((cat) => (
                    <tr key={cat._id} className="border-b border-neutral-50 hover:bg-secondary/10 transition-colors">
                      <td className="py-3.5 px-6 font-mono font-semibold text-primary">{cat.order}</td>
                      <td className="py-3.5 px-6 font-semibold text-primary">{cat.name}</td>
                      <td className="py-3.5 px-6 text-neutral-400 font-mono text-xs">{cat.slug}</td>
                      <td className="py-3.5 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenCategoryEdit(cat)}
                            className="p-2 text-primary hover:text-accent bg-secondary hover:bg-primary/5 rounded-xl transition-all duration-200 cursor-pointer border border-primary/5"
                            title="Edit Category"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete category ${cat.name}? Products using it must be reassigned first.`)) {
                                categoryDeleteMutation.mutate(cat._id);
                              }
                            }}
                            className="p-2 text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100/60 rounded-xl transition-all duration-200 cursor-pointer border border-red-100"
                            title="Delete Category"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {(!categories || categories.length === 0) && (
                    <tr>
                      <td colSpan={4} className="text-center py-6 text-neutral-400 italic">No categories created yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. LEADS HUB TAB */}
        {activeTab === "leads" && (
          <div className="space-y-6 text-left">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="heading-luxury text-3xl font-medium text-primary">Wholesale Inquiry Hub</h2>
                <p className="text-neutral-400 text-xs mt-1">Track and manage trade leads, catalog requests, and email inquiries.</p>
              </div>
              <button
                onClick={triggerExportCsv}
                className="flex items-center gap-2 px-5 py-3 rounded-full border border-primary hover:bg-neutral-100 text-primary font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                <FileSpreadsheet size={16} /> Export to CSV
              </button>
            </div>

            {/* Leads Log */}
            <div className="bg-white rounded-2xl shadow-sm border border-accent/10 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-neutral-600 text-left">
                  <thead className="bg-neutral-50/50">
                    <tr className="border-b border-neutral-100 text-[10px] uppercase text-neutral-400 font-bold tracking-wider">
                      <th className="py-4 px-6">Date</th>
                      <th className="py-4 px-6">Name / Company</th>
                      <th className="py-4 px-6">Type</th>
                      <th className="py-4 px-6">Contact Info</th>
                      <th className="py-4 px-6">Requirements</th>
                      <th className="py-4 px-6">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads?.map((lead) => (
                      <tr key={lead._id} className="border-b border-neutral-50 hover:bg-secondary/10 transition-colors">
                        <td className="py-3.5 px-6 text-xs text-neutral-400 font-mono">
                          {new Date(lead.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 px-6">
                          <div className="font-semibold text-primary">{lead.name}</div>
                          <div className="text-xs text-neutral-400 mt-0.5">{lead.companyName || "N/A"}</div>
                        </td>
                        <td className="py-3.5 px-6">
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] uppercase font-bold tracking-wider ${
                            lead.type === "catalogue-download" ? "bg-accent/15 text-accent-dark" : "bg-blue-50 text-blue-600"
                          }`}>
                            {lead.type === "catalogue-download" ? "Catalogue" : "Quote Request"}
                          </span>
                        </td>
                        <td className="py-3.5 px-6 text-xs">
                          <div className="font-semibold">{lead.phone}</div>
                          <div className="text-neutral-400 mt-0.5">{lead.email}</div>
                        </td>
                        <td className="py-3.5 px-6 max-w-xs text-xs whitespace-pre-wrap truncate" title={lead.requirement}>
                          {lead.requirement || "No notes provided"}
                        </td>
                        <td className="py-3.5 px-6">
                          <select
                            value={lead.status}
                            onChange={(e) => leadStatusMutation.mutate({ id: lead._id, status: e.target.value })}
                            className={`px-3 py-1.5 rounded-xl border text-[10px] uppercase font-bold tracking-wider tracking-widest focus:outline-none cursor-pointer transition-all ${
                              lead.status === "new" ? "bg-red-50 text-red-600 border-red-200 focus:ring-1 focus:ring-red-400" :
                              lead.status === "contacted" ? "bg-amber-50 text-amber-600 border-amber-200 focus:ring-1 focus:ring-amber-400" :
                              lead.status === "responded" ? "bg-blue-50 text-blue-600 border-blue-200 focus:ring-1 focus:ring-blue-400" :
                              "bg-emerald-50 text-emerald-600 border-emerald-200 focus:ring-1 focus:ring-emerald-400"
                            }`}
                          >
                            <option value="new">New</option>
                            <option value="contacted">Contacted</option>
                            <option value="responded">Responded</option>
                            <option value="closed">Closed</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                    {(!leads || leads.length === 0) && (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-neutral-400 italic">No business inquiries logged yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 5. SETTINGS TAB */}
        {activeTab === "settings" && (
          <div className="space-y-6 text-left max-w-3xl">
            <div>
              <h2 className="heading-luxury text-3xl font-medium text-primary">Website Content Management</h2>
              <p className="text-neutral-400 text-xs mt-1">Instantly edit public website headlines, catalog resources, and copy.</p>
            </div>
            
            <form
              onSubmit={(e) => {
                e.preventDefault();
                settingsMutation.mutate(settingsForm);
              }}
              className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-accent/10 space-y-5"
            >
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">Hero Headline Title</label>
                <input
                  type="text"
                  required
                  value={settingsForm.heroTitle}
                  onChange={(e) => setSettingsForm({ ...settingsForm, heroTitle: e.target.value })}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-xl bg-white text-sm focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none transition-shadow"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">Hero Subtitle</label>
                <textarea
                  required
                  rows={2}
                  value={settingsForm.heroSubtitle}
                  onChange={(e) => setSettingsForm({ ...settingsForm, heroSubtitle: e.target.value })}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-xl bg-white text-sm focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none transition-shadow"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">Hero Background Image URL</label>
                <input
                  type="text"
                  required
                  value={settingsForm.heroImage}
                  onChange={(e) => setSettingsForm({ ...settingsForm, heroImage: e.target.value })}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-xl bg-white text-sm focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none transition-shadow"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">Catalogue PDF URL</label>
                <input
                  type="text"
                  required
                  value={settingsForm.catalogueUrl}
                  onChange={(e) => setSettingsForm({ ...settingsForm, catalogueUrl: e.target.value })}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-xl bg-white text-sm focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none transition-shadow"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">About Us Text</label>
                <textarea
                  required
                  rows={4}
                  value={settingsForm.aboutText}
                  onChange={(e) => setSettingsForm({ ...settingsForm, aboutText: e.target.value })}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-xl bg-white text-sm focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none resize-none transition-shadow"
                />
              </div>

              <button
                type="submit"
                disabled={settingsMutation.isPending}
                className="w-full md:w-auto px-8 py-3.5 rounded-xl bg-primary hover:bg-neutral-900 text-white font-semibold text-xs uppercase tracking-wider transition-all shadow-[0_4px_14px_rgba(17,17,17,0.1)] hover:shadow-[0_6px_20px_rgba(17,17,17,0.2)] cursor-pointer"
              >
                {settingsMutation.isPending ? "Saving changes..." : "Save Website Settings"}
              </button>
            </form>
          </div>
        )}

        {/* 6. MEDIA TAB */}
        {activeTab === "media" && (
          <div className="space-y-6 text-left max-w-2xl">
            <div>
              <h2 className="heading-luxury text-3xl font-medium text-primary">Media Library</h2>
              <p className="text-neutral-400 text-xs mt-1">Upload files and get persistent public links to use in forms.</p>
            </div>
            
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-accent/10 space-y-6">
              <h3 className="font-serif text-lg text-primary font-medium">Upload File Attachment</h3>
              <p className="text-neutral-500 text-xs leading-relaxed">
                Upload image assets (JPG, PNG, WEBP) or catalogue PDFs. Once uploaded, the system will output a public URL you can copy directly into your products or content fields.
              </p>

              <form onSubmit={handleGeneralUpload} className="space-y-4">
                <div className="border border-dashed border-neutral-300 rounded-2xl p-8 flex flex-col items-center justify-center bg-secondary/20 hover:bg-secondary/40 transition-colors">
                  <Image className="text-accent mb-3" size={36} />
                  <input
                    type="file"
                    required
                    onChange={(e) => setMediaFile(e.target.files[0])}
                    className="text-xs text-neutral-600 w-fit cursor-pointer file:mr-4 file:py-2.5 file:px-5 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-accent/10 file:text-accent-dark hover:file:bg-accent/20 transition-all"
                  />
                  {mediaFile && <span className="text-xs text-neutral-600 mt-3 font-semibold bg-neutral-100 px-3 py-1 rounded-full border border-neutral-200">{mediaFile.name}</span>}
                </div>

                <button
                  type="submit"
                  disabled={uploadLoading || !mediaFile}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary hover:bg-neutral-900 text-white font-semibold text-xs uppercase tracking-wider transition-colors shadow disabled:bg-neutral-300 cursor-pointer"
                >
                  {uploadLoading ? "Uploading to System..." : "Upload Selected File"}
                </button>
              </form>

              {uploadedUrl && (
                <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 flex flex-col gap-2 animate-fade-in-up">
                  <div className="flex items-center gap-2 text-xs font-bold">
                    <CheckCircle size={16} className="text-emerald-600" />
                    <span>File Uploaded Successfully!</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white px-3 py-2.5 rounded-xl border border-emerald-100 mt-1">
                    <input
                      type="text"
                      readOnly
                      value={uploadedUrl}
                      onClick={(e) => {
                        e.target.select();
                        navigator.clipboard.writeText(uploadedUrl);
                        alert("URL copied to clipboard!");
                      }}
                      className="text-xs font-mono text-neutral-700 bg-transparent flex-grow focus:outline-none cursor-pointer"
                    />
                    <a
                      href={uploadedUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-accent hover:text-accent-dark shrink-0"
                    >
                      <ExternalLink size={14} />
                    </a>
                  </div>
                  <span className="text-[10px] text-emerald-600">Click inside the input box to copy the URL directly.</span>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* PRODUCTS MODAL (ADD & EDIT) */}
      {productModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl bg-white rounded-3xl p-6 md:p-8 shadow-2xl border border-accent/20 relative my-8 text-left animate-fade-in-up">
            <button
              onClick={() => setProductModalOpen(false)}
              className="absolute top-6 right-6 p-2 text-primary/60 hover:text-accent rounded-full transition-colors cursor-pointer bg-neutral-50 hover:bg-neutral-100"
            >
              <X size={20} />
            </button>

            <h3 className="font-serif text-2xl text-primary font-medium mb-6">
              {editingProduct ? `Edit Product: ${editingProduct.name}` : "Add New Blanket/Textile"}
            </h3>

            {formError && (
              <div className="mb-4 p-3 text-xs bg-red-50 text-red-600 border border-red-200 rounded-xl flex items-center gap-2">
                <AlertCircle size={16} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleProductSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-neutral-300 rounded-xl bg-white text-sm focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none transition-shadow"
                    placeholder="Royale Mink Blanket"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">Category *</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full px-4 py-2.5 border border-neutral-300 rounded-xl bg-white text-sm focus:border-accent focus:outline-none cursor-pointer"
                    disabled={categoriesLoading}
                  >
                    <option value="" disabled>
                      {categoriesLoading ? "Loading categories..." : "Select a Category"}
                    </option>
                    {categories?.map(c => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">GSM Weight *</label>
                  <input
                    type="text"
                    required
                    value={productForm.gsm}
                    onChange={(e) => setProductForm({ ...productForm, gsm: e.target.value })}
                    className="w-full px-4 py-2.5 border border-neutral-300 rounded-xl bg-white text-sm focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none transition-shadow"
                    placeholder="420 GSM"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">Dimensions / Size *</label>
                  <input
                    type="text"
                    required
                    value={productForm.dimensions}
                    onChange={(e) => setProductForm({ ...productForm, dimensions: e.target.value })}
                    className="w-full px-4 py-2.5 border border-neutral-300 rounded-xl bg-white text-sm focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none transition-shadow"
                    placeholder="60 x 90 inches"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">Material Composition</label>
                  <input
                    type="text"
                    value={productForm.material}
                    onChange={(e) => setProductForm({ ...productForm, material: e.target.value })}
                    className="w-full px-4 py-2.5 border border-neutral-300 rounded-xl bg-white text-sm focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none transition-shadow"
                    placeholder="Ultra-soft polyester mink"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">Wash Care Tips (Comma separated)</label>
                  <input
                    type="text"
                    value={productForm.washCare}
                    onChange={(e) => setProductForm({ ...productForm, washCare: e.target.value })}
                    className="w-full px-4 py-2.5 border border-neutral-300 rounded-xl bg-white text-sm focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none transition-shadow"
                    placeholder="Gentle machine wash, Do not bleach"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">Product Image URLs (One URL per line)</label>
                <textarea
                  rows={3}
                  value={productForm.images}
                  onChange={(e) => setProductForm({ ...productForm, images: e.target.value })}
                  className="w-full px-4 py-2.5 border border-neutral-300 rounded-xl bg-white text-xs font-mono focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none resize-none transition-shadow"
                  placeholder="https://images.unsplash.com/photo-xxx..."
                />
              </div>

              <div className="bg-secondary/40 p-5 rounded-2xl border border-accent/10 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex flex-col gap-0.5 text-center sm:text-left">
                  <span className="text-xs font-bold text-neutral-600">Quick Upload Image Helper</span>
                  <span className="text-[10px] text-neutral-400">Upload a local file to automatically append its URL here.</span>
                </div>
                <input
                  type="file"
                  onChange={handleProductImageUpload}
                  disabled={uploadLoading}
                  className="text-xs text-neutral-500 w-fit cursor-pointer file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-[11px] file:font-bold file:bg-accent/15 file:text-accent-dark hover:file:bg-accent/25 transition-all"
                />
              </div>

              <div className="flex items-center gap-6 py-2">
                <label className="flex items-center gap-2.5 cursor-pointer text-sm font-semibold text-neutral-700">
                  <input
                    type="checkbox"
                    checked={productForm.featured}
                    onChange={(e) => setProductForm({ ...productForm, featured: e.target.checked })}
                    className="w-4 h-4 text-accent border-neutral-300 rounded focus:ring-accent cursor-pointer"
                  />
                  Feature on Homepage Slider
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer text-sm font-semibold text-neutral-700">
                  <input
                    type="checkbox"
                    checked={productForm.visible}
                    onChange={(e) => setProductForm({ ...productForm, visible: e.target.checked })}
                    className="w-4 h-4 text-accent border-neutral-300 rounded focus:ring-accent cursor-pointer"
                  />
                  Visible in Public Catalog
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-5 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="px-6 py-3 rounded-xl border border-neutral-300 text-neutral-600 font-semibold text-xs uppercase tracking-wider hover:bg-neutral-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={productCreateMutation.isPending || productUpdateMutation.isPending}
                  className="px-6 py-3 rounded-xl bg-primary hover:bg-neutral-900 text-white font-semibold text-xs uppercase tracking-wider transition-colors shadow-[0_4px_14px_rgba(17,17,17,0.1)]"
                >
                  {productCreateMutation.isPending || productUpdateMutation.isPending ? "Saving Product..." : "Save Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CATEGORIES MODAL (ADD & EDIT) */}
      {categoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 md:p-8 shadow-2xl border border-accent/20 relative text-left animate-fade-in-up">
            <button
              onClick={() => setCategoryModalOpen(false)}
              className="absolute top-6 right-6 p-2 text-primary/60 hover:text-accent rounded-full transition-colors cursor-pointer bg-neutral-50 hover:bg-neutral-100"
            >
              <X size={20} />
            </button>

            <h3 className="font-serif text-2xl text-primary font-medium mb-5">
              {editingCategory ? `Edit Category: ${editingCategory.name}` : "Create New Category"}
            </h3>

            {formError && (
              <div className="mb-4 p-3 text-xs bg-red-50 text-red-600 border border-red-200 rounded-xl">
                {formError}
              </div>
            )}

            <form onSubmit={handleCategorySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-neutral-300 rounded-xl bg-white text-sm focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none transition-shadow"
                  placeholder="e.g. Blankets"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">Sequence Order Position</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={categoryForm.order}
                  onChange={(e) => setCategoryForm({ ...categoryForm, order: parseInt(e.target.value) || 1 })}
                  className="w-full px-4 py-2.5 border border-neutral-300 rounded-xl bg-white text-sm focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none transition-shadow"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-5 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setCategoryModalOpen(false)}
                  className="px-6 py-3 rounded-xl border border-neutral-300 text-neutral-600 font-semibold text-xs uppercase tracking-wider hover:bg-neutral-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={categoryCreateMutation.isPending || categoryUpdateMutation.isPending}
                  className="px-6 py-3 rounded-xl bg-primary hover:bg-neutral-900 text-white font-semibold text-xs uppercase tracking-wider transition-all shadow-[0_4px_14px_rgba(17,17,17,0.1)]"
                >
                  {categoryCreateMutation.isPending || categoryUpdateMutation.isPending ? "Saving..." : "Save Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
