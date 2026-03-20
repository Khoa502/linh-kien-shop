using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BackendAPI.Models
{
    [Table("ChatTinNhan")]
    public class ChatTinNhan
    {
        [Key]
        public int ID { get; set; }
        
        public int? ChatID { get; set; }
        
        [StringLength(50)]
        public string NguoiGui { get; set; }
        
        public string NoiDung { get; set; }
        
        public DateTime? ThoiGian { get; set; }
        
        // Navigation properties
        [ForeignKey("ChatID")]
        public virtual ChatHoiThoai ChatHoiThoai { get; set; }
    }
}