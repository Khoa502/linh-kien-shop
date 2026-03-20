using System.ComponentModel.DataAnnotations;

namespace BackendAPI.DTOs
{
    public class PhanQuyenDto
    {
        public int ID { get; set; }
        public string TenQuyen { get; set; }
    }

    public class PhanQuyenCreateDto
    {
        [Required]
        [StringLength(50)]
        public string TenQuyen { get; set; }
    }

    public class PhanQuyenUpdateDto
    {
        [Required]
        public int ID { get; set; }
        
        [Required]
        [StringLength(50)]
        public string TenQuyen { get; set; }
    }
}