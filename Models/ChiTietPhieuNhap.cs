using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BackendAPI.Models
{
    [Table("ChiTietPhieuNhap")]
    public class ChiTietPhieuNhap
    {
        [Key]
        public int MaCTPN { get; set; }
        
        public int MaPN { get; set; }
        
        public int MaSP { get; set; }
        
        public int? SoLuong { get; set; }
        
        [Column(TypeName = "decimal(18,2)")]
        public decimal? DonGiaNhap { get; set; }
        
        // ✅ NotMapped: Database không có cột này, tính toán từ code khi cần
        [NotMapped]
        public decimal? ThanhTien { get; set; }
        
        // Navigation properties
        [ForeignKey("MaPN")]
        public virtual PhieuNhap PhieuNhap { get; set; }
        
        [ForeignKey("MaSP")]
        public virtual SanPham SanPham { get; set; }
    }
}
