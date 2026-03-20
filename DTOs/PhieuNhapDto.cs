using System.ComponentModel.DataAnnotations;

namespace BackendAPI.DTOs
{
    public class PhieuNhapDto
    {
        public int MaPN { get; set; }
        public string MaPhieuNhap { get; set; } // ✅ Thêm trường mã phiếu
        public int? MaNV { get; set; }
        public string TenNV { get; set; }
        public int? MaNCC { get; set; }
        public string TenNCC { get; set; }
        public DateTime? NgayNhap { get; set; }
        public decimal? TongTien { get; set; }
        public string GhiChu { get; set; }
    }

    public class PhieuNhapCreateDto
    {
        [Required]
        public int? MaNV { get; set; }
        
        [Required]
        public int? MaNCC { get; set; }
        
        public DateTime? NgayNhap { get; set; } = DateTime.Now;
        
        public decimal? TongTien { get; set; } = 0;
        
        public string GhiChu { get; set; }
        
        // ✅ Thêm danh sách chi tiết phiếu nhập
        public List<ChiTietPhieuNhapCreateDto> ChiTietPhieuNhaps { get; set; }
    }

    public class PhieuNhapCreateWithChiTietDto
    {
        [Required]
        public int? MaNV { get; set; }
        
        [Required]
        public int? MaNCC { get; set; }
        
        public DateTime? NgayNhap { get; set; }
        
        public string GhiChu { get; set; }
        
        public List<ChiTietPhieuNhapCreateDto> ChiTietPhieuNhaps { get; set; }
    }

    public class PhieuNhapUpdateDto
    {
        [Required]
        public int MaPN { get; set; }
        
        public DateTime? NgayNhap { get; set; }
        
        public decimal? TongTien { get; set; }
        
        public string GhiChu { get; set; }
    }
}
