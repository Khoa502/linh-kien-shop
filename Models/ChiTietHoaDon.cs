using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BackendAPI.Models
{
    [Table("ChiTietHoaDon")]
    public class ChiTietHoaDon
    {
        [Key]
        public int MaCTHD { get; set; }
        
        public int MaHD { get; set; }
        
        public int MaSP { get; set; }
        
        public int? SoLuong { get; set; }
        
        [Column(TypeName = "decimal(18,2)")]
        public decimal? DonGia { get; set; }
        
        [StringLength(200)]
        public string GhiChu { get; set; }
        
        // Navigation properties
        [ForeignKey("MaHD")]
        public virtual HoaDon HoaDon { get; set; }
        
        [ForeignKey("MaSP")]
        public virtual SanPham SanPham { get; set; }
    }
}
