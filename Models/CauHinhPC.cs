using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BackendAPI.Models
{
    [Table("CauHinhPC")]
    public class CauHinhPC
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        [StringLength(200)]
        public string TenCauHinh { get; set; }

        public int? MaKH { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal TongTien { get; set; }

        public DateTime NgayTao { get; set; } = DateTime.Now;

        // Navigation properties
        [ForeignKey("MaKH")]
        public virtual KhachHang KhachHang { get; set; }

        public virtual ICollection<ChiTietCauHinhPC> ChiTietCauHinhPCs { get; set; }
    }
}

