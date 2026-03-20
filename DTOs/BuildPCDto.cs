using System.Text.Json.Serialization;

namespace BackendAPI.DTOs
{
    // DTO tính tổng giá cấu hình
    public class TinhGiaDto
    {
        [JsonPropertyName("cpuId")]
        public int? CpuId { get; set; }
        
        [JsonPropertyName("mainboardId")]
        public int? MainboardId { get; set; }
        
        [JsonPropertyName("ramId")]
        public int? RamId { get; set; }
        
        [JsonPropertyName("gpuId")]
        public int? GpuId { get; set; }
        
        [JsonPropertyName("ssdId")]
        public int? SsdId { get; set; }
        
        [JsonPropertyName("psuId")]
        public int? PsuId { get; set; }
        
        [JsonPropertyName("caseId")]
        public int? CaseId { get; set; }
    }

    public class TinhGiaResultDto
    {
        [JsonPropertyName("tongTien")]
        public decimal TongTien { get; set; }
        
        [JsonPropertyName("chiTiet")]
        public List<ChiTietGiaDto> ChiTiet { get; set; }
    }

    public class ChiTietGiaDto
    {
        [JsonPropertyName("loaiLinhKien")]
        public string LoaiLinhKien { get; set; }
        
        [JsonPropertyName("tenSanPham")]
        public string TenSanPham { get; set; }
        
        [JsonPropertyName("gia")]
        public decimal Gia { get; set; }
    }

