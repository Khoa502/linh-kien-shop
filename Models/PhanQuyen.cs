using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BackendAPI.Models
{
    [Table("PhanQuyen")]
    public class PhanQuyen
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ID { get; set; }
        
        [Required]
        [StringLength(50)]
        public string TenQuyen { get; set; }
        
        // Navigation properties
        public virtual ICollection<TaiKhoan> TaiKhoans { get; set; }
    }
}