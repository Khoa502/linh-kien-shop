using System.ComponentModel.DataAnnotations;

namespace BackendAPI.DTOs
{
    public class DanhMucDto
    {
        public int MaLoai { get; set; }
        public string TenLoai { get; set; }
        public string MoTa { get; set; }
    }

    public class DanhMucCreateDto
    {
        [Required]
        [StringLength(100)]
        public string TenLoai { get; set; }
        
        public string MoTa { get; set; }
    }

    public class DanhMucUpdateDto
    {
        [Required]
        public int MaLoai { get; set; }
        
        [Required]
        [StringLength(100)]
        public string TenLoai { get; set; }
        
        public string MoTa { get; set; }
    }
}