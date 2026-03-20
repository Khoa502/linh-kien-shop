using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using AutoMapper;
using BackendAPI.DTOs;
using BackendAPI.Models;
using BackendAPI.Repositories;
using BackendAPI.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace BackendAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SanPhamController : ControllerBase
    {
        private readonly IGenericRepository<SanPham> _repository;
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;
        private readonly ILogger<SanPhamController> _logger;

        public SanPhamController(
            IGenericRepository<SanPham> repository,
            ApplicationDbContext context,
            IMapper mapper,
            ILogger<SanPhamController> logger)
        {
            _repository = repository;
            _context = context;
            _mapper = mapper;
            _logger = logger;
        }

        // =========================
        // GET ALL
        // =========================
[HttpGet]
        [AllowAnonymous]
        [ProducesResponseType(typeof(List<SanPhamDto>), 200)]
        public async Task<IActionResult> GetSanPham()
        {
            try
            {
                _logger.LogInformation("Fetching all SanPham");

                // Include navigation properties để lấy TenLoai và TenNCC
                var sanPhams = await _context.SanPhams
                    .Include(x => x.DanhMuc)
                    .Include(x => x.NhaCungCap)
                    .ToListAsync();

                var result = _mapper.Map<List<SanPhamDto>>(sanPhams);
                foreach (var item in result)
        {
            item.TrungBinhSao = _context.DanhGiaSanPhams.Where(dg => dg.MaSP == item.MaSP).Any() 
                ? Math.Round(_context.DanhGiaSanPhams.Where(dg => dg.MaSP == item.MaSP).Average(dg => (double)dg.SoSao), 1) 
                : 0;
        }
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching SanPham: {Message}", ex.Message);
                return StatusCode(500, new { message = ex.Message });
            }
        }

        // =========================
        // GET FEATURED PRODUCTS
        // =========================
        [HttpGet("featured")]
        [AllowAnonymous]
        public async Task<IActionResult> GetFeatured([FromQuery] int limit = 8)
        {
            var sanPhams = await _repository.FindAsync(x => x.TrangThai == true);

            var result = sanPhams
                .OrderByDescending(x => x.MaSP)
                .Take(limit);

            var dto = _mapper.Map<IEnumerable<SanPhamDto>>(result);

            return Ok(dto);
        }

        // =========================
        // GET BY ID
        // =========================
[HttpGet("{id}")]
        [AllowAnonymous]
        [ProducesResponseType(typeof(SanPhamDto), 200)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> GetById(int id)
        {
            var sanPham = await _repository.GetByIdAsync(id);

            if (sanPham == null)
                return NotFound(new { message = "Không tìm thấy sản phẩm" });

            var result = _mapper.Map<SanPhamDto>(sanPham);
            result.TrungBinhSao = _context.DanhGiaSanPhams.Where(dg => dg.MaSP == id).Any()
        ? Math.Round(_context.DanhGiaSanPhams.Where(dg => dg.MaSP == id).Average(dg => (double)dg.SoSao), 1)
        : 0;
            return Ok(result);
        }

        // =========================
        // CREATE
        // =========================
        [HttpPost]
        [Authorize(Roles = "Admin,NhanVien")]
        public async Task<IActionResult> Create([FromBody] SanPhamCreateDto createDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                // 1. MAP DỮ LIỆU
                var sanPham = _mapper.Map<SanPham>(createDto);

                // 2. GÁN GIÁ TRỊ MẶC ĐỊNH CHO CÁC TRƯỜNG BẮT BUỘC
                sanPham.TrangThai = true; // Mặc định kích hoạt
                
                // Xử lý MaLinhKien - nếu null thì tạo mã tự động
                sanPham.MaLinhKien = string.IsNullOrEmpty(sanPham.MaLinhKien) 
                    ? "SP" + DateTime.Now.Ticks 
                    : sanPham.MaLinhKien;

                // Xử lý DonViTinh - mặc định là "Cái"
                sanPham.DonViTinh = string.IsNullOrEmpty(sanPham.DonViTinh) 
                    ? "Cái" 
                    : sanPham.DonViTinh;

                // Xử lý MaLoai - nếu null hoặc 0 thì gán mặc định
                sanPham.MaLoai = sanPham.MaLoai == null || sanPham.MaLoai == 0 
                    ? 1 
                    : sanPham.MaLoai;

                // Xử lý MaNCC - nếu null hoặc 0 thì gán mặc định
                sanPham.MaNCC = sanPham.MaNCC == null || sanPham.MaNCC == 0 
                    ? 1 
                    : sanPham.MaNCC;

                // Xử lý các trường số - mặc định là 0
                sanPham.GiaNhap = sanPham.GiaNhap ?? 0;
                sanPham.GiaBan = sanPham.GiaBan ?? 0;
                sanPham.SoLuongTon = sanPham.SoLuongTon ?? 0;

                // Xử lý các trường text - mặc định là chuỗi rỗng
                sanPham.MoTa = sanPham.MoTa ?? "";
                sanPham.ThongSoKyThuat = sanPham.ThongSoKyThuat ?? "";
                sanPham.HinhAnh = sanPham.HinhAnh ?? "";

                var result = await _repository.AddAsync(sanPham);
                var resultDto = _mapper.Map<SanPhamDto>(result);

                return CreatedAtAction(nameof(GetById),
                    new { id = result.MaSP },
                    resultDto);
            }
            catch (DbUpdateException ex)
            {
                // 3. BẮT LỖI INNER EXCEPTION TỪ DATABASE
                var errorMessage = ex.InnerException?.Message ?? ex.Message;
                return BadRequest(new { error = $"Lỗi database: {errorMessage}" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        // =========================
        // UPDATE
        // =========================
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,NhanVien")]
        public async Task<IActionResult> Update(int id, [FromBody] SanPhamUpdateDto updateDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var sanPham = await _repository.GetByIdAsync(id);

            if (sanPham == null)
                return NotFound(new { message = "Không tìm thấy sản phẩm" });

            _mapper.Map(updateDto, sanPham);
            await _repository.UpdateAsync(sanPham);

            return Ok(new { message = "Cập nhật thành công" });
        }

        // =========================
        // DELETE
        // =========================
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var sanPham = await _repository.GetByIdAsync(id);

            if (sanPham == null)
                return NotFound(new { message = "Không tìm thấy sản phẩm" });

            await _repository.DeleteAsync(id);

            return Ok(new { message = "Xóa thành công" });
        }

        // =========================
        // GET BY DANH MUC
        // =========================
[HttpGet("danh-muc/{maLoai}")]
        [AllowAnonymous]
        [ProducesResponseType(typeof(IEnumerable<SanPhamDto>), 200)]
        public async Task<IActionResult> GetByDanhMuc(int maLoai)
        {
            var sanPhams = await _repository.FindAsync(s => s.MaLoai == maLoai);
            var result = _mapper.Map<IEnumerable<SanPhamDto>>(sanPhams);

            return Ok(result);
        }

// =========================
// SEARCH
// =========================
[HttpGet("tim-kiem")]
        [AllowAnonymous]
        [ProducesResponseType(typeof(IEnumerable<SanPhamDto>), 200)]
        [ProducesResponseType(400)]
        public async Task<IActionResult> Search([FromQuery] string keyword)
        {
            if (string.IsNullOrEmpty(keyword))
                return BadRequest(new { message = "Keyword không được để trống" });

            var sanPhams = await _repository.FindAsync(s =>
                s.TenSP.Contains(keyword) ||
                s.MaLinhKien.Contains(keyword) ||
                s.MoTa.Contains(keyword));

            var result = _mapper.Map<IEnumerable<SanPhamDto>>(sanPhams);

            return Ok(result);
        }

        // =========================
        // SEARCH FOR CHATBOT (FIXED)
        // =========================
        [HttpGet("search")]
        [AllowAnonymous]
        [ProducesResponseType(typeof(List<object>), 200)]
        [ProducesResponseType(400)]
        public async Task<IActionResult> SearchProducts([FromQuery] string keyword)
        {
            if (string.IsNullOrWhiteSpace(keyword))
                return BadRequest("Keyword is required");

            var results = await _context.SanPhams
                .Where(p => p.TenSP.Contains(keyword))
                .Take(5)
                .Select(p => new 
                { 
                    maSP = p.MaSP,
                    tenSP = p.TenSP,
                    giaBan = p.GiaBan,
                    hinhAnh = p.HinhAnh 
                })
                .ToListAsync();

            return Ok(results);
        }

        // =========================
        // GET LINH KIEN - All active (TrangThai == true)
        // =========================
[HttpGet("LinhKien")]
        [AllowAnonymous]
        [ProducesResponseType(typeof(IEnumerable<SanPhamDto>), 200)]
        public async Task<IActionResult> GetLinhKien()
        {
            var sanPhams = await _repository.FindAsync(x => x.TrangThai == true);
            var result = _mapper.Map<IEnumerable<SanPhamDto>>(sanPhams);
            return Ok(result);
        }

        // =========================
        // TĂNG TỒN KHO
        // =========================
        [HttpPut("{id}/tang-ton")]
        [Authorize(Roles = "Admin,NhanVien")]
        public async Task<IActionResult> TangTonKho(int id, [FromQuery] int soLuong)
        {
            if (soLuong <= 0)
                return BadRequest(new { message = "Số lượng phải lớn hơn 0" });

            var sanPham = await _repository.GetByIdAsync(id);

            if (sanPham == null)
                return NotFound(new { message = "Không tìm thấy sản phẩm" });

            sanPham.SoLuongTon += soLuong;

            await _repository.UpdateAsync(sanPham);

            return Ok(new
            {
                message = "Cập nhật tồn kho thành công",
                soLuongMoi = sanPham.SoLuongTon
            });
        }

        // =========================
        // CHATBOT SEARCH
        // =========================
        [HttpGet("chatbot-search")]
        [AllowAnonymous]
        [ProducesResponseType(typeof(List<object>), 200)]
        public async Task<IActionResult> ChatbotSearch(
            [FromQuery] string? keyword, 
            [FromQuery] string? ram, 
            [FromQuery] string? storage, 
            [FromQuery] decimal? maxPrice)
        {
            var query = _context.SanPhams
                .Where(s => s.TrangThai == true)
                .AsQueryable();

            if (!string.IsNullOrEmpty(keyword))
                query = query.Where(s => s.TenSP.Contains(keyword));

            if (!string.IsNullOrEmpty(ram))
                query = query.Where(s => s.TenSP.Contains(ram));

            if (!string.IsNullOrEmpty(storage))
                query = query.Where(s => s.TenSP.Contains(storage));

            if (maxPrice.HasValue)
                query = query.Where(s => s.GiaBan <= maxPrice.Value);

            var results = await query
                .Select(s => new {
                    maSP = s.MaSP,
                    tenSP = s.TenSP,
                    giaBan = s.GiaBan,
                    hinhAnh = s.HinhAnh
                })
                .Take(5)
                .ToListAsync();

            return Ok(results);
        }
    }
}