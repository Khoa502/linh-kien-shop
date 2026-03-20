using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BackendAPI.Models
{
    [Table("HoaDon")]
    public class HoaDon
    {
        [Key]
        public int MaHD { get; set; }
        
        [StringLength(50)]
        public string MaHoaDon { get; set; }
        
        public DateTime? NgayBan { get; set; }
        
        public int? MaNV { get; set; }
        
        public int? MaKH { get; set; }
        
        [Column(TypeName = "decimal(18,2)")]
        public decimal? TongTien { get; set; }
        
        [Column(TypeName = "decimal(18,2)")]
        public decimal? GiamGia { get; set; }
        
        [Column(TypeName = "decimal(18,2)")]
        public decimal? ThanhTien { get; set; }
        
        [StringLength(50)]
        public string HinhThucThanhToan { get; set; }
        
        [StringLength(20)]
        public string TrangThai { get; set; }
        
        public string GhiChu { get; set; }
        
        // Navigation properties
        [ForeignKey("MaNV")]
        public virtual NhanVien NhanVien { get; set; }
        
        [ForeignKey("MaKH")]
        public virtual KhachHang KhachHang { get; set; }
        public virtual ICollection<ChiTietHoaDon> ChiTietHoaDons { get; set; }
        public virtual ICollection<ThanhToan> ThanhToans { get; set; }
        public virtual ICollection<BaoHanh> BaoHanhs { get; set; }
    }
}
