using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BackendAPI.Models
{
    [Table("PhuongThucThanhToan")]
    public class PhuongThucThanhToan
    {
        [Key]
        public int MaPTTT { get; set; }
        
        [Required]
        [StringLength(100)]
        public string TenPhuongThuc { get; set; }
        
        public string MoTa { get; set; }
        
        public bool TrangThai { get; set; }
        
        // Navigation properties
        public virtual ICollection<ThanhToan> ThanhToans { get; set; }
    }
}