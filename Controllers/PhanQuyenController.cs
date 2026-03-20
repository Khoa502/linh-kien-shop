using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using AutoMapper;
using BackendAPI.DTOs;
using BackendAPI.Models;
using BackendAPI.Repositories;

namespace BackendAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class PhanQuyenController : ControllerBase
    {
        private readonly IGenericRepository<PhanQuyen> _repository;
        private readonly IGenericRepository<TaiKhoan> _tkRepository;
        private readonly IMapper _mapper;

        public PhanQuyenController(
            IGenericRepository<PhanQuyen> repository,
            IGenericRepository<TaiKhoan> tkRepository,
            IMapper mapper)
        {
            _repository = repository;
            _tkRepository = tkRepository;
            _mapper = mapper;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var phanQuyens = await _repository.GetAllAsync();
            var result = _mapper.Map<IEnumerable<PhanQuyenDto>>(phanQuyens);
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var phanQuyen = await _repository.GetByIdAsync(id);
            if (phanQuyen == null)
                return NotFound(new { message = "Không tìm thấy phân quyền" });

            var result = _mapper.Map<PhanQuyenDto>(phanQuyen);
            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] PhanQuyenCreateDto createDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // Kiểm tra tên quyền đã tồn tại chưa
            var existing = await _repository.FindAsync(p => p.TenQuyen == createDto.TenQuyen);
            if (existing.Any())
                return BadRequest(new { message = "Tên quyền đã tồn tại" });

            var phanQuyen = _mapper.Map<PhanQuyen>(createDto);
            var result = await _repository.AddAsync(phanQuyen);
            var resultDto = _mapper.Map<PhanQuyenDto>(result);
            
            return CreatedAtAction(nameof(GetById), new { id = result.ID }, resultDto);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] PhanQuyenUpdateDto updateDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var phanQuyen = await _repository.GetByIdAsync(id);
            if (phanQuyen == null)
                return NotFound(new { message = "Không tìm thấy phân quyền" });

            // Kiểm tra tên quyền đã tồn tại chưa (trừ chính nó)
            var existing = await _repository.FindAsync(p => 
                p.TenQuyen == updateDto.TenQuyen && p.ID != id);
            if (existing.Any())
                return BadRequest(new { message = "Tên quyền đã tồn tại" });

            _mapper.Map(updateDto, phanQuyen);
            await _repository.UpdateAsync(phanQuyen);
            
            return Ok(new { message = "Cập nhật thành công" });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var phanQuyen = await _repository.GetByIdAsync(id);
            if (phanQuyen == null)
                return NotFound(new { message = "Không tìm thấy phân quyền" });

            // Kiểm tra có tài khoản nào đang dùng quyền này không
            var taiKhoans = await _tkRepository.FindAsync(t => t.RoleID == id);
            if (taiKhoans.Any())
                return BadRequest(new { message = "Không thể xóa quyền đang được sử dụng" });

            await _repository.DeleteAsync(id);
            return Ok(new { message = "Xóa thành công" });
        }

        [HttpGet("{id}/tai-khoan")]
        public async Task<IActionResult> GetTaiKhoanByQuyen(int id)
        {
            var taiKhoans = await _tkRepository.FindAsync(t => t.RoleID == id);
            var result = taiKhoans.Select(t => new
            {
                t.ID,
                t.TenDangNhap,
                t.TrangThai,
                t.NgayTao
            });
            return Ok(result);
        }

        [HttpGet("thong-ke")]
        public async Task<IActionResult> ThongKe()
        {
            var phanQuyens = await _repository.GetAllAsync();
            var thongKe = new List<object>();

            foreach (var pq in phanQuyens)
            {
                var taiKhoans = await _tkRepository.FindAsync(t => t.RoleID == pq.ID);
                thongKe.Add(new
                {
                    maQuyen = pq.ID,
                    tenQuyen = pq.TenQuyen,
                    soTaiKhoan = taiKhoans.Count(),
                    taiKhoanHoatDong = taiKhoans.Count(t => t.TrangThai),
                    taiKhoanKhoa = taiKhoans.Count(t => !t.TrangThai)
                });
            }

            return Ok(thongKe);
        }

        [HttpGet("mac-dinh")]
        public async Task<IActionResult> GetQuyenMacDinh()
        {
            var quyenList = new[] { "Admin", "NhanVien", "KhachHang" };
            var result = new List<PhanQuyenDto>();

            foreach (var tenQuyen in quyenList)
            {
                var quyen = await _repository.FindAsync(q => q.TenQuyen == tenQuyen);
                if (quyen.Any())
                {
                    result.Add(_mapper.Map<PhanQuyenDto>(quyen.First()));
                }
            }

            return Ok(result);
        }
    }
}