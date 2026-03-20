using System.ComponentModel.DataAnnotations;

namespace BackendAPI.DTOs
{
    public class LoginDto
    {
        [Required]
        public string TenDangNhap { get; set; }
        
        [Required]
        public string MatKhau { get; set; }
    }

    public class LoginResponseDto
    {
        public string Token { get; set; }
        public string TenDangNhap { get; set; }
        public string Role { get; set; }
        public int UserId { get; set; }
        public DateTime Expiration { get; set; }
        
        // Thêm các trường mới
        public int? MaNV { get; set; }   // Mã nhân viên (nếu là nhân viên)
        public int? MaKH { get; set; }   // Mã khách hàng (nếu là khách hàng)
    }

    // ✅ DTO mới cho đăng ký có thông tin khách hàng
    public class DangKyDto
    {
        [Required]
        [StringLength(50)]
        public string TenDangNhap { get; set; }
        
        [Required]
        [StringLength(100, MinimumLength = 6)]
        public string MatKhau { get; set; }
        
        public bool TrangThai { get; set; } = true;
        
        // Thông tin khách hàng
        [Required]
        [StringLength(100)]
        public string HoTen { get; set; }
        
        [StringLength(15)]
        public string SoDienThoai { get; set; }
        
        [StringLength(200)]
        public string DiaChi { get; set; }
    }
}
