using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BackendAPI.Models
{
    [Table("BaoHanh")]
    public class BaoHanh
    {
        [Key]
        public int MaBH { get; set; }

        public int? MaHD { get; set; }

        public int? MaSP { get; set; }

        [StringLength(50)]
        public string SoSerial { get; set; }

        
        public int? ThoiHanBaoHanh { get; set; }

        public DateTime? NgayBatDau { get; set; }

        public DateTime? NgayKetThuc { get; set; }

        public string DiaChiBaoHanh { get; set; } = string.Empty;

        [StringLength(20)]
        public string TrangThai { get; set; }



        // Navigation
        [ForeignKey("MaHD")]
        public virtual HoaDon HoaDon { get; set; }

        [ForeignKey("MaSP")]
        public virtual SanPham SanPham { get; set; }
    }
}