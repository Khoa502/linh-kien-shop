using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BackendAPI.Models
{
    [Table("LichSuThanhToan")]
    public class LichSuThanhToan
    {
        [Key]
        public int ID { get; set; }
        
        public int? MaThanhToan { get; set; }
        
        [StringLength(20)]
        public string TrangThai { get; set; }
        
        public DateTime? ThoiGian { get; set; }
        
        public string GhiChu { get; set; }
        
        // Navigation properties
        [ForeignKey("MaThanhToan")]
        public virtual ThanhToan ThanhToan { get; set; }
    }
}