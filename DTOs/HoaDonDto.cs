using System.ComponentModel.DataAnnotations;

namespace BackendAPI.DTOs
{
    public class HoaDonDto
    {
        public int MaHD { get; set; }
        public string MaHoaDon { get; set; }
        public DateTime? NgayBan { get; set; }
      
        public string TenNV { get; set; }
        public int? MaKH { get; set; }
        public string TenKH { get; set; }
        public decimal? TongTien { get; set; }
        public decimal? GiamGia { get; set; }
        public decimal? ThanhTien { get; set; }
        public string HinhThucThanhToan { get; set; }
        public string TrangThai { get; set; }
        public string GhiChu { get; set; }
        
        // Danh sách sản phẩm trong đơn hàng
        public List<SanPhamTrongDonDto> SanPhams { get; set; }
    }
    
    public class SanPhamTrongDonDto
    {
        public string TenSP { get; set; }
        public int? SoLuong { get; set; }
    }

    public class HoaDonCreateDto
    {
        [StringLength(50)]
        public string MaHoaDon { get; set; }
        
        public DateTime? NgayBan { get; set; } = DateTime.Now;
        
        public int? MaNV { get; set; }
        
        public int? MaKH { get; set; }
        
        public decimal? TongTien { get; set; } = 0;
        
        public decimal? GiamGia { get; set; } = 0;
        
        public decimal? ThanhTien { get; set; } = 0;
        
        [StringLength(50)]
        public string HinhThucThanhToan { get; set; }
        
        [StringLength(20)]
        public string TrangThai { get; set; } = "Chờ thanh toán";
        
        public string GhiChu { get; set; }

        // ✅ THÊM: Danh sách chi tiết đơn hàng (theo tên Frontend gửi)
        public List<ChiTietHoaDonCreateDto> ChiTietDonHangs { get; set; }
    }

    public class HoaDonUpdateDto
    {
        [Required]
        public int MaHD { get; set; }
        
        [StringLength(50)]
        public string MaHoaDon { get; set; }
        
        public DateTime? NgayBan { get; set; }
        
        public int? MaNV { get; set; }
        
        public int? MaKH { get; set; }
        
        public decimal? TongTien { get; set; }
        
        public decimal? GiamGia { get; set; }
        
        public decimal? ThanhTien { get; set; }
        
        [StringLength(50)]
        public string HinhThucThanhToan { get; set; }
        
        [StringLength(20)]
        public string TrangThai { get; set; }
        
        public string GhiChu { get; set; }
    }
}