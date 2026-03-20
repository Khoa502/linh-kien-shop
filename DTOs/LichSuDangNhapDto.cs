namespace BackendAPI.DTOs
{
    public class LichSuDangNhapDto
    {
        public int Id { get; set; }
        public string TenDangNhap { get; set; }
        public DateTime ThoiGian { get; set; }
        public string DiaChiIP { get; set; }
        public string ThietBi { get; set; }
        public string Browser { get; set; }
        public string OS { get; set; }
        public string Device { get; set; }
        public string TrangThai { get; set; }
    }

    public class LichSuDangNhapCreateDto
    {
        public int TaiKhoanID { get; set; }
        public string DiaChiIP { get; set; }
        public string TrangThai { get; set; }
    }
}
