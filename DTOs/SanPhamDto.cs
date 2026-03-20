using System.ComponentModel.DataAnnotations;

namespace BackendAPI.DTOs
{
   public class SanPhamDto
{
    public int MaSP { get; set; }

    public string MaLinhKien { get; set; } = string.Empty;

    public string TenSP { get; set; } = string.Empty;
    public double TrungBinhSao { get; set; }
    public string ThongSoKyThuat { get; set; } = string.Empty;

    public string DonViTinh { get; set; } = string.Empty;

    public decimal GiaNhap { get; set; }

    public decimal GiaBan { get; set; }

    public int SoLuongTon { get; set; }

    public string HinhAnh { get; set; } = string.Empty;

    public int MaLoai { get; set; }

    public string TenLoai { get; set; } = string.Empty;

    public int MaNCC { get; set; }

    public string TenNCC { get; set; } = string.Empty;
    
    public bool TrangThai { get; set; }
    
    public string MoTa { get; set; } = string.Empty;
    
    /// <summary>
    /// Thời hạn bảo hành (tháng)
    /// </summary>
    public int? ThoiHanBaoHanh { get; set; }
}
    public class SanPhamCreateDto
    {
        [StringLength(50)]
        public string MaLinhKien { get; set; }
        
        [Required]
        [StringLength(200)]
        public string TenSP { get; set; }
        
        public string ThongSoKyThuat { get; set; }
        
        [StringLength(20)]
        public string DonViTinh { get; set; }
        
        public decimal? GiaNhap { get; set; }
        
        public decimal? GiaBan { get; set; }
        
        public int? SoLuongTon { get; set; } = 0;
        
        public string HinhAnh { get; set; }
        
        public int? MaLoai { get; set; }
        
        public int? MaNCC { get; set; }
        
        public bool? TrangThai { get; set; } = true;
        
        public string MoTa { get; set; }
        
        /// <summary>
        /// Thời hạn bảo hành (tháng)
        /// </summary>
        public int? ThoiHanBaoHanh { get; set; }
    }
    
    public class SanPhamUpdateDto
    {
        [Required]
        public int MaSP { get; set; }
        
        [StringLength(50)]
        public string MaLinhKien { get; set; }
        
        [Required]
        [StringLength(200)]
        public string TenSP { get; set; }
        
        public string ThongSoKyThuat { get; set; }
        
        [StringLength(20)]
        public string DonViTinh { get; set; }
        
        public decimal? GiaNhap { get; set; }
        
        public decimal? GiaBan { get; set; }
        
        public int? SoLuongTon { get; set; }
        
        public string HinhAnh { get; set; }
        
        public int? MaLoai { get; set; }
        
        public int? MaNCC { get; set; }
        
        public bool? TrangThai { get; set; }
        
        public string MoTa { get; set; }
    }
}