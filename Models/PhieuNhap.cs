using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BackendAPI.Models
{
    [Table("PhieuNhap")]
    public class PhieuNhap
    {
        [Key]
        public int MaPN { get; set; }
        
        [StringLength(50)]
        public string MaPhieuNhap { get; set; } // ✅ Thêm mã phiếu nhập unique
        
        public int? MaNV { get; set; }
        
        public int? MaNCC { get; set; }
        
        public DateTime? NgayNhap { get; set; }
        
        [Column(TypeName = "decimal(18,2)")]
        public decimal? TongTien { get; set; }
        
        public string GhiChu { get; set; }
        
        // Navigation properties
        [ForeignKey("MaNV")]
        public virtual NhanVien NhanVien { get; set; }
        
        [ForeignKey("MaNCC")]
        public virtual NhaCungCap NhaCungCap { get; set; }
        public virtual ICollection<ChiTietPhieuNhap> ChiTietPhieuNhaps { get; set; }
    }
}
