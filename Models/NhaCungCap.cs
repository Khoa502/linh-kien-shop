using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BackendAPI.Models
{
    [Table("NhaCungCap")]
    public class NhaCungCap
    {
        [Key]
        public int MaNCC { get; set; }
        
        [Required]
        [StringLength(200)]
        public string TenNCC { get; set; }
        
        [StringLength(200)]
        public string DiaChi { get; set; }
        
        [StringLength(15)]
        public string SDT { get; set; }
        
        public bool TrangThai { get; set; }
        
        // Navigation properties
        public virtual ICollection<SanPham> SanPhams { get; set; }
        public virtual ICollection<PhieuNhap> PhieuNhaps { get; set; }
    }
}