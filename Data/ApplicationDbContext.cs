using Microsoft.EntityFrameworkCore;
using BackendAPI.Models;

namespace BackendAPI.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }
        
        public DbSet<TaiKhoan> TaiKhoans { get; set; }
        public DbSet<PhanQuyen> PhanQuyens { get; set; }
        public DbSet<LichSuDangNhap> LichSuDangNhaps { get; set; }
        public DbSet<KhachHang> KhachHangs { get; set; }
        public DbSet<NhanVien> NhanViens { get; set; }
        public DbSet<SanPham> SanPhams { get; set; }
        public DbSet<DanhMuc> DanhMucs { get; set; }
        public DbSet<HoaDon> HoaDons { get; set; }
        public DbSet<ChiTietHoaDon> ChiTietHoaDons { get; set; }
        public DbSet<BaoHanh> BaoHanhs { get; set; }
        public DbSet<ThanhToan> ThanhToans { get; set; }
        public DbSet<LichSuThanhToan> LichSuThanhToans { get; set; }
        public DbSet<PhuongThucThanhToan> PhuongThucThanhToans { get; set; }
        public DbSet<PhieuNhap> PhieuNhaps { get; set; }
        public DbSet<ChiTietPhieuNhap> ChiTietPhieuNhaps { get; set; }
        public DbSet<NhaCungCap> NhaCungCaps { get; set; }
        public DbSet<DanhGiaSanPham> DanhGiaSanPhams { get; set; }
        public DbSet<ChatHoiThoai> ChatHoiThoais { get; set; }
        public DbSet<ChatTinNhan> ChatTinNhans { get; set; }
        public DbSet<CauHinhPC> CauHinhPCs { get; set; }
        public DbSet<ChiTietCauHinhPC> ChiTietCauHinhPCs { get; set; }
        public DbSet<GioHang> GioHangs { get; set; }
        public DbSet<GioHangChiTiet> GioHangChiTiets { get; set; }
        
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // TaiKhoan - PhanQuyen relationship
            modelBuilder.Entity<TaiKhoan>()
                .HasOne(t => t.PhanQuyen)
                .WithMany(p => p.TaiKhoans)
                .HasForeignKey(t => t.RoleID)
                .OnDelete(DeleteBehavior.Restrict);

            // LichSuDangNhap - TaiKhoan relationship\n            modelBuilder.Entity<LichSuDangNhap>()\n                .Property(l => l.TenDangNhap).HasMaxLength(50)\n                .Property(l => l.Browser).HasMaxLength(50)\n                .Property(l => l.OS).HasMaxLength(50)\n                .Property(l => l.Device).HasMaxLength(100);\n            modelBuilder.Entity<LichSuDangNhap>()\n                .HasOne(l => l.TaiKhoan)\n                .WithMany(t => t.LichSuDangNhaps)\n                .HasForeignKey(l => l.TaiKhoanID)\n                .OnDelete(DeleteBehavior.Cascade);

            // NhanVien - TaiKhoan relationship (one-to-one)
            modelBuilder.Entity<NhanVien>()
                .HasOne(n => n.TaiKhoan)
                .WithOne(t => t.NhanVien)
                .HasForeignKey<NhanVien>(n => n.TaiKhoanID)
                .OnDelete(DeleteBehavior.Restrict);

            // KhachHang - TaiKhoan relationship (one-to-one)
            modelBuilder.Entity<KhachHang>()
                .HasOne(k => k.TaiKhoan)
                .WithOne(t => t.KhachHang)
                .HasForeignKey<KhachHang>(k => k.TaiKhoanID)
                .OnDelete(DeleteBehavior.Restrict);

            // HoaDon relationships
            modelBuilder.Entity<HoaDon>()
                .HasOne(h => h.NhanVien)
                .WithMany(n => n.HoaDons)
                .HasForeignKey(h => h.MaNV)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<HoaDon>()
                .HasOne(h => h.KhachHang)
                .WithMany(k => k.HoaDons)
                .HasForeignKey(h => h.MaKH)
                .OnDelete(DeleteBehavior.Restrict);

            // ChiTietHoaDon relationships
            modelBuilder.Entity<ChiTietHoaDon>()
                .HasOne(c => c.HoaDon)
                .WithMany(h => h.ChiTietHoaDons)
                .HasForeignKey(c => c.MaHD)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ChiTietHoaDon>()
                .HasOne(c => c.SanPham)
                .WithMany(s => s.ChiTietHoaDons)
                .HasForeignKey(c => c.MaSP)
                .OnDelete(DeleteBehavior.Restrict);

            // BaoHanh relationships
            modelBuilder.Entity<BaoHanh>()
                .HasOne(b => b.HoaDon)
                .WithMany(h => h.BaoHanhs)
                .HasForeignKey(b => b.MaHD)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<BaoHanh>()
                .HasOne(b => b.SanPham)
                .WithMany(s => s.BaoHanhs)
                .HasForeignKey(b => b.MaSP)
                .OnDelete(DeleteBehavior.Restrict);

            // ThanhToan relationships
            modelBuilder.Entity<ThanhToan>()
                .HasOne(t => t.HoaDon)
                .WithMany(h => h.ThanhToans)
                .HasForeignKey(t => t.MaHD)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ThanhToan>()
                .HasOne(t => t.PhuongThucThanhToan)
                .WithMany(p => p.ThanhToans)
                .HasForeignKey(t => t.MaPTTT)
                .OnDelete(DeleteBehavior.Restrict);

            // LichSuThanhToan relationships
            modelBuilder.Entity<LichSuThanhToan>()
                .HasOne(l => l.ThanhToan)
                .WithMany(t => t.LichSuThanhToans)
                .HasForeignKey(l => l.MaThanhToan)
                .OnDelete(DeleteBehavior.Cascade);

            // SanPham relationships
            modelBuilder.Entity<SanPham>()
                .HasOne(s => s.DanhMuc)
                .WithMany(d => d.SanPhams)
                .HasForeignKey(s => s.MaLoai)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<SanPham>()
                .HasOne(s => s.NhaCungCap)
                .WithMany(n => n.SanPhams)
                .HasForeignKey(s => s.MaNCC)
                .OnDelete(DeleteBehavior.Restrict);

            // PhieuNhap relationships
            modelBuilder.Entity<PhieuNhap>()
                .HasOne(p => p.NhanVien)
                .WithMany(n => n.PhieuNhaps)
                .HasForeignKey(p => p.MaNV)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<PhieuNhap>()
                .HasOne(p => p.NhaCungCap)
                .WithMany(n => n.PhieuNhaps)
                .HasForeignKey(p => p.MaNCC)
                .OnDelete(DeleteBehavior.Restrict);

            // ChiTietPhieuNhap relationships
            modelBuilder.Entity<ChiTietPhieuNhap>()
                .HasOne(c => c.PhieuNhap)
                .WithMany(p => p.ChiTietPhieuNhaps)
                .HasForeignKey(c => c.MaPN)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ChiTietPhieuNhap>()
                .HasOne(c => c.SanPham)
                .WithMany(s => s.ChiTietPhieuNhaps)
                .HasForeignKey(c => c.MaSP)
                .OnDelete(DeleteBehavior.Restrict);

            // DanhGiaSanPham relationships
            modelBuilder.Entity<DanhGiaSanPham>()
                .HasOne(d => d.SanPham)
                .WithMany(s => s.DanhGiaSanPhams)
                .HasForeignKey(d => d.MaSP)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<DanhGiaSanPham>()
                .HasOne(d => d.KhachHang)
                .WithMany(k => k.DanhGiaSanPhams)
                .HasForeignKey(d => d.MaKH)
                .OnDelete(DeleteBehavior.Restrict);

            // ChatHoiThoai relationships
            modelBuilder.Entity<ChatHoiThoai>()
                .HasOne(c => c.KhachHang)
                .WithMany(k => k.ChatHoiThoais)
                .HasForeignKey(c => c.MaKH)
                .OnDelete(DeleteBehavior.Cascade);

            // ChatTinNhan relationships
            modelBuilder.Entity<ChatTinNhan>()
                .HasOne(c => c.ChatHoiThoai)
                .WithMany(ch => ch.ChatTinNhans)
                .HasForeignKey(c => c.ChatID)
                .OnDelete(DeleteBehavior.Cascade);

            // CauHinhPC relationships
            modelBuilder.Entity<CauHinhPC>()
                .HasOne(c => c.KhachHang)
                .WithMany()
                .HasForeignKey(c => c.MaKH)
                .OnDelete(DeleteBehavior.Restrict);

            // ChiTietCauHinhPC relationships
            modelBuilder.Entity<ChiTietCauHinhPC>()
                .HasOne(ct => ct.CauHinhPC)
                .WithMany(c => c.ChiTietCauHinhPCs)
                .HasForeignKey(ct => ct.CauHinhPCId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ChiTietCauHinhPC>()
                .HasOne(ct => ct.SanPham)
                .WithMany()
                .HasForeignKey(ct => ct.SanPhamId)
                .OnDelete(DeleteBehavior.Restrict);

            // GioHang relationships
            modelBuilder.Entity<GioHang>()
                .HasOne(g => g.KhachHang)
                .WithMany()
                .HasForeignKey(g => g.MaKH)
                .OnDelete(DeleteBehavior.Restrict);

            // GioHangChiTiet relationships
            modelBuilder.Entity<GioHangChiTiet>()
                .HasOne(ct => ct.GioHang)
                .WithMany(g => g.GioHangChiTiets)
                .HasForeignKey(ct => ct.GioHangId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<GioHangChiTiet>()
                .HasOne(ct => ct.SanPham)
                .WithMany()
                .HasForeignKey(ct => ct.SanPhamId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
