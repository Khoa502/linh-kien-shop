using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BackendAPI.Models
{
    [Table("SanPham")]
    public class SanPham
    {
        [Key]
        public int MaSP { get; set; }
        
        [StringLength(50)]
        public string MaLinhKien { get; set; }
        
        [Required]
        [StringLength(200)]
        public string TenSP { get; set; }
        
        public string ThongSoKyThuat { get; set; }
        
        [StringLength(20)]
        public string DonViTinh { get; set; }
        
        [Column(TypeName = "decimal(18,2)")]
        public decimal? GiaNhap { get; set; }
        
        [Column(TypeName = "decimal(18,2)")]
        public decimal? GiaBan { get; set; }
        
        public int? SoLuongTon { get; set; }
        
        public string HinhAnh { get; set; }
        
        public int? MaLoai { get; set; }
        
        public int? MaNCC { get; set; }
        
        public bool? TrangThai { get; set; }
        
        // LoaiLinhKien: cpu, mainboard, ram, gpu, ssd, psu, case
        [StringLength(50)]
        public string LoaiLinhKien { get; set; }
        
        public string MoTa { get; set; }
        
        /// <summary>
        /// Thời hạn bảo hành (tháng)
        /// </summary>
        public int? ThoiHanBaoHanh { get; set; }
        
        // Navigation properties
        [ForeignKey("MaLoai")]
        public virtual DanhMuc DanhMuc { get; set; }
        
        [ForeignKey("MaNCC")]
        public virtual NhaCungCap NhaCungCap { get; set; }
        public virtual ICollection<ChiTietHoaDon> ChiTietHoaDons { get; set; }
        public virtual ICollection<ChiTietPhieuNhap> ChiTietPhieuNhaps { get; set; }
        public virtual ICollection<BaoHanh> BaoHanhs { get; set; }
        public virtual ICollection<DanhGiaSanPham> DanhGiaSanPhams { get; set; }
    }
}