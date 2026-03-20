using System.ComponentModel.DataAnnotations;

namespace BackendAPI.DTOs
{
    public class ChatTinNhanDto
    {
        public int ID { get; set; }
        public int? ChatID { get; set; }
        public string NguoiGui { get; set; }
        public string NoiDung { get; set; }
        public DateTime? ThoiGian { get; set; }
    }

    public class ChatTinNhanCreateDto
    {
        [Required]
        public int? ChatID { get; set; }
        
        [Required]
        [StringLength(50)]
        public string NguoiGui { get; set; }
        
        [Required]
        public string NoiDung { get; set; }
        
        public DateTime? ThoiGian { get; set; } = DateTime.Now;
    }
}