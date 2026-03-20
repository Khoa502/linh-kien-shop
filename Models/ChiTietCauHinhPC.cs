using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BackendAPI.Models
{
    [Table("ChiTietCauHinhPC")]
    public class ChiTietCauHinhPC
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        public int CauHinhPCId { get; set; }

        public int SanPhamId { get; set; }

        [Required]
        [StringLength(100)]
        public string LoaiLinhKien { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal Gia { get; set; }

        public int SoLuong { get; set; } = 1;

        // Navigation properties
        [ForeignKey("CauHinhPCId")]
        public virtual CauHinhPC CauHinhPC { get; set; }

        [ForeignKey("SanPhamId")]
        public virtual SanPham SanPham { get; set; }
    }
}

