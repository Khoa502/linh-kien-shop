using AutoMapper;
using BackendAPI.Models;
using BackendAPI.DTOs;

namespace BackendAPI.Mappings
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // TaiKhoan mappings
            CreateMap<TaiKhoan, TaiKhoanDto>()
                .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.Email))
                .ForMember(dest => dest.TenQuyen, opt => opt.MapFrom(src => src.PhanQuyen != null ? src.PhanQuyen.TenQuyen : ""));
            CreateMap<TaiKhoanCreateDto, TaiKhoan>();
            CreateMap<TaiKhoanUpdateDto, TaiKhoan>();

            // PhanQuyen mappings
            CreateMap<PhanQuyen, PhanQuyenDto>();
            CreateMap<PhanQuyenCreateDto, PhanQuyen>();
            CreateMap<PhanQuyenUpdateDto, PhanQuyen>();

            // LichSuDangNhap mappings
            CreateMap<LichSuDangNhap, LichSuDangNhapDto>()
                .ForMember(dest => dest.TenDangNhap, opt => opt.MapFrom(src => src.TaiKhoan != null ? src.TaiKhoan.TenDangNhap : string.Empty))
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.ID))
                .ForMember(dest => dest.Browser, opt => opt.MapFrom(src => src.Browser))
                .ForMember(dest => dest.OS, opt => opt.MapFrom(src => src.OS))
                .ForMember(dest => dest.Device, opt => opt.MapFrom(src => src.Device));
            CreateMap<LichSuDangNhapCreateDto, LichSuDangNhap>();

            // KhachHang mappings
            CreateMap<KhachHang, KhachHangDto>()
                .ForMember(dest => dest.TenDangNhap, opt => opt.MapFrom(src => src.TaiKhoan != null ? src.TaiKhoan.TenDangNhap : ""));
            CreateMap<KhachHangCreateDto, KhachHang>();
            CreateMap<KhachHangUpdateDto, KhachHang>();

            // NhanVien mappings
            CreateMap<NhanVien, NhanVienDto>()
                .ForMember(dest => dest.TenDangNhap, opt => opt.MapFrom(src => src.TaiKhoan != null ? src.TaiKhoan.TenDangNhap : ""));
            CreateMap<NhanVienCreateDto, NhanVien>();
            CreateMap<NhanVienUpdateDto, NhanVien>();

            // SanPham mappings
            CreateMap<SanPham, SanPhamDto>()
                .ForMember(dest => dest.ThongSoKyThuat, opt => opt.MapFrom(src => src.ThongSoKyThuat ?? ""))
                .ForMember(dest => dest.MoTa, opt => opt.MapFrom(src => src.MoTa ?? ""))
                .ForMember(dest => dest.ThoiHanBaoHanh, opt => opt.MapFrom(src => src.ThoiHanBaoHanh ?? 0))
                .ForMember(dest => dest.MaLinhKien, opt => opt.MapFrom(src => src.MaLinhKien ?? ""))
                .ForMember(dest => dest.DonViTinh, opt => opt.MapFrom(src => src.DonViTinh ?? ""))
                .ForMember(dest => dest.HinhAnh, opt => opt.MapFrom(src => src.HinhAnh ?? ""))
                .ForMember(dest => dest.TenLoai, opt => opt.MapFrom(src => src.DanhMuc != null ? src.DanhMuc.TenLoai : ""))
                .ForMember(dest => dest.TenNCC, opt => opt.MapFrom(src => src.NhaCungCap != null ? src.NhaCungCap.TenNCC : ""))
                .ForMember(dest => dest.GiaNhap, opt => opt.MapFrom(src => src.GiaNhap ?? 0))
                .ForMember(dest => dest.GiaBan, opt => opt.MapFrom(src => src.GiaBan ?? 0))
                .ForMember(dest => dest.SoLuongTon, opt => opt.MapFrom(src => src.SoLuongTon ?? 0))
                .ForMember(dest => dest.MaLoai, opt => opt.MapFrom(src => src.MaLoai ?? 0))
                .ForMember(dest => dest.MaNCC, opt => opt.MapFrom(src => src.MaNCC ?? 0))
                .ForMember(dest => dest.TrangThai, opt => opt.MapFrom(src => src.TrangThai ?? false));

            // SanPham Create/Update mappings
            CreateMap<SanPhamCreateDto, SanPham>()
                .ForMember(dest => dest.ThongSoKyThuat, opt => opt.MapFrom(src => src.ThongSoKyThuat ?? ""))
                .ForMember(dest => dest.MoTa, opt => opt.MapFrom(src => src.MoTa ?? ""))
                .ForMember(dest => dest.ThoiHanBaoHanh, opt => opt.MapFrom(src => src.ThoiHanBaoHanh))
                .ForMember(dest => dest.MaLinhKien, opt => opt.MapFrom(src => src.MaLinhKien ?? ""))
                .ForMember(dest => dest.DonViTinh, opt => opt.MapFrom(src => src.DonViTinh ?? ""))
                .ForMember(dest => dest.HinhAnh, opt => opt.MapFrom(src => src.HinhAnh ?? ""))
                .ForMember(dest => dest.GiaNhap, opt => opt.MapFrom(src => src.GiaNhap ?? 0))
                .ForMember(dest => dest.GiaBan, opt => opt.MapFrom(src => src.GiaBan ?? 0))
                .ForMember(dest => dest.SoLuongTon, opt => opt.MapFrom(src => src.SoLuongTon ?? 0))
                .ForMember(dest => dest.MaLoai, opt => opt.MapFrom(src => src.MaLoai ?? 0))
                .ForMember(dest => dest.MaNCC, opt => opt.MapFrom(src => src.MaNCC ?? 0))
                .ForMember(dest => dest.TrangThai, opt => opt.MapFrom(src => src.TrangThai ?? true));

            CreateMap<SanPhamUpdateDto, SanPham>()
                .ForMember(dest => dest.ThongSoKyThuat, opt => opt.MapFrom(src => src.ThongSoKyThuat ?? ""))
                .ForMember(dest => dest.MoTa, opt => opt.MapFrom(src => src.MoTa ?? ""))
                .ForMember(dest => dest.MaLinhKien, opt => opt.MapFrom(src => src.MaLinhKien ?? ""))
                .ForMember(dest => dest.DonViTinh, opt => opt.MapFrom(src => src.DonViTinh ?? ""))
                .ForMember(dest => dest.HinhAnh, opt => opt.MapFrom(src => src.HinhAnh ?? ""))
                .ForMember(dest => dest.MaSP, opt => opt.Ignore()); // 🔥 FIX: Ignore PK to prevent EF Core error

            // DanhMuc mappings
            CreateMap<DanhMuc, DanhMucDto>();
            CreateMap<DanhMucCreateDto, DanhMuc>();
            CreateMap<DanhMucUpdateDto, DanhMuc>()
                .ForMember(dest => dest.MaLoai, opt => opt.Ignore()); // 🔥 FIX: Ignore PK

            // HoaDon mappings
            CreateMap<HoaDon, HoaDonDto>()
                .ForMember(dest => dest.TenNV, opt => opt.MapFrom(src => src.NhanVien != null ? src.NhanVien.HoTen : ""))
                .ForMember(dest => dest.TenKH, opt => opt.MapFrom(src => src.KhachHang != null ? src.KhachHang.HoTen : ""))
                .ForMember(dest => dest.SanPhams, opt => opt.MapFrom(src => src.ChiTietHoaDons != null 
                    ? src.ChiTietHoaDons.Select(ct => new SanPhamTrongDonDto 
                    { 
                        TenSP = ct.SanPham != null ? ct.SanPham.TenSP : "", 
                        SoLuong = ct.SoLuong 
                    }).ToList() 
                    : new List<SanPhamTrongDonDto>()));
            CreateMap<HoaDonCreateDto, HoaDon>();
            CreateMap<HoaDonUpdateDto, HoaDon>();

            // ChiTietHoaDon mappings
            CreateMap<ChiTietHoaDon, ChiTietHoaDonDto>()
                .ForMember(dest => dest.MaHoaDon, opt => opt.MapFrom(src => src.HoaDon != null ? src.HoaDon.MaHoaDon : ""))
                .ForMember(dest => dest.TenSP, opt => opt.MapFrom(src => src.SanPham != null ? src.SanPham.TenSP : ""));
            CreateMap<ChiTietHoaDonCreateDto, ChiTietHoaDon>();
            CreateMap<ChiTietHoaDonUpdateDto, ChiTietHoaDon>();

            // BaoHanh mappings
            CreateMap<BaoHanh, BaoHanhDto>()
                .ForMember(dest => dest.MaHoaDon, opt => opt.MapFrom(src => src.HoaDon != null ? src.HoaDon.MaHoaDon : ""))
                .ForMember(dest => dest.TenSP, opt => opt.MapFrom(src => src.SanPham != null ? src.SanPham.TenSP : ""));
            CreateMap<BaoHanhCreateDto, BaoHanh>();
            CreateMap<BaoHanhUpdateDto, BaoHanh>();

            // ThanhToan mappings
            CreateMap<ThanhToan, ThanhToanDto>()
                .ForMember(dest => dest.MaHoaDon, opt => opt.MapFrom(src => src.HoaDon != null ? src.HoaDon.MaHoaDon : ""))
                .ForMember(dest => dest.TenPhuongThuc, opt => opt.MapFrom(src => src.PhuongThucThanhToan != null ? src.PhuongThucThanhToan.TenPhuongThuc : ""))
                .ForMember(dest => dest.TenKH, opt => opt.MapFrom(src => src.HoaDon != null && src.HoaDon.KhachHang != null ? src.HoaDon.KhachHang.HoTen : ""));
            CreateMap<ThanhToan, ThanhToanChiTietDto>()

                .ForMember(dest => dest.MaHoaDon, opt => opt.MapFrom(src => src.HoaDon != null ? src.HoaDon.MaHoaDon : ""))
                .ForMember(dest => dest.TenKH, opt => opt.MapFrom(src => src.HoaDon != null && src.HoaDon.KhachHang != null ? src.HoaDon.KhachHang.HoTen : ""))
                .ForMember(dest => dest.TenPhuongThuc, opt => opt.MapFrom(src => src.PhuongThucThanhToan != null ? src.PhuongThucThanhToan.TenPhuongThuc : ""));
            CreateMap<ThanhToanCreateDto, ThanhToan>();
            CreateMap<ThanhToanUpdateDto, ThanhToan>();

            // LichSuThanhToan mappings
            CreateMap<LichSuThanhToan, LichSuThanhToanDto>();
            CreateMap<LichSuThanhToanCreateDto, LichSuThanhToan>();

            // PhuongThucThanhToan mappings
            CreateMap<PhuongThucThanhToan, PhuongThucThanhToanDto>();
            CreateMap<PhuongThucThanhToanCreateDto, PhuongThucThanhToan>();
            CreateMap<PhuongThucThanhToanUpdateDto, PhuongThucThanhToan>();

            // PhieuNhap mappings
            CreateMap<PhieuNhap, PhieuNhapDto>()
                .ForMember(dest => dest.TenNV, opt => opt.MapFrom(src => src.NhanVien != null ? src.NhanVien.HoTen : ""))
                .ForMember(dest => dest.TenNCC, opt => opt.MapFrom(src => src.NhaCungCap != null ? src.NhaCungCap.TenNCC : ""))
                .ForMember(dest => dest.MaPhieuNhap, opt => opt.MapFrom(src => src.MaPhieuNhap ?? ""));
            CreateMap<PhieuNhapCreateDto, PhieuNhap>()
                .ForMember(dest => dest.MaPhieuNhap, opt => opt.Ignore()); // Sẽ được sinh tự động trong Controller
            CreateMap<PhieuNhapUpdateDto, PhieuNhap>();

            // ChiTietPhieuNhap mappings
            CreateMap<ChiTietPhieuNhap, ChiTietPhieuNhapDto>()
                .ForMember(dest => dest.TenSP, opt => opt.MapFrom(src => src.SanPham != null ? src.SanPham.TenSP : ""))
                .ForMember(dest => dest.ThanhTien, opt => opt.MapFrom(src => src.SoLuong * src.DonGiaNhap));
            CreateMap<ChiTietPhieuNhapCreateDto, ChiTietPhieuNhap>()

                .ForMember(dest => dest.ThanhTien, opt => opt.Ignore()); // ✅ Ignore computed column
            CreateMap<ChiTietPhieuNhapUpdateDto, ChiTietPhieuNhap>()
                .ForMember(dest => dest.ThanhTien, opt => opt.Ignore()); // ✅ Ignore computed column

            // NhaCungCap mappings
            CreateMap<NhaCungCap, NhaCungCapDto>();
            CreateMap<NhaCungCapCreateDto, NhaCungCap>();
            CreateMap<NhaCungCapUpdateDto, NhaCungCap>();

            // DanhGiaSanPham mappings
            CreateMap<DanhGiaSanPham, DanhGiaSanPhamDto>()
                .ForMember(dest => dest.TenSP, opt => opt.MapFrom(src => src.SanPham != null ? src.SanPham.TenSP : ""))
                .ForMember(dest => dest.TenKH, opt => opt.MapFrom(src => src.KhachHang != null ? src.KhachHang.HoTen : ""));
            CreateMap<DanhGiaSanPhamCreateDto, DanhGiaSanPham>();

            CreateMap<DanhGiaSanPhamUpdateDto, DanhGiaSanPham>();

            // ChatHoiThoai mappings
            CreateMap<ChatHoiThoai, ChatHoiThoaiDto>()
                .ForMember(dest => dest.TenKH, opt => opt.MapFrom(src => src.KhachHang != null ? src.KhachHang.HoTen : ""))
                .ForMember(dest => dest.SoTinNhan, opt => opt.MapFrom(src => src.ChatTinNhans.Count));
            CreateMap<ChatHoiThoaiCreateDto, ChatHoiThoai>();

            CreateMap<ChatHoiThoaiUpdateDto, ChatHoiThoai>();

            // ChatTinNhan mappings
            CreateMap<ChatTinNhan, ChatTinNhanDto>();
            CreateMap<ChatTinNhanCreateDto, ChatTinNhan>();
        }
    }
}
