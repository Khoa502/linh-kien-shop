using System.ComponentModel.DataAnnotations;

namespace BackendAPI.DTOs
{
    public class NhanVienDto
    {
        public int MaNV { get; set; }
        public string HoTen { get; set; }
        public string Quyen { get; set; }
        public string SoDienThoai { get; set; }
        public bool TrangThai { get; set; }
        public int? TaiKhoanID { get; set; }
        public string TenDangNhap { get; set; }
    }

    public class NhanVienCreateDto
    {
        [Required]
        [StringLength(100)]
        public string HoTen { get; set; }
        
        [StringLength(50)]
        public string Quyen { get; set; }
        
        [StringLength(15)]
        public string SoDienThoai { get; set; }
        
        public bool TrangThai { get; set; } = true;
        
        public int? TaiKhoanID { get; set; }
    }

    public class NhanVienUpdateDto
    {
        [Required]
        public int MaNV { get; set; }
        
        [Required]
        [StringLength(100)]
        public string HoTen { get; set; }
        
        [StringLength(50)]
        public string Quyen { get; set; }
        
        [StringLength(15)]
        public string SoDienThoai { get; set; }
        
        public bool TrangThai { get; set; }
    }
}