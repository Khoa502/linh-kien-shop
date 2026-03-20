using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BackendAPI.Models
{
    [Table("TaiKhoan")]
    public class TaiKhoan
    {
[Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ID { get; set; } 
        
        [Required]
        [StringLength(50)]
        public string TenDangNhap { get; set; }
        
        [StringLength(100)]
        public string Email { get; set; }
        
        [Required]
        public string MatKhau { get; set; }
        
        public bool TrangThai { get; set; }
        
        public DateTime NgayTao { get; set; }
        
        [ForeignKey("PhanQuyen")]
        public int RoleID { get; set; }
        
        // Navigation properties
        public virtual PhanQuyen PhanQuyen { get; set; }
        public virtual ICollection<LichSuDangNhap> LichSuDangNhaps { get; set; }
        public virtual NhanVien NhanVien { get; set; }
        public virtual KhachHang KhachHang { get; set; }
    }
}