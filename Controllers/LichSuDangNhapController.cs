using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using AutoMapper;
using BackendAPI.Data;
using BackendAPI.DTOs;
using BackendAPI.Models;
using BackendAPI.Repositories;
using Microsoft.EntityFrameworkCore;

namespace BackendAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class LichSuDangNhapController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IGenericRepository<LichSuDangNhap> _repository;
        private readonly IMapper _mapper;

        public LichSuDangNhapController(
            ApplicationDbContext context,
            IGenericRepository<LichSuDangNhap> repository,
            IMapper mapper)
        {
            _context = context;
            _repository = repository;
            _mapper = mapper;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var lichSus = await _repository.GetAllAsync(l => l.TaiKhoan);
            var result = _mapper.Map<IEnumerable<LichSuDangNhapDto>>(
                lichSus.OrderByDescending(l => l.ThoiGian)
            );
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var lichSu = await _context.LichSuDangNhaps
                .Include(l => l.TaiKhoan)
                .FirstOrDefaultAsync(l => l.ID == id);
            if (lichSu == null)
                return NotFound(new { message = "Không tìm thấy lịch sử đăng nhập" });

            var result = _mapper.Map<LichSuDangNhapDto>(lichSu);
            return Ok(result);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var lichSu = await _repository.GetByIdAsync(id);
            if (lichSu == null)
                return NotFound(new { message = "Không tìm thấy lịch sử đăng nhập" });

            await _repository.DeleteAsync(id);
            return Ok(new { message = "Xóa thành công" });
        }

        [HttpDelete("xoa-truoc-ngay")]
        public async Task<IActionResult> DeleteBeforeDate([FromQuery] DateTime ngay)
        {
            var lichSus = await _repository.FindAsync(l => l.ThoiGian < ngay);
            foreach (var ls in lichSus)
            {
                await _repository.DeleteAsync(ls.ID);
            }
            
            return Ok(new { message = $"Đã xóa {lichSus.Count()} bản ghi" });
        }

        [HttpGet("tai-khoan/{taiKhoanID}")]
        public async Task<IActionResult> GetByTaiKhoan(int taiKhoanID)
        {
            var lichSus = await _context.LichSuDangNhaps
                .Include(l => l.TaiKhoan)
                .Where(l => l.TaiKhoanID == taiKhoanID)
                .ToListAsync();
            var result = _mapper.Map<IEnumerable<LichSuDangNhapDto>>(
                lichSus.OrderByDescending(l => l.ThoiGian)
            );
            return Ok(result);
        }

        [HttpGet("thong-ke")]
        public async Task<IActionResult> ThongKe([FromQuery] DateTime? tuNgay, [FromQuery] DateTime? denNgay)
        {
            var lichSus = await _repository.GetAllAsync(l => l.TaiKhoan);
            
            if (tuNgay.HasValue)
                lichSus = lichSus.Where(l => l.ThoiGian >= tuNgay);
            if (denNgay.HasValue)
                lichSus = lichSus.Where(l => l.ThoiGian <= denNgay);

            var thongKeTheoNgay = lichSus
                .GroupBy(l => l.ThoiGian.Date)
                .Select(g => new
                {
                    ngay = g.Key,
                    soLuot = g.Count(),
                    thanhCong = g.Count(l => l.TrangThai == "Thành công"),
                    thatBai = g.Count(l => l.TrangThai != "Thành công")
                })
                .OrderByDescending(x => x.ngay);

            var thongKeTheoTaiKhoan = lichSus
                .GroupBy(l => l.TaiKhoanID)
                .Select(g => new
                {
                    taiKhoanID = g.Key,
                    tenDangNhap = g.First().TaiKhoan.TenDangNhap,
                    soLuot = g.Count(),
                    lanCuoi = g.Max(l => l.ThoiGian)
                })
                .OrderByDescending(x => x.soLuot)
                .Take(10);

            return Ok(new
            {
                tongLuot = lichSus.Count(),
                tuNgay = tuNgay,
                denNgay = denNgay,
                thongKeTheoNgay,
                topTaiKhoan = thongKeTheoTaiKhoan
            });
        }

        [HttpGet("gan-day")]
        public async Task<IActionResult> GetGanDay([FromQuery] int soNgay = 7)
        {
            var tuNgay = DateTime.Now.AddDays(-soNgay);
            var lichSus = await _context.LichSuDangNhaps
                .Include(l => l.TaiKhoan)
                .Where(l => l.ThoiGian >= tuNgay)
                .ToListAsync();
            
            var result = _mapper.Map<IEnumerable<LichSuDangNhapDto>>(
                lichSus.OrderByDescending(l => l.ThoiGian)
            );
            
            return Ok(result);
        }

        [HttpGet("ip/{diaChiIP}")]
        public async Task<IActionResult> GetByIP(string diaChiIP)
        {
            var lichSus = await _context.LichSuDangNhaps
                .Include(l => l.TaiKhoan)
                .Where(l => l.DiaChiIP == diaChiIP)
                .ToListAsync();
            var result = _mapper.Map<IEnumerable<LichSuDangNhapDto>>(
                lichSus.OrderByDescending(l => l.ThoiGian)
            );
            return Ok(result);
        }

        [HttpGet("thong-ke/theo-ip")]
        public async Task<IActionResult> ThongKeTheoIP()
        {
            var lichSus = await _repository.GetAllAsync(l => l.TaiKhoan);
            
            var thongKe = lichSus
                .GroupBy(l => l.DiaChiIP)
                .Where(g => g.Key != null)
                .Select(g => new
                {
                    diaChiIP = g.Key,
                    soLuot = g.Count(),
                    taiKhoanThuongDung = g
                        .GroupBy(l => l.TaiKhoanID)
                        .OrderByDescending(x => x.Count())
                        .Select(x => new
                        {
                            taiKhoanID = x.Key,
                            tenDangNhap = x.First().TaiKhoan.TenDangNhap,
                            soLuot = x.Count()
                        })
                        .FirstOrDefault(),
                    lanCuoi = g.Max(l => l.ThoiGian)
                })
                .OrderByDescending(x => x.soLuot)
                .Take(20);

            return Ok(thongKe);
        }
    }
}