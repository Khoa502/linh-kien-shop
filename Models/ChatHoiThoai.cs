using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BackendAPI.Models
{
   [Table("ChatHoiThoai")]
public class ChatHoiThoai
{
    [Key]
    public int ID { get; set; }

    public int? MaKH { get; set; }

    public DateTime? NgayBatDau { get; set; }

    [StringLength(20)]
    public string TrangThai { get; set; } = string.Empty;

    [ForeignKey("MaKH")]
    public virtual KhachHang KhachHang { get; set; }

    public virtual ICollection<ChatTinNhan> ChatTinNhans { get; set; } 
        = new List<ChatTinNhan>();
}
}