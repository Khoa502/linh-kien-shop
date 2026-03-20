import axiosInstance, { handleResponse } from "./axiosInstance";
import { sanPhamService } from "./sanPhamService";

const mockProducts = [
  {
    maSP: "CPU001",
    tenSP: "Intel Core i7-13700K 16C/24T",
    giaBan: 12990000,
    hinhAnh: "https://placehold.co/400x300/4f46e5/ffffff/i7-13700K",
    maLoai: 1,
    soLuongTon: 15,
    moTa: "Rocket Lake, up to 5.3GHz boost, unlocked OC",
    tenLoai: "CPU",
    giaGoc: 14990000,
    trangThai: 1,
  },
  {
    maSP: "VGA002",
    tenSP: "ASUS RTX 4070 Ti 12GB Dual OC",
    giaBan: 25990000,
    hinhAnh: "https://placehold.co/400x300/2563eb/ffffff/RTX4070Ti",
    maLoai: 1,
    soLuongTon: 8,
    moTa: "Ada Lovelace, DLSS 3, 4K gaming",
    tenLoai: "Card Màn Hình",
    giaGoc: 28990000,
    trangThai: 1,
  },
  {
    maSP: "RAM003",
    tenSP: "Corsair Vengeance 32GB (2x16) DDR5 6000MHz C36",
    giaBan: 5490000,
    hinhAnh: "https://placehold.co/400x300/f97316/000000/Vengeance+DDR5",
    maLoai: 2,
    soLuongTon: 25,
    moTa: "RGB, XMP 3.0 ready, lifetime warranty",
    tenLoai: "RAM",
    giaGoc: 6290000,
    trangThai: 1,
  },
  {
    maSP: "SSD004",
    tenSP: "WD Black SN850X 1TB M.2 PCIe 4.0 NVMe",
    giaBan: 3290000,
    hinhAnh: "https://placehold.co/400x300/ff6b35/ffffff/SN850X+1TB",
    maLoai: 3,
    soLuongTon: 30,
    moTa: "Read 7000MB/s, Write 6600MB/s, heatsink edition",
    tenLoai: "Ổ Cứng SSD",
    giaGoc: 3690000,
    trangThai: 1,
  },
  {
    maSP: "MAIN005",
    tenSP: "MSI MPG Z790 Carbon WiFi DDR5",
    giaBan: 9990000,
    hinhAnh: "https://placehold.co/400x300/10b981/ffffff/Z790+Carbon",
    maLoai: 4,
    soLuongTon: 12,
    moTa: "LGA1700, WiFi 6E, 5G LAN, ARGB",
    tenLoai: "Bo Mạch Chủ",
    giaGoc: 11290000,
    trangThai: 1,
  },
  {
    maSP: "CASE006",
    tenSP: "Lian Li Lancool III RGB Black",
    giaBan: 3690000,
    hinhAnh: "https://placehold.co/400x300/667eea/ffffff/Lancool+III",
    maLoai: 5,
    soLuongTon: 18,
    moTa: "Mid-tower, tempered glass, excellent airflow",
    tenLoai: "Vỏ Case",
    giaGoc: 4190000,
    trangThai: 1,
  },
  {
    maSP: "PSU007",
    tenSP: "Corsair RM850x 850W 80+ Gold Fully Modular",
    giaBan: 3590000,
    hinhAnh: "https://placehold.co/400x300/1e3a8a/ffffff/RM850x",
    maLoai: 6,
    soLuongTon: 22,
    moTa: "10-year warranty, zero RPM mode",
    tenLoai: "Nguồn",
    giaGoc: 3990000,
    trangThai: 1,
  },
  {
    maSP: "MON008",
    tenSP: 'Samsung Odyssey G7 32" 4K 144Hz Curved',
    giaBan: 18990000,
    hinhAnh: "https://placehold.co/400x300/dc2626/ffffff/Odyssey+G7",
    maLoai: 8,
    soLuongTon: 6,
    moTa: "VA panel, 1000R curve, HDMI 2.1",
    tenLoai: "Màn Hình",
    giaGoc: 21990000,
    trangThai: 1,
  },
  {
    maSP: "KEY009",
    tenSP: "Keychron K8 Pro 75% Wireless Mechanical",
    giaBan: 2790000,
    hinhAnh: "https://placehold.co/400x300/a855f7/000000/Keychron+K8",
    maLoai: 9,
    soLuongTon: 35,
    moTa: "Gateron Brown, hotswap, QMK/VIA",
    tenLoai: "Bàn Phím",
    giaGoc: 3190000,
    trangThai: 1,
  },
  {
    maSP: "MOU010",
    tenSP: "Logitech G Pro X Superlight Wireless",
    giaBan: 2590000,
    hinhAnh: "https://placehold.co/400x300/795548/ffffff/G+Pro+Superlight",
    maLoai: 9,
    soLuongTon: 40,
    moTa: "60g ultralight, HERO 25K sensor",
    tenLoai: "Chuột",
    giaGoc: 2990000,
    trangThai: 1,
  },
  {
    maSP: "HEAD011",
    tenSP: "HyperX Cloud Alpha Wireless",
    giaBan: 3990000,
    hinhAnh: "https://placehold.co/400x300/e53f70/ffffff/Cloud+Alpha",
    maLoai: 10,
    soLuongTon: 28,
    moTa: "300h battery, DTS spatial audio",
    tenLoai: "Tai Nghe",
    giaGoc: 4490000,
    trangThai: 1,
  },
  {
    maSP: "FAN012",
    tenSP: "Noctua NF-A12x25 PWM 120mm Premium",
    giaBan: 890000,
    hinhAnh: "https://placehold.co/400x300/fbbf24/000000/NF-A12x25",
    maLoai: 11,
    soLuongTon: 50,
    moTa: "6-year warranty, SSO2 bearing",
    tenLoai: "Quạt Tản Nhiệt",
    giaGoc: 990000,
    trangThai: 1,
  },
];

