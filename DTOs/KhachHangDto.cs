using System.ComponentModel.DataAnnotations;

namespace BackendAPI.DTOs
{
    public class KhachHangDto
    {
        public int MaKH { get; set; }
        public string HoTen { get; set; }
        public string SoDienThoai { get; set; }
        public string DiaChi { get; set; }
        public int? DiemTichLuy { get; set; }
        public decimal? TongNo { get; set; }
        public int? TaiKhoanID { get; set; }
        public string TenDangNhap { get; set; }
    }

    public class KhachHangCreateDto
    {
        [Required]
        [StringLength(100)]
        public string HoTen { get; set; }
        
        [StringLength(15)]
        public string SoDienThoai { get; set; }
        
        [StringLength(200)]
        public string DiaChi { get; set; }
        
        public int? DiemTichLuy { get; set; }
        
        public int? TaiKhoanID { get; set; }
    }

    public class KhachHangUpdateDto
    {
        [Required]
        [StringLength(100)]
        public string HoTen { get; set; }
        
        [StringLength(15)]
        public string SoDienThoai { get; set; }
        
        [StringLength(200)]
        public string DiaChi { get; set; }
    }
}