using System.ComponentModel.DataAnnotations;

namespace BackendAPI.DTOs
{
    public class ChatHoiThoaiDto
    {
        public int ID { get; set; }
        public int? MaKH { get; set; }
        public string TenKH { get; set; }
        public DateTime? NgayBatDau { get; set; }
        public string TrangThai { get; set; }
        public int SoTinNhan { get; set; }
    }

    public class ChatHoiThoaiCreateDto
    {
        [Required]
        public int? MaKH { get; set; }
        
        public DateTime? NgayBatDau { get; set; } = DateTime.Now;
        
        [StringLength(20)]
        public string TrangThai { get; set; } = "Đang hoạt động";
    }

    public class ChatHoiThoaiUpdateDto
    {
        [Required]
        public int ID { get; set; }
        
        [StringLength(20)]
        public string TrangThai { get; set; }
    }
}