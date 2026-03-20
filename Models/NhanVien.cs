using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BackendAPI.Models
{
    [Table("NhanVien")]
    public class NhanVien
    {
        [Key]
        public int MaNV { get; set; }
        
        [Required]
        [StringLength(100)]
        public string HoTen { get; set; }
        
        [StringLength(50)]
        public string Quyen { get; set; }
        
        [StringLength(15)]
        public string SoDienThoai { get; set; }
        
        public bool TrangThai { get; set; }
        
        public int? TaiKhoanID { get; set; }
        
        // Navigation properties
[ForeignKey("TaiKhoanID")]
        public virtual TaiKhoan TaiKhoan { get; set; }
        public virtual ICollection<HoaDon> HoaDons { get; set; }
        public virtual ICollection<PhieuNhap> PhieuNhaps { get; set; }
    }
}
