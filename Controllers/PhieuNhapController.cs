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
    [Authorize(Roles = "Admin,NhanVien")]
    public class PhieuNhapController : ControllerBase
    {
        private readonly IGenericRepository<PhieuNhap> _repository;
        private readonly IGenericRepository<ChiTietPhieuNhap> _ctRepository;
        private readonly IGenericRepository<SanPham> _spRepository;
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;

        public PhieuNhapController(
            IGenericRepository<PhieuNhap> repository,
            IGenericRepository<ChiTietPhieuNhap> ctRepository,
            IGenericRepository<SanPham> spRepository,
            ApplicationDbContext context,
            IMapper mapper)
        {
            _repository = repository;
            _ctRepository = ctRepository;
            _spRepository = spRepository;
            _context = context;
            _mapper = mapper;
        }

        // ================= GET ALL =================
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var phieuNhaps = await _repository.GetAllAsync(
                p => p.NhanVien,
                p => p.NhaCungCap
            );
            var result = _mapper.Map<IEnumerable<PhieuNhapDto>>(phieuNhaps);
            return Ok(result);
        }

        // ================= GET BY ID =================
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var phieuNhaps = await _repository.GetAllAsync(
                p => p.NhanVien,
                p => p.NhaCungCap
            );
            var phieuNhap = phieuNhaps.FirstOrDefault(p => p.MaPN == id);

            if (phieuNhap == null)
                return NotFound(new { message = "Không tìm thấy phiếu nhập" });

            return Ok(_mapper.Map<PhieuNhapDto>(phieuNhap));
        }

        // ================= CREATE =================
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] PhieuNhapCreateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // ✅ VALIDATION: Kiểm tra Nhân viên tồn tại
            if (dto.MaNV.HasValue)
            {
                var nhanVienExists = await _context.NhanViens.AnyAsync(x => x.MaNV == dto.MaNV);
                if (!nhanVienExists)
                    return BadRequest(new { error = "Nhân viên không tồn tại hoặc mã nhân viên không hợp lệ" });
            }

            // ✅ VALIDATION: Kiểm tra Nhà cung cấp tồn tại
            if (dto.MaNCC.HasValue)
            {
                var nccExists = await _context.NhaCungCaps.AnyAsync(x => x.MaNCC == dto.MaNCC);
                if (!nccExists)
                    return BadRequest(new { error = "Nhà cung cấp không tồn tại hoặc mã nhà cung cấp không hợp lệ" });
            }

            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                // 1. ✅ SINH MÃ PHIẾU DUY NHẤT TRƯỚC KHI ADD
                var maPhieuNhap = "PN" + DateTime.Now.ToString("yyyyMMddHHmmss");

                // 2. Tạo Phiếu Nhập (TongTien = 0 trước)
                var phieuNhap = new PhieuNhap
                {
                    MaPhieuNhap = maPhieuNhap,
                    MaNV = dto.MaNV,
                    MaNCC = dto.MaNCC,
                    NgayNhap = dto.NgayNhap ?? DateTime.Now,
                    TongTien = 0,
                    GhiChu = dto.GhiChu
                };

                await _context.PhieuNhaps.AddAsync(phieuNhap);
                await _context.SaveChangesAsync();

                // 3. Nếu có chi tiết → Thêm từng chi tiết VÀ TÍNH TỔNG TIỀN
                decimal tongTien = 0;
                if (dto.ChiTietPhieuNhaps != null && dto.ChiTietPhieuNhaps.Any())
                {
                    foreach (var chiTietDto in dto.ChiTietPhieuNhaps)
                    {
                        var sanPham = await _spRepository.GetByIdAsync(chiTietDto.MaSP);
                        if (sanPham == null)
                        {
                            await transaction.RollbackAsync();
                            return BadRequest(new { error = $"Sản phẩm với mã {chiTietDto.MaSP} không tồn tại" });
                        }

                        var soLuong = chiTietDto.SoLuong ?? 0;
                        var donGia = chiTietDto.DonGiaNhap ?? 0;

                        // ✅ TÍNH THÀNH TIỀN (chỉ để tính tổng, KHÔNG gán vào entity)
                        var thanhTien = soLuong * donGia;
                        tongTien += thanhTien;

                        // ✅ TUYỆT ĐỐI KHÔNG gán ThanhTien vào entity (để DB tự tính)
                        var chiTiet = new ChiTietPhieuNhap
                        {
                            MaPN = phieuNhap.MaPN,
                            MaSP = chiTietDto.MaSP,
                            SoLuong = soLuong,
                            DonGiaNhap = donGia
                            // KHÔNG gán ThanhTien
                        };

                        await _context.ChiTietPhieuNhaps.AddAsync(chiTiet);

                        // 4. Cập nhật tồn kho và giá nhập
                        sanPham.SoLuongTon += soLuong;
                        sanPham.GiaNhap = donGia;
                        _context.SanPhams.Update(sanPham);
                    }
                }

                // ✅ GÁN TỔNG TIỀN SAU KHI ĐÃ TÍNH TOÁN
                phieuNhap.TongTien = tongTien;
                _context.PhieuNhaps.Update(phieuNhap);

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                // 5. Trả về kết quả
                var result = await _repository.GetAllAsync(
                    p => p.NhanVien,
                    p => p.NhaCungCap
                );
                var createdPhieuNhap = result.FirstOrDefault(p => p.MaPN == phieuNhap.MaPN);

                return CreatedAtAction(nameof(GetById),
                    new { id = phieuNhap.MaPN },
                    _mapper.Map<PhieuNhapDto>(createdPhieuNhap));
            }
            catch (DbUpdateException ex)
            {
                await transaction.RollbackAsync();
                var errorMessage = ex.InnerException?.Message ?? ex.Message;
                return BadRequest(new { error = $"Lỗi database: {errorMessage}" });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return BadRequest(new { error = ex.Message });
            }
        }

        // ================= CREATE VỚI CHI TIẾT =================
        [HttpPost("with-chi-tiet")]
        public async Task<IActionResult> CreateWithChiTiet([FromBody] PhieuNhapCreateWithChiTietDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (dto.ChiTietPhieuNhaps == null || !dto.ChiTietPhieuNhaps.Any())
                return BadRequest(new { message = "Danh sách chi tiết phiếu nhập không được để trống" });

            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                // 1. ✅ SINH MÃ PHIẾU DUY NHẤT TRƯỚC KHI ADD
                var maPhieuNhap = "PN" + DateTime.Now.ToString("yyyyMMddHHmmss");

                // 2. Tạo Phiếu Nhập
                var phieuNhap = new PhieuNhap
                {
                    MaPhieuNhap = maPhieuNhap,
                    MaNV = dto.MaNV,
                    MaNCC = dto.MaNCC,
                    NgayNhap = dto.NgayNhap ?? DateTime.Now,
                    TongTien = 0,
                    GhiChu = dto.GhiChu
                };

                await _context.PhieuNhaps.AddAsync(phieuNhap);
                await _context.SaveChangesAsync();

                decimal tongTien = 0;

                // 3. Thêm từng chi tiết
                foreach (var chiTietDto in dto.ChiTietPhieuNhaps)
                {
                    var sanPham = await _spRepository.GetByIdAsync(chiTietDto.MaSP);
                    if (sanPham == null)
                    {
                        await transaction.RollbackAsync();
                        return BadRequest(new { message = $"Sản phẩm với mã {chiTietDto.MaSP} không tồn tại" });
                    }

                    var soLuong = chiTietDto.SoLuong ?? 0;
                    var donGia = chiTietDto.DonGiaNhap ?? 0;

                    // ✅ TÍNH THÀNH TIỀN (chỉ để tính tổng, KHÔNG gán vào entity)
                    var thanhTien = soLuong * donGia;
                    tongTien += thanhTien;

                    // ✅ TUYỆT ĐỐI KHÔNG gán ThanhTien vào entity (để DB tự tính)
                    var chiTiet = new ChiTietPhieuNhap
                    {
                        MaPN = phieuNhap.MaPN,
                        MaSP = chiTietDto.MaSP,
                        SoLuong = soLuong,
                        DonGiaNhap = donGia
                        // KHÔNG gán ThanhTien
                    };

                    await _context.ChiTietPhieuNhaps.AddAsync(chiTiet);

                    // 4. Cập nhật tồn kho và giá nhập
                    sanPham.SoLuongTon += soLuong;
                    sanPham.GiaNhap = donGia;
                    _context.SanPhams.Update(sanPham);
                }

                // 5. Cập nhật tổng tiền
                phieuNhap.TongTien = tongTien;
                _context.PhieuNhaps.Update(phieuNhap);

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                // 6. Trả về kết quả
                var result = await _repository.GetAllAsync(
                    p => p.NhanVien,
                    p => p.NhaCungCap
                );
                var createdPhieuNhap = result.FirstOrDefault(p => p.MaPN == phieuNhap.MaPN);

                return CreatedAtAction(nameof(GetById),
                    new { id = phieuNhap.MaPN },
                    _mapper.Map<PhieuNhapDto>(createdPhieuNhap));
            }
            catch (DbUpdateException ex)
            {
                await transaction.RollbackAsync();
                var errorMessage = ex.InnerException?.Message ?? ex.Message;
                return BadRequest(new { error = $"Lỗi database: {errorMessage}" });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return BadRequest(new { error = ex.Message });
            }
        }

        // ================= ADD CHI TIET =================
        [HttpPost("{id:int}/chi-tiet")]
        public async Task<IActionResult> AddChiTiet(int id,
            [FromBody] ChiTietPhieuNhapCreateDto dto)
        {
            if (dto.SoLuong <= 0 || dto.DonGiaNhap <= 0)
                return BadRequest(new { message = "Số lượng và đơn giá phải > 0" });

            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                var phieuNhap = await _repository.GetByIdAsync(id);
                if (phieuNhap == null)
                    return NotFound(new { message = "Không tìm thấy phiếu nhập" });

                var sanPham = await _spRepository.GetByIdAsync(dto.MaSP);
                if (sanPham == null)
                    return BadRequest(new { message = "Sản phẩm không tồn tại" });

                var soLuong = dto.SoLuong ?? 0;
                var donGia = dto.DonGiaNhap ?? 0;

                // ✅ TÍNH THÀNH TIỀN (chỉ để tính tổng, KHÔNG gán vào entity)
                var thanhTien = soLuong * donGia;

                var chiTiet = new ChiTietPhieuNhap
                {
                    MaPN = id,
                    MaSP = dto.MaSP,
                    SoLuong = soLuong,
                    DonGiaNhap = donGia
                    // ✅ TUYỆT ĐỐI KHÔNG gán ThanhTien (để DB tự tính)
                };

                await _ctRepository.AddAsync(chiTiet);

                // Cập nhật tồn kho
                sanPham.SoLuongTon += soLuong;
                sanPham.GiaNhap = donGia;
                await _spRepository.UpdateAsync(sanPham);

                // Cập nhật tổng tiền
                phieuNhap.TongTien += thanhTien;
                await _repository.UpdateAsync(phieuNhap);

                await transaction.CommitAsync();

                return Ok(new { message = "Thêm chi tiết thành công" });
            }
            catch
            {
                await transaction.RollbackAsync();
                return StatusCode(500, "Có lỗi xảy ra khi thêm chi tiết");
            }
        }

        // ================= DELETE =================
        [HttpDelete("{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                var phieuNhap = await _repository.GetByIdAsync(id);
                if (phieuNhap == null)
                    return NotFound(new { message = "Không tìm thấy phiếu nhập" });

                var chiTiets = await _ctRepository.FindAsync(c => c.MaPN == id);

                foreach (var ct in chiTiets)
                {
                    var sanPham = await _spRepository.GetByIdAsync(ct.MaSP);
                    if (sanPham != null)
                    {
                        sanPham.SoLuongTon -= ct.SoLuong ?? 0;
                        await _spRepository.UpdateAsync(sanPham);
                    }

                    await _ctRepository.DeleteAsync(ct.MaCTPN);
                }

                await _repository.DeleteAsync(id);

                await transaction.CommitAsync();

                return Ok(new { message = "Xóa thành công" });
            }
            catch
            {
                await transaction.RollbackAsync();
                return StatusCode(500, "Có lỗi khi xóa phiếu nhập");
            }
        }

        // ================= THỐNG KÊ =================
        [HttpGet("thong-ke")]
        public async Task<IActionResult> ThongKe(
            [FromQuery] DateTime tuNgay,
            [FromQuery] DateTime denNgay)
        {
            if (tuNgay > denNgay)
                return BadRequest("Từ ngày không hợp lệ");

            var phieuNhaps = await _context.PhieuNhaps
                .Where(p => p.NgayNhap >= tuNgay && p.NgayNhap <= denNgay)
                .Include(p => p.ChiTietPhieuNhaps)
                .ToListAsync();

            var tongNhap = phieuNhaps.Sum(p => p.TongTien ?? 0);
            var chiTiets = phieuNhaps.SelectMany(p => p.ChiTietPhieuNhaps);

            return Ok(new
            {
                tuNgay,
                denNgay,
                tongNhap,
                soPhieu = phieuNhaps.Count,
                tongSanPham = chiTiets.Sum(c => c.SoLuong ?? 0),
                chiTietTheoSP = chiTiets
                    .GroupBy(c => c.MaSP)
                    .Select(g => new
                    {
                        maSP = g.Key,
                        soLuong = g.Sum(x => x.SoLuong),
                        tongTien = g.Sum(x => x.ThanhTien)
                    })
            });
        }
    }
}