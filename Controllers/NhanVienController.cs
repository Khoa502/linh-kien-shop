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
    public class NhanVienController : ControllerBase
    {
        private readonly IGenericRepository<NhanVien> _repository;
        private readonly IMapper _mapper;

        public NhanVienController(IGenericRepository<NhanVien> repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var nhanViens = await _repository.GetAllAsync();
            var result = _mapper.Map<IEnumerable<NhanVienDto>>(nhanViens);
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var nhanVien = await _repository.GetByIdAsync(id);
            if (nhanVien == null)
                return NotFound(new { message = "Không tìm thấy nhân viên" });

            var result = _mapper.Map<NhanVienDto>(nhanVien);
            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] NhanVienCreateDto createDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var nhanVien = _mapper.Map<NhanVien>(createDto);
            var result = await _repository.AddAsync(nhanVien);
            var resultDto = _mapper.Map<NhanVienDto>(result);
            
            return CreatedAtAction(nameof(GetById), new { id = result.MaNV }, resultDto);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] NhanVienUpdateDto updateDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var nhanVien = await _repository.GetByIdAsync(id);
            if (nhanVien == null)
                return NotFound(new { message = "Không tìm thấy nhân viên" });

            _mapper.Map(updateDto, nhanVien);
            await _repository.UpdateAsync(nhanVien);
            
            return Ok(new { message = "Cập nhật thành công" });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var nhanVien = await _repository.GetByIdAsync(id);
            if (nhanVien == null)
                return NotFound(new { message = "Không tìm thấy nhân viên" });

            await _repository.DeleteAsync(id);
            return Ok(new { message = "Xóa thành công" });
        }

        [HttpPut("{id}/toggle-status")]
        public async Task<IActionResult> ToggleStatus(int id)
        {
            var nhanVien = await _repository.GetByIdAsync(id);
            if (nhanVien == null)
                return NotFound(new { message = "Không tìm thấy nhân viên" });

            nhanVien.TrangThai = !nhanVien.TrangThai;
            await _repository.UpdateAsync(nhanVien);
            
            return Ok(new { message = $"Đã {(nhanVien.TrangThai ? "kích hoạt" : "vô hiệu")} nhân viên" });
        }
    }
}