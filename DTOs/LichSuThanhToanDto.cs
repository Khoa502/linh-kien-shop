namespace BackendAPI.DTOs
{
    public class LichSuThanhToanDto
    {
        public int ID { get; set; }
        public int? MaThanhToan { get; set; }
        public string TrangThai { get; set; }
        public DateTime? ThoiGian { get; set; }
        public string GhiChu { get; set; }
    }

    public class LichSuThanhToanCreateDto
    {
        public int? MaThanhToan { get; set; }
        public string TrangThai { get; set; }
        public string GhiChu { get; set; }
    }
}