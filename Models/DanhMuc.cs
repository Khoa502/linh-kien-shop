using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BackendAPI.Models
{
    [Table("DanhMuc")]
    public class DanhMuc
    {
        [Key]
        public int MaLoai { get; set; }
        
        [Required]
        [StringLength(100)]
        public string TenLoai { get; set; }
        
        public string MoTa { get; set; }
        
        // Navigation properties
        public virtual ICollection<SanPham> SanPhams { get; set; }
    }
}