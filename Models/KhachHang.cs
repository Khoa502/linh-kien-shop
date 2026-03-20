using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BackendAPI.Models
{
    [Table("KhachHang")]
    public class KhachHang
    {
        [Key]
        public int MaKH { get; set; }
        
        [Required]
        [StringLength(100)]
        public string HoTen { get; set; }
        
        [StringLength(15)]
        public string SoDienThoai { get; set; }
        
        [StringLength(200)]
        public string DiaChi { get; set; }
        
        public int? DiemTichLuy { get; set; }
        
        [Column(TypeName = "decimal(18,2)")]
        public decimal? TongNo { get; set; }
        
        public int? TaiKhoanID { get; set; }
        
        // Navigation properties
        [ForeignKey("TaiKhoanID")]
        public virtual TaiKhoan TaiKhoan { get; set; }
        public virtual ICollection<HoaDon> HoaDons { get; set; }
        public virtual ICollection<DanhGiaSanPham> DanhGiaSanPhams { get; set; }
        public virtual ICollection<ChatHoiThoai> ChatHoiThoais { get; set; }
    }
}
