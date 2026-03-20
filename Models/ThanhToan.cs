using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BackendAPI.Models
{
    [Table("ThanhToan")]
    public class ThanhToan
    {
        [Key]
        public int MaThanhToan { get; set; }
        
        public int? MaHD { get; set; }
        
        public int? MaPTTT { get; set; }
        
        [Column(TypeName = "decimal(18,2)")]
        public decimal? SoTien { get; set; }
        
        [StringLength(100)]
        public string MaGiaoDich { get; set; }
        
        [StringLength(20)]
        public string TrangThai { get; set; }
        
        public DateTime? NgayThanhToan { get; set; }
        
        // Navigation properties
        [ForeignKey("MaHD")]
        public virtual HoaDon HoaDon { get; set; }
        
        [ForeignKey("MaPTTT")]
        public virtual PhuongThucThanhToan PhuongThucThanhToan { get; set; }
        public virtual ICollection<LichSuThanhToan> LichSuThanhToans { get; set; }
    }
}