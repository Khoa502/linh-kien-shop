using System.ComponentModel.DataAnnotations;

namespace BackendAPI.DTOs
{
    public class TaiKhoanDto
    {
        public int ID { get; set; }
        public string TenDangNhap { get; set; }
        public string Email { get; set; }
        public bool TrangThai { get; set; }
        public DateTime NgayTao { get; set; }
        public int RoleID { get; set; }
        public string TenQuyen { get; set; }
    }

    public class TaiKhoanCreateDto
    {
        [Required]
        [StringLength(50)]
        public string TenDangNhap { get; set; }
        
        [Required]
        [StringLength(100, MinimumLength = 6)]
        public string MatKhau { get; set; }
        
        public bool TrangThai { get; set; } = true;
        
        [Required]
        public int RoleID { get; set; }
        
        // ✅ Thêm thông tin khách hàng (dùng cho tạo tài khoản khách hàng)
        [StringLength(100)]
        public string HoTen { get; set; }
        
        [StringLength(15)]
        public string SoDienThoai { get; set; }
        
        [StringLength(200)]
        public string DiaChi { get; set; }
    }

    public class TaiKhoanUpdateDto
    {
        [Required]
        [StringLength(50)]
        public string TenDangNhap { get; set; }
        
        public bool TrangThai { get; set; }
        
        [Required]
        public int RoleID { get; set; }
    }

    public class TaiKhoanChangePasswordDto
    {
        [Required]
        public string MatKhauCu { get; set; }
        
        [Required]
        [StringLength(100, MinimumLength = 6)]
        public string MatKhauMoi { get; set; }
    }
}