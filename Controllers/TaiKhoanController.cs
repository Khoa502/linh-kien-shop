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
    [Authorize(Roles = "Admin")] // 🔥 Mặc định toàn bộ là Admin
    public class TaiKhoanController : ControllerBase
    {
        private readonly IGenericRepository<TaiKhoan> _repository;
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;

        public TaiKhoanController(
            IGenericRepository<TaiKhoan> repository,
            ApplicationDbContext context,
            IMapper mapper)
        {
            _repository = repository;
            _context = context;
            _mapper = mapper;
        }

        // ================= GET ALL =================
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var query = from tk in _context.TaiKhoans
                        join pq in _context.PhanQuyens on tk.RoleID equals pq.ID into pqGroup
                        from pq in pqGroup.DefaultIfEmpty()
                        join kh in _context.KhachHangs on tk.ID equals kh.TaiKhoanID into khGroup
                        from kh in khGroup.DefaultIfEmpty()
                        join nv in _context.NhanViens on tk.ID equals nv.TaiKhoanID into nvGroup
                        from nv in nvGroup.DefaultIfEmpty()
                        select new
                        {
                            id = tk.ID,
                            tenDangNhap = tk.TenDangNhap,
                            email = tk.Email ?? "",
                            hoTen = kh != null ? kh.HoTen ?? "" : (nv != null ? nv.HoTen ?? "" : ""),
                            ngayTao = tk.NgayTao,
                            soDienThoai = kh != null ? kh.SoDienThoai ?? "" : (nv != null ? nv.SoDienThoai ?? "" : ""),
                            trangThai = tk.TrangThai,
                            roleID = tk.RoleID,
                            tenQuyen = pq != null ? pq.TenQuyen : null
                        };

            var data = await query.ToListAsync();

            return Ok(data);
        }

        // ================= GET BY ID =================
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var query = from tk in _context.TaiKhoans.Where(x => x.ID == id)
                        join pq in _context.PhanQuyens on tk.RoleID equals pq.ID into pqGroup
                        from pq in pqGroup.DefaultIfEmpty()
                        join kh in _context.KhachHangs on tk.ID equals kh.TaiKhoanID into khGroup
                        from kh in khGroup.DefaultIfEmpty()
                        join nv in _context.NhanViens on tk.ID equals nv.TaiKhoanID into nvGroup
                        from nv in nvGroup.DefaultIfEmpty()
                        select new
                        {
                            id = tk.ID,
                            tenDangNhap = tk.TenDangNhap,
                            email = tk.Email ?? "",
                            hoTen = kh != null ? kh.HoTen ?? "" : (nv != null ? nv.HoTen ?? "" : ""),
                            soDienThoai = kh != null ? kh.SoDienThoai ?? "" : (nv != null ? nv.SoDienThoai ?? "" : ""),
                            ngayTao = tk.NgayTao,
                            trangThai = tk.TrangThai,
                            roleID = tk.RoleID,
                            tenQuyen = pq != null ? pq.TenQuyen : null
                        };

            var data = await query.FirstOrDefaultAsync();

            if (data == null)
                return NotFound();

            return Ok(data);
        }

        // ================= CREATE =================
        [HttpPost]
        [AllowAnonymous] // ✅ CHO PHÉP ĐĂNG KÝ KHÔNG CẦN TOKEN
        public async Task<IActionResult> Create([FromBody] TaiKhoanCreateDto createDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                // 1. Kiểm tra tên đăng nhập đã tồn tại chưa
                var existed = await _context.TaiKhoans
                    .FirstOrDefaultAsync(t => t.TenDangNhap == createDto.TenDangNhap);
                
                if (existed != null)
                    return BadRequest(new { error = "Tên đăng nhập đã tồn tại" });

                // 2. Tạo TaiKhoan mới
                var taiKhoan = new TaiKhoan
                {
                    TenDangNhap = createDto.TenDangNhap,
                    MatKhau = createDto.MatKhau,
                    TrangThai = createDto.TrangThai,
                    RoleID = 3, // ✅ Mặc định là Khách hàng (RoleID = 3)
                    NgayTao = DateTime.Now
                };

                _context.TaiKhoans.Add(taiKhoan);
                await _context.SaveChangesAsync(); // Lưu để lấy ID tự động

                // 3. Tạo KhachHang mới và liên kết với TaiKhoan
                var khachHang = new KhachHang
                {
                    HoTen = string.IsNullOrEmpty(createDto.HoTen) ? createDto.TenDangNhap : createDto.HoTen,
                    SoDienThoai = createDto.SoDienThoai ?? "",
                    DiaChi = createDto.DiaChi ?? "",
                    DiemTichLuy = 0,
                    TongNo = 0,
                    TaiKhoanID = taiKhoan.ID // ✅ Gán khóa ngoại - QUAN TRỌNG!
                };

                _context.KhachHangs.Add(khachHang);
                await _context.SaveChangesAsync(); // Lưu KhachHang

                // 4. Commit transaction khi cả 2 đều thành công
                await transaction.CommitAsync();

                // 5. Trả về kết quả
                return Ok(new
                {
                    taiKhoanId = taiKhoan.ID,
                    khachHangId = khachHang.MaKH,
                    tenDangNhap = taiKhoan.TenDangNhap,
                    hoTen = khachHang.HoTen,
                    message = "Tạo tài khoản thành công"
                });
            }
            catch (Exception ex)
            {
                // ✅ Rollback tự động nếu có lỗi
                await transaction.RollbackAsync();
                return BadRequest(new { error = ex.Message });
            }
        }

        // ================= UPDATE =================
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] TaiKhoanUpdateDto updateDto)
        {
            var taiKhoan = await _repository.GetByIdAsync(id);

            if (taiKhoan == null)
                return NotFound();

            _mapper.Map(updateDto, taiKhoan);
            await _repository.UpdateAsync(taiKhoan);

            return NoContent();
        }

        // ================= DELETE =================
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var taiKhoan = await _repository.GetByIdAsync(id);

            if (taiKhoan == null)
                return NotFound();

            await _repository.DeleteAsync(id);

            return NoContent();
        }
    }
}
