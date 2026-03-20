using System.ComponentModel.DataAnnotations;

namespace BackendAPI.DTOs
{
    public class DanhGiaSanPhamDto
    {
        public int ID { get; set; }
        public int? MaSP { get; set; }
        public string TenSP { get; set; }
        public int? MaKH { get; set; }
        public string TenKH { get; set; }
        public int? SoSao { get; set; }
        public string NoiDung { get; set; }
        public DateTime? NgayDanhGia { get; set; }
    }

    public class DanhGiaSanPhamCreateDto
    {
        [Required]
        public int? MaSP { get; set; }
        
        [Required]
        public int? MaKH { get; set; }
        
        [Required]
        [Range(1, 5)]
        public int? SoSao { get; set; }
        
        public string NoiDung { get; set; }
        
        public DateTime? NgayDanhGia { get; set; } = DateTime.Now;
    }

    public class DanhGiaSanPhamUpdateDto
    {
        [Required]
        public int ID { get; set; }
        
        [Range(1, 5)]
        public int? SoSao { get; set; }
        
        public string NoiDung { get; set; }
    }
}