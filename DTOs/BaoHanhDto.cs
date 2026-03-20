using System.ComponentModel.DataAnnotations;

namespace BackendAPI.DTOs
{
    public class BaoHanhDto
    {
        public int MaBH { get; set; }
        public int? MaHD { get; set; }
        public string MaHoaDon { get; set; }
        public int? MaSP { get; set; }
        public string TenSP { get; set; }
        public string SoSerial { get; set; }
         public int? ThoiHanBaoHanh { get; set; }
        public DateTime? NgayBatDau { get; set; }
        public DateTime? NgayKetThuc { get; set; }
        public string DiaChiBaoHanh { get; set; }
        public string TrangThai { get; set; }
    }

    public class BaoHanhCreateDto
    {
        [Required]
        public int? MaHD { get; set; }
        
        [Required]
        public int? MaSP { get; set; }
        
        [StringLength(50)]
        public string SoSerial { get; set; }
        
        public int? ThoiHanBaoHanh { get; set; }
        
        public DateTime? NgayBatDau { get; set; } = DateTime.Now;
        
        public DateTime? NgayKetThuc { get; set; }
        
        public string DiaChiBaoHanh { get; set; }
        
        [StringLength(20)]
        public string TrangThai { get; set; } = "Đang bảo hành";
    }

    public class BaoHanhUpdateDto
    {
        [Required]
        public int MaBH { get; set; }
        
        public string SoSerial { get; set; }
        public int? ThoiHanBaoHanh { get; set; }
        public DateTime? NgayBatDau { get; set; }
        public DateTime? NgayKetThuc { get; set; }
        
        public string DiaChiBaoHanh { get; set; }
        
        [StringLength(20)]
        public string TrangThai { get; set; }
    }
}