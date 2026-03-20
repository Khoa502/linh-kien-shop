import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { productService } from "../../services/productService";
import { categoryService } from "../../services/categoryService";
import ProductCard from "../../components/ProductCard";
import { SkeletonCard } from "../../components/LoadingSpinner";

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "",
  );
  const [sortBy, setSortBy] = useState("default");
  const [allProducts, setAllProducts] = useState([]); // lưu toàn bộ từ API

  useEffect(() => {
    categoryService.getAll().then((r) => {
      const cats = r.data;
      setCategories(Array.isArray(cats) ? cats : cats?.data || []);
    });
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      console.log("Calling productService.getProducts()...");
      const data = await productService.getProducts();
      console.log("Raw products data:", data?.length || 0, data);
      const list = Array.isArray(data) ? data : [];
      setAllProducts(list);
      setProducts(list);
    } catch (error) {
      console.error("fetchProducts error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Filter + sort phía frontend (no pagination)
  const filtered = allProducts.filter((p) => {
    const matchSearch =
      !search || (p.tenSP || "").toLowerCase().includes(search.toLowerCase());
    const matchCat =
      !selectedCategory || String(p.maLoai) === String(selectedCategory);
    return matchSearch && matchCat;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "price-asc") return (a.giaBan || 0) - (b.giaBan || 0);
    if (sortBy === "price-desc") return (b.giaBan || 0) - (a.giaBan || 0);
    if (sortBy === "name") return (a.tenSP || "").localeCompare(b.tenSP || "");
    return 0;
  });

  const displayProducts = sorted; // Show all filtered/sorted products
  const isPaginated = false; // No pagination

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-display font-black text-3xl text-slate-900 dark:text-white mb-6">
        Tất cả sản phẩm
      </h1>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700 mb-6 flex flex-wrap gap-3">
        {/* Search */}
        <div className="flex-1 min-w-60 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            🔍
          </span>
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
            }}
            className="input-field pl-10"
          />
        </div>

        {/* Category filter */}
        <select
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
          }}
          className="input-field w-auto min-w-40"
        >
          <option value="">Tất cả danh mục</option>
          {categories.map((c) => (
            <option key={c.maLoai} value={c.maLoai}>
              {c.tenLoai}
            </option>
          ))}
        </select>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="input-field w-auto min-w-40"
        >
          <option value="default">Mặc định</option>
          <option value="price-asc">Giá: Thấp → Cao</option>
          <option value="price-desc">Giá: Cao → Thấp</option>
          <option value="name">Tên A-Z</option>
        </select>

        {(search || selectedCategory) && (
          <button
            onClick={() => {
              setSearch("");
              setSelectedCategory("");
            }}
            className="btn-secondary text-sm px-4 py-2"
          >
            ✕ Xóa bộ lọc
          </button>
        )}
      </div>

      {/* Category pills */}
      {categories.length > 0 && (
        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => {
              setSelectedCategory("");
            }}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${!selectedCategory ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-blue-50"}`}
          >
            Tất cả
          </button>
          {categories.map((c) => (
            <button
              key={c.maLoai}
              onClick={() => {
                setSelectedCategory(String(c.maLoai));
              }}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${selectedCategory === String(c.maLoai) ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-blue-50"}`}
            >
              {c.tenLoai}
            </button>
          ))}
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array(12)
            .fill(null)
            .map((_, i) => (
              <SkeletonCard key={i} />
            ))}
        </div>
      ) : allProducts.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">📦</p>
          <p className="font-bold text-lg text-slate-600 dark:text-slate-400">
            Chưa có sản phẩm
          </p>
          <p className="text-slate-400 mt-1">Kiểm tra console logs và API</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">🔍</p>
          <p className="font-bold text-lg text-slate-600 dark:text-slate-400">
            Không tìm thấy sản phẩm
          </p>
          <p className="text-slate-400 mt-1">Thử tìm kiếm với từ khóa khác</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Hiển thị <strong>{displayProducts.length}</strong> sản phẩm
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {displayProducts.map((p) => (
              <ProductCard key={p.maSP} product={p} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
