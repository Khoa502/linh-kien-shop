import axiosInstance from "./axiosInstance.js";
import { productService } from "./productService.js";

export const productSearchService = {
  search: async (keyword) => {
    try {
      // Try backend search API first: /api/SanPham/search?Keyword=ram
      const res = await axiosInstance.get(
        `sanpham/search?keyword=${encodeURIComponent(keyword)}`,
      );
      const data = res.data || [];

      // Ensure it's an array of products with expected fields
      if (Array.isArray(data) && data.length > 0) {
        console.log(`✅ Backend search "${keyword}": ${data.length} products`);
        return data.slice(0, 10); // Limit results
      }

      // Empty result from API
      return [];
    } catch (error) {
      console.warn(
        `⚠️ Backend search "${keyword}" failed, using fallback:`,
        error.message,
      );

      // Fallback: existing client-side search (preserves current behavior)
      try {
        const allProducts = await productService.getAll();
        const filtered = allProducts.filter(
          (p) =>
            p.tenSP && p.tenSP.toLowerCase().includes(keyword.toLowerCase()),
        );
        console.log(
          `✅ Fallback search "${keyword}": ${filtered.length} products`,
        );
        return filtered.slice(0, 10);
      } catch (fallbackError) {
        console.error("❌ Fallback also failed:", fallbackError);
        return [];
      }
    }
  },
};
