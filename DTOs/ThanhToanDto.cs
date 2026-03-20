using System.ComponentModel.DataAnnotations;

namespace BackendAPI.DTOs
{
    public class ThanhToanDto
    {
        public int MaThanhToan { get; set; }
        public int? MaHD { get; set; }
        public string MaHoaDon { get; set; }
        public int? MaPTTT { get; set; }
        public string TenPhuongThuc { get; set; }
        public string TenKH { get; set; }
        public decimal? SoTien { get; set; }
        public string MaGiaoDich { get; set; }
        public string TrangThai { get; set; }
        public DateTime? NgayThanhToan { get; set; }
    }

    /// <summary>
    /// DTO cho chi tiết thanh toán - join 4 bảng: ThanhToan, HoaDon, KhachHang, PhuongThucThanhToan
    /// </summary>
    public class ThanhToanChiTietDto
    {
        public int MaThanhToan { get; set; }
        public string MaHoaDon { get; set; }
        public string TenKH { get; set; }
        public string TenPhuongThuc { get; set; }
        public decimal? SoTien { get; set; }
        public DateTime? NgayThanhToan { get; set; }
        public string TrangThai { get; set; }
    }

    public class ThanhToanCreateDto
    {
        [Required]
        public int? MaHD { get; set; }
        
        [Required]
        public int? MaPTTT { get; set; }
        
        [Required]
        public decimal? SoTien { get; set; }
        
        public string MaGiaoDich { get; set; }
        
        [StringLength(20)]
        public string TrangThai { get; set; } = "Thành công";
        
        public DateTime? NgayThanhToan { get; set; } = DateTime.Now;
    }

    public class ThanhToanUpdateDto
    {
        [Required]
        public int MaThanhToan { get; set; }
        
        public string MaGiaoDich { get; set; }
        
        [StringLength(20)]
        public string TrangThai { get; set; }
    }
}