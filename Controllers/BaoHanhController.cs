using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AutoMapper;
using BackendAPI.DTOs;
using BackendAPI.Models;
using BackendAPI.Repositories;
using BackendAPI.Data;

namespace BackendAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class BaoHanhController : ControllerBase
    {
        private readonly IGenericRepository<BaoHanh> _repository;
        private readonly IGenericRepository<SanPham> _spRepository;
        private readonly IGenericRepository<HoaDon> _hdRepository;
        private readonly IMapper _mapper;
        private readonly ApplicationDbContext _context;

        public BaoHanhController(
            IGenericRepository<BaoHanh> repository,
            IGenericRepository<SanPham> spRepository,
            IGenericRepository<HoaDon> hdRepository,
            IMapper mapper,
            ApplicationDbContext context)
        {
            _repository = repository;
            _spRepository = spRepository;
            _hdRepository = hdRepository;
            _mapper = mapper;
            _context = context;
        }

        // ========================= GET ALL =========================
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAll()
        {
            var data = await _context.BaoHanhs
                .Include(x => x.SanPham)
                .Include(x => x.HoaDon)
                .Select(x => new BaoHanhDto
                {
                    MaBH = x.MaBH,
                    MaHD = x.MaHD,
                    MaHoaDon = x.HoaDon != null ? x.HoaDon.MaHD.ToString() : null,
                    MaSP = x.MaSP,
                    TenSP = x.SanPham != null ? x.SanPham.TenSP : null,
                    SoSerial = x.SoSerial,
                    ThoiHanBaoHanh = x.ThoiHanBaoHanh,   // int?
                    NgayBatDau = x.NgayBatDau,
                    NgayKetThuc = x.NgayKetThuc,
                    TrangThai = x.TrangThai,
                    DiaChiBaoHanh = x.DiaChiBaoHanh ?? string.Empty,
                })
                .ToListAsync();

            return Ok(data);
        }

        // ========================= GET BY ID =========================
        [HttpGet("{id}")]
public async Task<IActionResult> GetById(int id)
{
    var data = await _context.BaoHanhs
        .Include(x => x.SanPham)
        .Include(x => x.HoaDon)
        .Where(x => x.MaBH == id)
        .Select(x => new BaoHanhDto
        {
            MaBH = x.MaBH,
            MaHD = x.MaHD,
            MaHoaDon = x.HoaDon != null ? x.HoaDon.MaHD.ToString() : null,
            MaSP = x.MaSP,
            TenSP = x.SanPham != null ? x.SanPham.TenSP : null,
            SoSerial = x.SoSerial,
            ThoiHanBaoHanh = x.ThoiHanBaoHanh,
            NgayBatDau = x.NgayBatDau,
            NgayKetThuc = x.NgayKetThuc,
            TrangThai = x.TrangThai,
            DiaChiBaoHanh = x.DiaChiBaoHanh ?? string.Empty
        })
        .FirstOrDefaultAsync();

    if (data == null)
        return NotFound();

    return Ok(data);
}

       // ========================= CREATE =========================
[HttpPost]
[Authorize(Roles = "Admin,NhanVien")]
public async Task<IActionResult> Create([FromBody] BaoHanhCreateDto createDto)
{
    if (!ModelState.IsValid)
        return BadRequest(ModelState);

    var baoHanh = _mapper.Map<BaoHanh>(createDto);

    // FIX TÍNH TOÁN KHI THÊM MỚI
    if (baoHanh.ThoiHanBaoHanh.HasValue && baoHanh.NgayBatDau.HasValue)
    {
        // Đổi AddMonths thành AddDays cho khớp với giao diện (Thời hạn tính bằng ngày)
        baoHanh.NgayKetThuc = baoHanh.NgayBatDau.Value.AddDays(baoHanh.ThoiHanBaoHanh.Value);

        // Tự động set trạng thái lúc tạo
        baoHanh.TrangThai = baoHanh.NgayKetThuc >= DateTime.Now ? "Đang bảo hành" : "Hết hạn";
    }

    await _repository.AddAsync(baoHanh);

    return Ok(new { message = "Tạo bảo hành thành công" });
}

// ========================= UPDATE =========================
[HttpPut("{id}")]
[Authorize(Roles = "Admin,NhanVien")]
public async Task<IActionResult> Update(int id, [FromBody] BaoHanhUpdateDto updateDto)
{
    if (!ModelState.IsValid)
        return BadRequest(ModelState);

    var baoHanh = await _repository.GetByIdAsync(id);

    if (baoHanh == null)
        return NotFound(new { message = "Không tìm thấy bảo hành" });

    // Map dữ liệu từ DTO sang Entity
    _mapper.Map(updateDto, baoHanh);

    // Bắt buộc khóa ID lại để tránh lỗi EF Core "cannot be modified"
    baoHanh.MaBH = id;

    // FIX TÍNH TOÁN LẠI KHI CẬP NHẬT
    if (baoHanh.ThoiHanBaoHanh.HasValue && baoHanh.NgayBatDau.HasValue)
    {
        // Tính lại ngày kết thúc
        baoHanh.NgayKetThuc = baoHanh.NgayBatDau.Value.AddDays(baoHanh.ThoiHanBaoHanh.Value);

        // Tính lại trạng thái
        baoHanh.TrangThai = baoHanh.NgayKetThuc >= DateTime.Now ? "Đang bảo hành" : "Hết hạn";
    }

    await _repository.UpdateAsync(baoHanh);

    return Ok(new { message = "Cập nhật thành công" });
}
        // ========================= DELETE =========================
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var baoHanh = await _repository.GetByIdAsync(id);

            if (baoHanh == null)
                return NotFound(new { message = "Không tìm thấy bảo hành" });

            await _repository.DeleteAsync(id);

            return Ok(new { message = "Xóa thành công" });
        }

        // ========================= GET BY HOADON =========================
       [HttpGet("hoa-don/{maHD}")]
