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
    [Authorize]
    public class NhaCungCapController : ControllerBase
    {
        private readonly IGenericRepository<NhaCungCap> _repository;
        private readonly IGenericRepository<SanPham> _spRepository;
        private readonly IGenericRepository<PhieuNhap> _pnRepository;
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;

        public NhaCungCapController(
            IGenericRepository<NhaCungCap> repository,
            IGenericRepository<SanPham> spRepository,
            IGenericRepository<PhieuNhap> pnRepository,
            ApplicationDbContext context,
            IMapper mapper)
        {
            _repository = repository;
            _spRepository = spRepository;
            _pnRepository = pnRepository;
            _context = context;
            _mapper = mapper;
        }

        // ================= GET ALL =================
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAll()
        {
            var data = await _repository.GetAllAsync();
            return Ok(_mapper.Map<IEnumerable<NhaCungCapDto>>(data));
        }

        // ================= GET BY ID =================
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetById(int id)
        {
            var entity = await _repository.GetByIdAsync(id);
            if (entity == null)
                return NotFound("Không tìm thấy nhà cung cấp");

            return Ok(_mapper.Map<NhaCungCapDto>(entity));
        }

        // ================= CREATE =================
        [HttpPost]
        [Authorize(Roles = "Admin,NhanVien")]
        public async Task<IActionResult> Create(NhaCungCapCreateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // Kiểm tra trùng SDT (nếu có SDT)
            if (!string.IsNullOrEmpty(dto.SDT))
            {
                var existed = await _repository.FindAsync(x => x.SDT == dto.SDT);
                if (existed.Any())
                    return BadRequest("Số điện thoại đã tồn tại");
            }

            var entity = _mapper.Map<NhaCungCap>(dto);
            
            // Thêm vào DbContext và lưu để lấy ID tự sinh
            _context.NhaCungCaps.Add(entity);
            await _context.SaveChangesAsync();

            // Return về object vừa tạo để frontend lấy MaNCC
            var result = _mapper.Map<NhaCungCapDto>(entity);
            return Ok(result);
        }

        // ================= UPDATE =================
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(int id, NhaCungCapUpdateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var entity = await _repository.GetByIdAsync(id);
            if (entity == null)
                return NotFound("Không tìm thấy nhà cung cấp");

            _mapper.Map(dto, entity);
            await _repository.UpdateAsync(entity);

            return Ok(new { message = "Cập nhật thành công" });
        }

        // ================= DELETE =================
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var entity = await _repository.GetByIdAsync(id);
            if (entity == null)
                return NotFound("Không tìm thấy nhà cung cấp");

            var hasProduct = await _spRepository.FindAsync(s => s.MaNCC == id);
            if (hasProduct.Any())
                return BadRequest("Không thể xóa vì đang có sản phẩm");

            var hasPhieuNhap = await _pnRepository.FindAsync(p => p.MaNCC == id);
            if (hasPhieuNhap.Any())
                return BadRequest("Không thể xóa vì đã có lịch sử nhập");

            await _repository.DeleteAsync(id);
            return Ok(new { message = "Xóa thành công" });
        }

        // ================= LỊCH SỬ NHẬP =================
        [HttpGet("{id}/lich-su-nhap")]
        [Authorize(Roles = "Admin,NhanVien")]
        public async Task<IActionResult> GetLichSuNhap(
            int id,
            [FromQuery] DateTime? tuNgay,
            [FromQuery] DateTime? denNgay)
        {
            var exists = await _repository.GetByIdAsync(id);
            if (exists == null)
                return NotFound("Nhà cung cấp không tồn tại");

            var phieuNhaps = await _pnRepository.FindAsync(p => p.MaNCC == id);

            if (tuNgay.HasValue)
                phieuNhaps = phieuNhaps.Where(p => p.NgayNhap >= tuNgay.Value);

            if (denNgay.HasValue)
                phieuNhaps = phieuNhaps.Where(p => p.NgayNhap <= denNgay.Value);

            return Ok(_mapper.Map<IEnumerable<PhieuNhapDto>>(phieuNhaps));
        }

        // ================= THỐNG KÊ =================
        [HttpGet("thong-ke")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ThongKe()
        {
            var nccs = await _repository.GetAllAsync();
            var sanPhams = await _spRepository.GetAllAsync();
            var phieuNhaps = await _pnRepository.GetAllAsync();

            var result = nccs.Select(ncc => new
            {
                maNCC = ncc.MaNCC,
                tenNCC = ncc.TenNCC,
                soSanPham = sanPhams.Count(s => s.MaNCC == ncc.MaNCC),
                tongNhap = phieuNhaps
                            .Where(p => p.MaNCC == ncc.MaNCC)
                            .Sum(p => p.TongTien ?? 0),
                soLanNhap = phieuNhaps.Count(p => p.MaNCC == ncc.MaNCC),
                trangThai = ncc.TrangThai ? "Đang hợp tác" : "Ngừng hợp tác"
            });

            return Ok(result);
        }

        // ================= SEARCH =================
        [HttpGet("tim-kiem")]
        [AllowAnonymous]
        public async Task<IActionResult> Search(string keyword)
        {
            if (string.IsNullOrWhiteSpace(keyword))
                return BadRequest("Vui lòng nhập từ khóa");

            var data = await _repository.FindAsync(n =>
                n.TenNCC.Contains(keyword) ||
                n.SDT.Contains(keyword) ||
                n.DiaChi.Contains(keyword));

            return Ok(_mapper.Map<IEnumerable<NhaCungCapDto>>(data));
        }
    }
}