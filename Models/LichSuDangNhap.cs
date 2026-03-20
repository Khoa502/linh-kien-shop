using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BackendAPI.Models
{
[Table("LichSuDangNhap")]
    public class LichSuDangNhap
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ID { get; set; }
        
        public int TaiKhoanID { get; set; }
        
        [StringLength(50)]
        public string TenDangNhap { get; set; }
        
        public DateTime ThoiGian { get; set; }
        
        [StringLength(50)]
        public string DiaChiIP { get; set; }
        
        [StringLength(500)]
        public string ThietBi { get; set; }
        
        [StringLength(50)]
        public string Browser { get; set; }
        
        [StringLength(50)]
        public string OS { get; set; }
        
        [StringLength(100)]
        public string Device { get; set; }
        
        [StringLength(20)]
        public string TrangThai { get; set; }
        
        // Navigation properties
        [ForeignKey("TaiKhoanID")]
        public virtual TaiKhoan TaiKhoan { get; set; }
    }
}
