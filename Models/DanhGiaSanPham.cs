using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BackendAPI.Models
{
    [Table("DanhGiaSanPham")]
    public class DanhGiaSanPham
    {
        [Key]
        public int ID { get; set; }
        
        public int? MaSP { get; set; }
        
        public int? MaKH { get; set; }
        
        public int? SoSao { get; set; }
        
        public string NoiDung { get; set; }
        
        public DateTime? NgayDanhGia { get; set; }
        
        // Navigation properties
        [ForeignKey("MaSP")]
        public virtual SanPham SanPham { get; set; }
        
        [ForeignKey("MaKH")]
        public virtual KhachHang KhachHang { get; set; }
    }
}