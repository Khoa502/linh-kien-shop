using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
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
    public class LichSuThanhToanController : ControllerBase
    {
        private readonly IGenericRepository<LichSuThanhToan> _repository;
        private readonly IMapper _mapper;

      
        public LichSuThanhToanController(
            IGenericRepository<LichSuThanhToan> repository,
            IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        // =========================
        // GET ALL
        // =========================
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var lichSus = await _repository.GetAllAsync();

            if (lichSus == null || !lichSus.Any())
                return Ok(new List<LichSuThanhToanDto>());

            var result = _mapper.Map<IEnumerable<LichSuThanhToanDto>>(lichSus);
            return Ok(result);
        }

        // =========================
        // GET BY ID
        // =========================
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var lichSu = await _repository.GetByIdAsync(id);

            if (lichSu == null)
                return NotFound(new { message = "Không tìm thấy lịch sử thanh toán" });

            var result = _mapper.Map<LichSuThanhToanDto>(lichSu);
            return Ok(result);
        }

        // =========================
        // CREATE
        // =========================
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] LichSuThanhToanCreateDto createDto)
        {
            if (createDto == null)
                return BadRequest(new { message = "Dữ liệu không hợp lệ" });

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var lichSu = _mapper.Map<LichSuThanhToan>(createDto);

            // Gán thời gian hệ thống
            lichSu.ThoiGian = DateTime.UtcNow;

            var result = await _repository.AddAsync(lichSu);

            var resultDto = _mapper.Map<LichSuThanhToanDto>(result);

            return CreatedAtAction(nameof(GetById), new { id = result.ID }, resultDto);
        }

        // =========================
        // DELETE (ADMIN ONLY)
        // =========================
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var lichSu = await _repository.GetByIdAsync(id);

            if (lichSu == null)
                return NotFound(new { message = "Không tìm thấy lịch sử thanh toán" });

            await _repository.DeleteAsync(id);

            return Ok(new { message = "Xóa thành công" });
        }

        // =========================
        // GET BY MA THANH TOAN
        // =========================
        [HttpGet("thanh-toan/{maThanhToan}")]
        public async Task<IActionResult> GetByThanhToan(int maThanhToan)
        {
            var lichSus = await _repository.FindAsync(l => l.MaThanhToan == maThanhToan);

            if (lichSus == null || !lichSus.Any())
                return Ok(new List<LichSuThanhToanDto>());

            var result = _mapper.Map<IEnumerable<LichSuThanhToanDto>>(lichSus);

            return Ok(result);
        }

        // =========================
        // THỐNG KÊ THEO KHOẢNG NGÀY
        // =========================
        [HttpGet("thong-ke")]
        public async Task<IActionResult> ThongKe(
            [FromQuery] DateTime tuNgay,
            [FromQuery] DateTime denNgay)
        {
            if (tuNgay > denNgay)
                return BadRequest(new { message = "Từ ngày phải nhỏ hơn hoặc bằng đến ngày" });

            var lichSus = await _repository.FindAsync(l =>
                l.ThoiGian >= tuNgay && l.ThoiGian <= denNgay);

            if (lichSus == null || !lichSus.Any())
                return Ok(new { message = "Không có dữ liệu trong khoảng thời gian này" });

            var result = lichSus
                .GroupBy(l => l.TrangThai)
                .Select(g => new
                {
                    trangThai = g.Key,
                    soLuong = g.Count(),
                    danhSach = g.Select(x => new
                    {
                        id = x.ID,
                        thoiGian = x.ThoiGian,
                        maThanhToan = x.MaThanhToan
                    })
                });

            return Ok(result);
        }
    }
}