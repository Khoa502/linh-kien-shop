using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using AutoMapper;
using BackendAPI.DTOs;
using BackendAPI.Models;
using BackendAPI.Repositories;
using BackendAPI.Data;
using Microsoft.EntityFrameworkCore;

namespace BackendAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ThanhToanController : ControllerBase
    {
        private readonly IGenericRepository<ThanhToan> _repository;
        private readonly IGenericRepository<HoaDon> _hdRepository;
        private readonly IGenericRepository<LichSuThanhToan> _lsRepository;
        private readonly IMapper _mapper;
        private readonly ApplicationDbContext _context;

        public ThanhToanController(
            IGenericRepository<ThanhToan> repository,
            IGenericRepository<HoaDon> hdRepository,
            IGenericRepository<LichSuThanhToan> lsRepository,
            IMapper mapper,
            ApplicationDbContext context)
        {
            _repository = repository;
            _hdRepository = hdRepository;
            _lsRepository = lsRepository;
            _mapper = mapper;
            _context = context;
        }

        // ================= GET ALL =================
        [HttpGet]
        [Authorize(Roles = "Admin,NhanVien")]
        public async Task<IActionResult> GetAll()
        {
            var data = await _repository.GetAllAsync(
                t => t.HoaDon,
                t => t.PhuongThucThanhToan
            );

            // Dùng Distinct để tránh duplicate rows do join
            var distinctData = data.GroupBy(t => t.MaThanhToan).Select(g => g.First());

            return Ok(_mapper.Map<IEnumerable<ThanhToanDto>>(distinctData));
        }

        // ================= GET BY ID =================
        [HttpGet("{id}")]
        [Authorize(Roles = "Admin,NhanVien")]
        public async Task<IActionResult> GetById(int id)
        {
            // Include đầy đủ: ThanhToan -> HoaDon -> KhachHang -> PhuongThucThanhToan
            var thanhToan = await _context.ThanhToans
                .Include(t => t.HoaDon)
                    .ThenInclude(hd => hd.KhachHang)
                .Include(t => t.PhuongThucThanhToan)
                .FirstOrDefaultAsync(t => t.MaThanhToan == id);

            if (thanhToan == null)
                return NotFound(new { message = "Không tìm thấy thanh toán" });

            return Ok(_mapper.Map<ThanhToanDto>(thanhToan));
        }

        // ================= GET CHI TIET BY ID =================
        /// <summary>
        /// Lấy chi tiết thanh toán - join 4 bảng: ThanhToan, HoaDon, KhachHang, PhuongThucThanhToan
        /// </summary>
        [HttpGet("{id}/chi-tiet")]
        [Authorize(Roles = "Admin,NhanVien")]
        public async Task<IActionResult> GetChiTietById(int id)
        {
            var result = await _context.ThanhToans
                .Include(t => t.HoaDon)
                    .ThenInclude(hd => hd.KhachHang)
                .Include(t => t.PhuongThucThanhToan)
                .FirstOrDefaultAsync(t => t.MaThanhToan == id);

            if (result == null)
                return NotFound(new { message = "Không tìm thấy thanh toán" });

            return Ok(_mapper.Map<ThanhToanChiTietDto>(result));
        }

        // ================= CREATE =================
        [HttpPost]
        [Authorize(Roles = "Admin,NhanVien")]
        public async Task<IActionResult> Create([FromBody] ThanhToanCreateDto createDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (!createDto.MaHD.HasValue)
                return BadRequest(new { message = "Mã hóa đơn không hợp lệ" });

            if (createDto.SoTien <= 0)
                return BadRequest(new { message = "Số tiền thanh toán phải lớn hơn 0" });

            var hoaDon = await _hdRepository.GetByIdAsync(createDto.MaHD.Value);
            if (hoaDon == null)
                return BadRequest(new { message = "Hóa đơn không tồn tại" });

            if (hoaDon.TrangThai == "Đã thanh toán")
                return BadRequest(new { message = "Hóa đơn đã được thanh toán trước đó" });

            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                var thanhToan = _mapper.Map<ThanhToan>(createDto);
                thanhToan.NgayThanhToan = DateTime.Now;
                thanhToan.TrangThai = "Đã thanh toán";

                var result = await _repository.AddAsync(thanhToan);

                // Ghi lịch sử
                var lichSu = new LichSuThanhToan
                {
                    MaThanhToan = result.MaThanhToan,
                    TrangThai = result.TrangThai,
                    ThoiGian = DateTime.Now,
                    GhiChu = "Tạo thanh toán mới"
                };

                await _lsRepository.AddAsync(lichSu);

                // Cập nhật trạng thái hóa đơn
                hoaDon.TrangThai = "Đã thanh toán";
                await _hdRepository.UpdateAsync(hoaDon);

                await transaction.CommitAsync();

                return CreatedAtAction(
                    nameof(GetById),
                    new { id = result.MaThanhToan },
                    _mapper.Map<ThanhToanDto>(result)
                );
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, new
                {
                    message = "Lỗi khi tạo thanh toán",
                    error = ex.Message
                });
            }
        }

        // ================= UPDATE =================
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(int id, [FromBody] ThanhToanUpdateDto updateDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var thanhToan = await _repository.GetByIdAsync(id);
            if (thanhToan == null)
                return NotFound(new { message = "Không tìm thấy thanh toán" });

            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                var trangThaiCu = thanhToan.TrangThai;

                _mapper.Map(updateDto, thanhToan);
                await _repository.UpdateAsync(thanhToan);

                if (trangThaiCu != thanhToan.TrangThai)
                {
                    var lichSu = new LichSuThanhToan
                    {
                        MaThanhToan = thanhToan.MaThanhToan,
                        TrangThai = thanhToan.TrangThai,
                        ThoiGian = DateTime.Now,
                        GhiChu = $"Thay đổi trạng thái từ {trangThaiCu} sang {thanhToan.TrangThai}"
                    };

                    await _lsRepository.AddAsync(lichSu);

                    if (thanhToan.MaHD.HasValue)
                    {
                        var hoaDon = await _hdRepository.GetByIdAsync(thanhToan.MaHD.Value);
                        if (hoaDon != null)
                        {
                            hoaDon.TrangThai = thanhToan.TrangThai;
                            await _hdRepository.UpdateAsync(hoaDon);
                        }
                    }
                }

                await transaction.CommitAsync();
                return Ok(new { message = "Cập nhật thành công" });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, new
                {
                    message = "Lỗi khi cập nhật thanh toán",
                    error = ex.Message
                });
            }
        }

        // ================= DELETE =================
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var thanhToan = await _repository.GetByIdAsync(id);
            if (thanhToan == null)
                return NotFound(new { message = "Không tìm thấy thanh toán" });

            await _repository.DeleteAsync(id);
            return Ok(new { message = "Xóa thành công" });
        }

        // ================= GET BY HOA DON =================
        [HttpGet("hoa-don/{maHD}")]
        [Authorize(Roles = "Admin,NhanVien")]
        public async Task<IActionResult> GetByHoaDon(int maHD)
        {
            var data = await _repository.GetAllAsync(
                t => t.HoaDon,
                t => t.PhuongThucThanhToan
            );

            var filtered = data.Where(t => t.MaHD == maHD);
            var distinctData = filtered.GroupBy(t => t.MaThanhToan).Select(g => g.First());

            return Ok(_mapper.Map<IEnumerable<ThanhToanDto>>(distinctData));
        }

        // ================= GET BY PHUONG THUC =================
        [HttpGet("phuong-thuc/{maPTTT}")]
        [Authorize(Roles = "Admin,NhanVien")]
        public async Task<IActionResult> GetByPhuongThuc(int maPTTT)
        {
            var data = await _repository.GetAllAsync(
                t => t.HoaDon,
                t => t.PhuongThucThanhToan
            );

            var filtered = data.Where(t => t.MaPTTT == maPTTT);
            var distinctData = filtered.GroupBy(t => t.MaThanhToan).Select(g => g.First());

            return Ok(_mapper.Map<IEnumerable<ThanhToanDto>>(distinctData));
        }

        // ================= LICH SU =================
        [HttpGet("{id}/lich-su")]
        [Authorize(Roles = "Admin,NhanVien")]
        public async Task<IActionResult> GetLichSu(int id)
        {
            var data = await _lsRepository.FindAsync(l => l.MaThanhToan == id);
            return Ok(_mapper.Map<IEnumerable<LichSuThanhToanDto>>(data));
        }
    }
}