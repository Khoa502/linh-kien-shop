using System.ComponentModel.DataAnnotations;

namespace BackendAPI.DTOs
{
    public class ChiTietPhieuNhapDto
    {
        public int MaCTPN { get; set; }
        public int MaPN { get; set; }
        public int MaSP { get; set; }
        public string TenSP { get; set; }
        public int? SoLuong { get; set; }
        public decimal? DonGiaNhap { get; set; }
        public decimal? ThanhTien { get; set; }
        
        
    }

    public class ChiTietPhieuNhapCreateDto
    {
        public int? MaPN { get; set; }  // Optional - dùng cho api riêng lẻ
        
        [Required]
        public int MaSP { get; set; }
        
        [Required]
        [Range(1, int.MaxValue)]
        public int? SoLuong { get; set; }
        
        [Required]
        public decimal? DonGiaNhap { get; set; }
    }

    public class ChiTietPhieuNhapUpdateDto
    {
        [Required]
        public int MaCTPN { get; set; }
        
        public int? SoLuong { get; set; }
        
        public decimal? DonGiaNhap { get; set; }
    }
}