using System.ComponentModel.DataAnnotations;

namespace BackendAPI.DTOs
{
    public class ChiTietHoaDonDto
    {
        public int MaCTHD { get; set; }
        public int MaHD { get; set; }
        public string MaHoaDon { get; set; }
        public int MaSP { get; set; }
        public string TenSP { get; set; }
        public int? SoLuong { get; set; }
        public decimal? DonGia { get; set; }
        public decimal? ThanhTien { get; set; }
        public string GhiChu { get; set; }
    }

    public class ChiTietHoaDonCreateDto
    {
        // ✅ SỬA: MaHD không còn bắt buộc vì sẽ được gán tự động từ HoaDon
        public int? MaHD { get; set; }
        
        [Required]
        public int MaSP { get; set; }
        
        [Required]
        [Range(1, int.MaxValue)]
        public int? SoLuong { get; set; }
        
        [Required]
        public decimal? DonGia { get; set; }
        
        public string GhiChu { get; set; }
    }

    public class ChiTietHoaDonUpdateDto
    {
        [Required]
        public int MaCTHD { get; set; }
        
        public int? SoLuong { get; set; }
        
        public decimal? DonGia { get; set; }
        
        public string GhiChu { get; set; }
    }
}