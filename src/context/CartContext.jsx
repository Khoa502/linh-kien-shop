import { createContext, useContext, useState, useEffect, useRef } from "react";
import { useAuth } from "./AuthContext";
import { safeJsonParse, safeGetLocalStorage } from "../utils/safeJsonParse";
import toast from "react-hot-toast";

const CartContext = createContext(null);

// Helper function để lấy cart key theo userId
const getCartKey = (userId) => {
  if (!userId) return "cart_guest";
  return `cart_user_${userId}`;
};

export const CartProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const userId = user?.userId || user?.maKH || null;
  const prevUserIdRef = useRef(null);

  const [items, setItems] = useState(() => {
    // Lấy userId từ localStorage với safe helper
    try {
      const savedUser = safeGetLocalStorage("user", null);
      if (savedUser && typeof savedUser === "object") {
        const savedUserId = savedUser?.userId || savedUser?.maKH || null;
        if (savedUserId) {
          const cartKey = getCartKey(savedUserId);
          return safeGetLocalStorage(cartKey, []);
        }
      }
    } catch (error) {
      console.error("Lỗi khôi phục giỏ hàng:", error);
    }
    return [];
  });

  // Load cart mới khi user đăng nhập/đăng xuất
  useEffect(() => {
    // Chỉ load lại cart khi userId thay đổi
    if (userId !== prevUserIdRef.current) {
      prevUserIdRef.current = userId;

      if (userId) {
        // User đã đăng nhập - load cart của user đó
        const cartKey = getCartKey(userId);
        try {
          const savedCart = localStorage.getItem(cartKey);
          // Sử dụng safeJsonParse để parse an toàn
          const parsedCart = safeJsonParse(savedCart, []);
          if (Array.isArray(parsedCart)) {
            setItems(parsedCart);
          } else {
            setItems([]);
          }
        } catch (error) {
          console.error("Lỗi load giỏ hàng:", error);
          setItems([]);
        }
      } else {
        // Chưa đăng nhập hoặc đã đăng xuất
        setItems([]);
      }
    }
  }, [userId]);

  // Lưu cart vào localStorage theo userId
  useEffect(() => {
    const cartKey = getCartKey(userId);
    localStorage.setItem(cartKey, JSON.stringify(items));
  }, [items, userId]);

  const addItem = (product, qty = 1) => {
    // API dùng maSP, fallback về id nếu có
    const productId = product.maSP ?? product.id;
    const productName = product.tenSP || product.tenSanPham || "Sản phẩm";

    setItems((prev) => {
      const existing = prev.find((i) => i._cartId === productId);
      if (existing) {
        toast.success("Đã cập nhật số lượng!");
        return prev.map((i) =>
          i._cartId === productId ? { ...i, quantity: i.quantity + qty } : i,
        );
      }
      toast.success(`Đã thêm "${productName.substring(0, 30)}" vào giỏ!`);
      // Lưu _cartId riêng để không phụ thuộc vào tên field
      return [...prev, { ...product, _cartId: productId, quantity: qty }];
    });
  };

  const removeItem = (cartId) => {
    setItems((prev) => prev.filter((i) => i._cartId !== cartId));
    toast.success("Đã xóa sản phẩm khỏi giỏ hàng");
  };

  const updateQty = (cartId, qty) => {
    if (qty < 1) return removeItem(cartId);
    setItems((prev) =>
      prev.map((i) => (i._cartId === cartId ? { ...i, quantity: qty } : i)),
    );
  };

  const clearCart = () => {
    setItems([]);
    // Xóa cart của user hiện tại
    const cartKey = getCartKey(userId);
    localStorage.removeItem(cartKey);
  };

  // Hàm lấy giá sản phẩm - hỗ trợ cả giaBan, gia, donGia
  const getItemPrice = (item) => {
    return Number(item.giaBan) || Number(item.gia) || Number(item.donGia) || 0;
  };

  const total = items.reduce((sum, i) => sum + getItemPrice(i) * i.quantity, 0);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQty, clearCart, total, count }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
