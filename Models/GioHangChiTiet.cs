using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BackendAPI.Models
{
    [Table("GioHangChiTiet")]
    public class GioHangChiTiet
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        public int GioHangId { get; set; }

        public int SanPhamId { get; set; }

        public int SoLuong { get; set; } = 1;

        [Column(TypeName = "decimal(18,2)")]
        public decimal DonGia { get; set; }

        // Navigation properties
        [ForeignKey("GioHangId")]
        public virtual GioHang GioHang { get; set; }

        [ForeignKey("SanPhamId")]
        public virtual SanPham SanPham { get; set; }
    }
}