public async Task<IActionResult> GetByHoaDon(int maHD)
{
    var data = await _context.BaoHanhs
        .Include(x => x.SanPham)
        .Include(x => x.HoaDon)
        .Where(x => x.MaHD == maHD)
        .Select(x => new BaoHanhDto
        {
            MaBH = x.MaBH,
            MaHD = x.MaHD,
            MaSP = x.MaSP,
            SoSerial = x.SoSerial,
            ThoiHanBaoHanh = x.ThoiHanBaoHanh,
            NgayBatDau = x.NgayBatDau,
            NgayKetThuc = x.NgayKetThuc,
            TrangThai = x.TrangThai,
            DiaChiBaoHanh = x.DiaChiBaoHanh ?? string.Empty,

            TenSP = x.SanPham != null ? x.SanPham.TenSP : null,
            MaHoaDon = x.HoaDon != null ? x.HoaDon.MaHD.ToString() : null
        })
        .ToListAsync();

    return Ok(data);
}

        // ========================= GET BY SANPHAM =========================
        [HttpGet("san-pham/{maSP}")]
        public async Task<IActionResult> GetBySanPham(int maSP)
        {
            var data = await _context.BaoHanhs
                .Where(x => x.MaSP == maSP)
                .ToListAsync();

            return Ok(data);
        }

        // ========================= SẮP HẾT HẠN =========================
        [HttpGet("sap-het-han")]
        [Authorize(Roles = "Admin,NhanVien")]
        public async Task<IActionResult> SapHetHan([FromQuery] int soNgay = 7)
        {
            var ngayCanhBao = DateTime.Now.AddDays(soNgay);

            var data = await _context.BaoHanhs
                .Where(b =>
                    b.NgayKetThuc <= ngayCanhBao &&
                    b.NgayKetThuc >= DateTime.Now &&
                    b.TrangThai == "Đang bảo hành")
                .ToListAsync();

            return Ok(data);
        }
    }
}