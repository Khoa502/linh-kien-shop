using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AutoMapper;
using BackendAPI.DTOs;
using BackendAPI.Models;
using BackendAPI.Data;

namespace BackendAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class KhachHangController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;

        public KhachHangController(ApplicationDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        // ================= GET ALL =================
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var khachHangs = await _context.KhachHangs
                .Include(x => x.TaiKhoan)
                .ToListAsync();

            var result = _mapper.Map<IEnumerable<KhachHangDto>>(khachHangs);
            return Ok(result);
        }

        // ================= GET BY ID =================
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var khachHang = await _context.KhachHangs
                .Include(x => x.TaiKhoan)
                .FirstOrDefaultAsync(x => x.MaKH == id);

            if (khachHang == null)
                return NotFound(new { message = "Không tìm thấy khách hàng" });

            // ✅ Kiểm tra quyền: User chỉ được xem thông tin của chính mình
            var userIdClaim = User.FindFirst("MaKH")?.Value 
                              ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            
            if (!string.IsNullOrEmpty(userIdClaim) && int.TryParse(userIdClaim, out int userMaKH))
            {
                var roleClaim = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
                if (roleClaim == "User" && khachHang.MaKH != userMaKH)
                {
                    return Forbid(); // 403 - Không có quyền xem thông tin người khác
                }
            }

            var result = _mapper.Map<KhachHangDto>(khachHang);
            return Ok(result);
        }

        // ================= GET PROFILE (User's own profile) =================
        [HttpGet("profile")]
        [Authorize] // ✅ Cho phép User lấy thông tin của chính mình
        public async Task<IActionResult> GetProfile()
        {
            var userIdClaim = User.FindFirst("MaKH")?.Value;
            
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int maKH))
            {
                return BadRequest(new { message = "Không tìm thấy thông tin khách hàng trong token" });
            }

            var khachHang = await _context.KhachHangs
                .Include(x => x.TaiKhoan)
                .FirstOrDefaultAsync(x => x.MaKH == maKH);

            if (khachHang == null)
                return NotFound(new { message = "Không tìm thấy khách hàng" });

            var result = _mapper.Map<KhachHangDto>(khachHang);
            return Ok(result);
        }

        // ================= CREATE =================
        [HttpPost]
        [Authorize(Roles = "Admin,NhanVien")]
        public async Task<IActionResult> Create([FromBody] KhachHangCreateDto createDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var khachHang = _mapper.Map<KhachHang>(createDto);

            khachHang.DiemTichLuy = khachHang.DiemTichLuy ?? 0;
            khachHang.TongNo = 0;

            _context.KhachHangs.Add(khachHang);
            await _context.SaveChangesAsync();

            var resultDto = _mapper.Map<KhachHangDto>(khachHang);

            return CreatedAtAction(nameof(GetById), new { id = khachHang.MaKH }, resultDto);
        }

        // ================= UPDATE =================
        [HttpPut("{id}")]
        [Authorize] // ✅ Sửa: Cho phép User tự cập nhật thông tin của mình
        public async Task<IActionResult> Update(int id, [FromBody] KhachHangUpdateDto updateDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var khachHang = await _context.KhachHangs.FindAsync(id);
            if (khachHang == null)
                return NotFound(new { message = "Không tìm thấy khách hàng" });

            // ✅ Kiểm tra quyền: User chỉ được sửa thông tin của chính mình
            var userIdClaim = User.FindFirst("MaKH")?.Value 
                              ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            
            if (!string.IsNullOrEmpty(userIdClaim) && int.TryParse(userIdClaim, out int userMaKH))
            {
                // Nếu là User (khách hàng), chỉ được sửa thông tin của chính mình
                var roleClaim = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
                if (roleClaim == "User" && khachHang.MaKH != userMaKH)
                {
                    return Forbid(); // 403 - Không có quyền sửa thông tin người khác
                }
            }

            // ✅ Update từng field thay vì dùng AutoMapper để tránh lỗi Primary Key
            khachHang.HoTen = updateDto.HoTen;
            khachHang.SoDienThoai = updateDto.SoDienThoai;
            khachHang.DiaChi = updateDto.DiaChi;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Cập nhật thành công" });
        }

        // ================= DELETE =================
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var khachHang = await _context.KhachHangs.FindAsync(id);
            if (khachHang == null)
                return NotFound(new { message = "Không tìm thấy khách hàng" });

            _context.KhachHangs.Remove(khachHang);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Xóa thành công" });
        }

        // ================= SEARCH =================
        [HttpGet("search/{keyword}")]
        public async Task<IActionResult> Search(string keyword)
        {
            var khachHangs = await _context.KhachHangs
                .Include(x => x.TaiKhoan)
                .Where(k =>
                    k.HoTen.Contains(keyword) ||
                    k.SoDienThoai.Contains(keyword) ||
                    k.DiaChi.Contains(keyword))
                .ToListAsync();

            var result = _mapper.Map<IEnumerable<KhachHangDto>>(khachHangs);
            return Ok(result);
        }
    }
}