    // DTO for raw SQL query of ChiTietCauHinhPC
    public class ChiTietCauHinhPCDto
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }
        
        [JsonPropertyName("cauHinhPCId")]
        public int CauHinhPCId { get; set; }
        
        [JsonPropertyName("sanPhamId")]
        public int SanPhamId { get; set; }
        
        [JsonPropertyName("loaiLinhKien")]
        public string LoaiLinhKien { get; set; }
        
        [JsonPropertyName("gia")]
        public decimal Gia { get; set; }
        
        [JsonPropertyName("soLuong")]
        public int SoLuong { get; set; }
    }

    // DTO lưu cấu hình PC
    public class LuuCauHinhDto
    {
        [JsonPropertyName("tenCauHinh")]
        public string TenCauHinh { get; set; }
        
        [JsonPropertyName("maKH")]
        public int? MaKH { get; set; }
        
        [JsonPropertyName("chiTiet")]
        public List<ChiTietCauHinhDto> ChiTiet { get; set; }
    }

    public class ChiTietCauHinhDto
    {
        [JsonPropertyName("sanPhamId")]
        public int SanPhamId { get; set; }
        
        [JsonPropertyName("loaiLinhKien")]
        public string LoaiLinhKien { get; set; }
        
        [JsonPropertyName("soLuong")]
        public int SoLuong { get; set; } = 1;
    }

    // DTO đặt hàng từ cấu hình
    public class DatHangDto
    {
        [JsonPropertyName("maKH")]
        public int? MaKH { get; set; }
        
        [JsonPropertyName("maNV")]
        public int? MaNV { get; set; }
        
        [JsonPropertyName("hinhThucThanhToan")]
        public string HinhThucThanhToan { get; set; }
        
        [JsonPropertyName("ghiChu")]
        public string GhiChu { get; set; }
        
        [JsonPropertyName("chiTiet")]
        public List<ChiTietCauHinhDto> ChiTiet { get; set; }
    }

    // DTO kết quả đặt hàng
    public class DatHangResultDto
    {
        [JsonPropertyName("maHD")]
        public int MaHD { get; set; }
        
        [JsonPropertyName("maHoaDon")]
        public string MaHoaDon { get; set; }
        
        [JsonPropertyName("tongTien")]
        public decimal TongTien { get; set; }
        
        [JsonPropertyName("message")]
        public string Message { get; set; }
    }

    // DTO lấy linh kiện theo loại
    public class LinhKienDto
    {
        [JsonPropertyName("maSP")]
        public int MaSP { get; set; }
        
        [JsonPropertyName("tenSP")]
        public string TenSP { get; set; }
        
        [JsonPropertyName("giaBan")]
        public decimal GiaBan { get; set; }
        
        [JsonPropertyName("hinhAnh")]
        public string HinhAnh { get; set; }
        
        [JsonPropertyName("moTa")]
        public string MoTa { get; set; }
        
        [JsonPropertyName("soLuongTon")]
        public int? SoLuongTon { get; set; }
    }

    // ================= DTO for PC Builder endpoints =================

    /// <summary>
    /// Request DTO for saving PC configuration - gets MaKH from JWT
    /// </summary>
    public class LuuCauHinhRequestDto
    {
        [JsonPropertyName("tenCauHinh")]
        public string TenCauHinh { get; set; }
        
        [JsonPropertyName("maKH")]
        public int? MaKH { get; set; }
        
        [JsonPropertyName("tongTien")]
        public decimal TongTien { get; set; }
        
        [JsonPropertyName("danhSachLinhKien")]
        public List<GioHangItemDto> DanhSachLinhKien { get; set; }
    }

    /// <summary>
    /// Request DTO for adding items to shopping cart - gets MaKH from JWT
    /// </summary>
    public class ThemGioHangRequestDto
    {
        [JsonPropertyName("danhSachSanPham")]
        public List<GioHangItemDto> DanhSachSanPham { get; set; }
    }

    /// <summary>
    /// Individual item with product ID and quantity
    /// </summary>
    public class GioHangItemDto
    {
        [JsonPropertyName("sanPhamId")]
        public int SanPhamId { get; set; }
        
        [JsonPropertyName("soLuong")]
        public int SoLuong { get; set; } = 1;
    }

    /// <summary>
    /// Response DTO for cart operations
    /// </summary>
    public class GioHangResponseDto
    {
        [JsonPropertyName("gioHangId")]
        public int GioHangId { get; set; }
        
        [JsonPropertyName("maKH")]
        public int MaKH { get; set; }
        
        [JsonPropertyName("tongTien")]
        public decimal TongTien { get; set; }
        
        [JsonPropertyName("soLuongSanPham")]
        public int SoLuongSanPham { get; set; }
        
        [JsonPropertyName("chiTiet")]
        public List<GioHangChiTietResponseDto> ChiTiet { get; set; }
        
        [JsonPropertyName("message")]
        public string Message { get; set; }
    }

    /// <summary>
    /// Cart item response DTO
    /// </summary>
    public class GioHangChiTietResponseDto
    {
        [JsonPropertyName("sanPhamId")]
        public int SanPhamId { get; set; }
        
        [JsonPropertyName("tenSanPham")]
        public string TenSanPham { get; set; }
        
        [JsonPropertyName("hinhAnh")]
        public string HinhAnh { get; set; }
        
        [JsonPropertyName("soLuong")]
        public int SoLuong { get; set; }
        
        [JsonPropertyName("donGia")]
        public decimal DonGia { get; set; }
        
        [JsonPropertyName("thanhTien")]
        public decimal ThanhTien { get; set; }
    }

    /// <summary>
    /// Request DTO for updating cart item quantity
    /// </summary>
    public class CapNhatGioHangDto
    {
        [JsonPropertyName("sanPhamId")]
        public int SanPhamId { get; set; }
        
        [JsonPropertyName("soLuong")]
        public int SoLuong { get; set; }
    }

    // ================= DTO for CauHinhPC API =================

    /// <summary>
    /// Request DTO for creating PC configuration - PHẦN 1
    /// </summary>
    public class CreateCauHinhPCDTO
    {
        [JsonPropertyName("tenCauHinh")]
        public string TenCauHinh { get; set; }
        
        [JsonPropertyName("maKH")]
        public int? MaKH { get; set; }
        
        [JsonPropertyName("linhKien")]
        public List<ChiTietCauHinhDTO> LinhKien { get; set; }
    }

    /// <summary>
    /// DTO for PC configuration item - PHẦN 1 & 4
    /// </summary>
    public class ChiTietCauHinhDTO
    {
        [JsonPropertyName("sanPhamId")]
        public int SanPhamId { get; set; }
        
        [JsonPropertyName("loaiLinhKien")]
        public string LoaiLinhKien { get; set; }
        
        [JsonPropertyName("gia")]
        public decimal Gia { get; set; }
        
        [JsonPropertyName("soLuong")]
        public int SoLuong { get; set; }
    }

    /// <summary>
    /// Response DTO for PC configuration detail - PHẦN 2
    /// </summary>
    public class CauHinhPCResponseDTO
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }
        
        [JsonPropertyName("tenCauHinh")]
        public string TenCauHinh { get; set; }
        
        [JsonPropertyName("tongGia")]
        public decimal TongGia { get; set; }
        
        [JsonPropertyName("ngayTao")]
        public DateTime NgayTao { get; set; }
        
        [JsonPropertyName("maKH")]
        public int? MaKH { get; set; }
        
        [JsonPropertyName("linhKien")]
        public List<ChiTietCauHinhResponseDTO> LinhKien { get; set; }
    }

    /// <summary>
    /// Response DTO for PC configuration item with product info - PHẦN 2
    /// </summary>
    public class ChiTietCauHinhResponseDTO
    {
        [JsonPropertyName("sanPhamId")]
        public int SanPhamId { get; set; }
        
        [JsonPropertyName("tenSanPham")]
        public string TenSanPham { get; set; }
        
        [JsonPropertyName("loaiLinhKien")]
        public string LoaiLinhKien { get; set; }
        
        [JsonPropertyName("gia")]
        public decimal Gia { get; set; }
        
        [JsonPropertyName("soLuong")]
        public int SoLuong { get; set; }
        
        [JsonPropertyName("hinhAnh")]
        public string HinhAnh { get; set; }
    }

    /// <summary>
    /// Response DTO for MuaNgay - PHẦN 3
    /// </summary>
    public class MuaNgayResponseDTO
    {
        [JsonPropertyName("maHD")]
        public int MaHD { get; set; }
        
        [JsonPropertyName("maHoaDon")]
        public string MaHoaDon { get; set; }
        
        [JsonPropertyName("tongTien")]
        public decimal TongTien { get; set; }
        
        [JsonPropertyName("message")]
        public string Message { get; set; }
    }
}

