using System.ComponentModel.DataAnnotations;

namespace BackendAPI.DTOs
{
    public class PhuongThucThanhToanDto
    {
        public int MaPTTT { get; set; }
        public string TenPhuongThuc { get; set; }
        public string MoTa { get; set; }
        public bool TrangThai { get; set; }
    }

    public class PhuongThucThanhToanCreateDto
    {
        [Required]
        [StringLength(100)]
        public string TenPhuongThuc { get; set; }
        
        public string MoTa { get; set; }
        
        public bool TrangThai { get; set; } = true;
    }

    public class PhuongThucThanhToanUpdateDto
    {
        [Required]
        public int MaPTTT { get; set; }
        
        [Required]
        [StringLength(100)]
        public string TenPhuongThuc { get; set; }
        
        public string MoTa { get; set; }
        
        public bool TrangThai { get; set; }
    }
}