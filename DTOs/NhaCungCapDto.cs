using System.ComponentModel.DataAnnotations;

namespace BackendAPI.DTOs
{
    public class NhaCungCapDto
    {
        public int MaNCC { get; set; }
        public string TenNCC { get; set; }
        public string DiaChi { get; set; }
        public string SDT { get; set; }
        public bool TrangThai { get; set; }
    }

    public class NhaCungCapCreateDto
    {
        [Required]
        [StringLength(200)]
        public string TenNCC { get; set; }
        
        [StringLength(200)]
        public string DiaChi { get; set; }
        
        [StringLength(15)]
        public string SDT { get; set; }
        
        public bool TrangThai { get; set; } = true;
    }

    public class NhaCungCapUpdateDto
    {
        [Required]
        public int MaNCC { get; set; }
        
        [Required]
        [StringLength(200)]
        public string TenNCC { get; set; }
        
        [StringLength(200)]
        public string DiaChi { get; set; }
        
        [StringLength(15)]
        public string SDT { get; set; }
        
        public bool TrangThai { get; set; }
    }
}