// SanPham fields: { maSP, maLinhKien, tenSP, thongSoKyThuat, donViTinh,
//   giaNhap, giaBan, soLuongTon, hinhAnh, maLoai, tenLoai, maNCC, tenNCC, trangThai, moTa }

export const productService = {
  getAll: async () => {
    try {
      let response = await sanPhamService.getAll();

      // Xử lý linh hoạt: Rút trích mảng dữ liệu dù nó nằm ở đâu
      let data = [];
      if (Array.isArray(response)) {
        data = response;
      } else if (response && Array.isArray(response.data)) {
        data = response.data;
      }

      // Kiểm tra nếu mảng thực sự rỗng hoặc không lấy được
      if (!data || data.length === 0) {
        console.warn(
          "⚠️ API không trả về mảng sản phẩm nào, chuyển sang dùng Mock Data.",
        );
        return mockProducts;
      }

      return data; // Trả về đúng MẢNG để React dễ dùng
    } catch (error) {
      console.error("❌ sanPhamService.getAll error:", error);
      console.log("Fallback to mock data");
      return mockProducts;
    }
  },

  // Trỏ thẳng về hàm getAll() ở ngay phía trên để dùng chung logic an toàn
  getProducts: async () => productService.getAll(),

  getById: async (maSP) => {
    try {
      const res = await axiosInstance.get(`/SanPham/${maSP}`);
      return handleResponse(res);
    } catch (error) {
      console.error(`API /SanPham/${maSP} lỗi, fallback to mock:`, error);
      const mockProduct = mockProducts.find((p) => p.maSP === maSP);
      if (mockProduct) {
        console.log(`✅ Mock fallback for ${maSP}:`, mockProduct.tenSP);
        return mockProduct;
      }
      console.error(`❌ No mock for ${maSP}`);
      return null;
    }
  },
  create: async (data) => {
    try {
      const res = await axiosInstance.post("/SanPham", data);
      return handleResponse(res);
    } catch (error) {
      console.error("API /SanPham create lỗi", error);
      return null;
    }
  },
  update: async (maSP, d) => {
    try {
      const res = await axiosInstance.put(`/SanPham/${maSP}`, d);
      return handleResponse(res);
    } catch (error) {
      console.error(`API /SanPham/${maSP} update lỗi`, error);
      return null;
    }
  },
  delete: async (maSP) => {
    try {
      const res = await axiosInstance.delete(`/SanPham/${maSP}`);
      return handleResponse(res) !== null;
    } catch (error) {
      console.error(`API /SanPham/${maSP} delete lỗi`, error);
      return false;
    }
  },
};
