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
    [Authorize]
    public class PhuongThucThanhToanController : ControllerBase
    {
        private readonly IGenericRepository<PhuongThucThanhToan> _repository;
        private readonly IMapper _mapper;

        public PhuongThucThanhToanController(
            IGenericRepository<PhuongThucThanhToan> repository,
            IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        // ================= GET ALL =================
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAll()
        {
            var entities = await _repository.GetAllAsync();
            var result = _mapper.Map<IEnumerable<PhuongThucThanhToanDto>>(entities);
            return Ok(result);
        }

        // ================= GET BY ID =================
        [HttpGet("{id:int}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetById(int id)
        {
            var entity = await _repository.GetByIdAsync(id);

            if (entity == null)
                return NotFound(new { message = "Không tìm thấy phương thức thanh toán" });

            var result = _mapper.Map<PhuongThucThanhToanDto>(entity);
            return Ok(result);
        }

        // ================= CREATE =================
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create([FromBody] PhuongThucThanhToanCreateDto createDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var entity = _mapper.Map<PhuongThucThanhToan>(createDto);

            // Mặc định active khi tạo mới
            entity.TrangThai = true;

            var created = await _repository.AddAsync(entity);

            var resultDto = _mapper.Map<PhuongThucThanhToanDto>(created);

            return CreatedAtAction(
                nameof(GetById),
                new { id = created.MaPTTT },
                resultDto
            );
        }

        // ================= UPDATE =================
        [HttpPut("{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(int id, [FromBody] PhuongThucThanhToanUpdateDto updateDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var entity = await _repository.GetByIdAsync(id);

            if (entity == null)
                return NotFound(new { message = "Không tìm thấy phương thức thanh toán" });

            _mapper.Map(updateDto, entity);

            await _repository.UpdateAsync(entity);

            return Ok(new { message = "Cập nhật thành công" });
        }

        // ================= DELETE =================
        [HttpDelete("{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var entity = await _repository.GetByIdAsync(id);

            if (entity == null)
                return NotFound(new { message = "Không tìm thấy phương thức thanh toán" });

            await _repository.DeleteAsync(id);

            return Ok(new { message = "Xóa thành công" });
        }

        // ================= TOGGLE STATUS =================
        [HttpPatch("{id:int}/toggle-status")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ToggleStatus(int id)
        {
            var entity = await _repository.GetByIdAsync(id);

            if (entity == null)
                return NotFound(new { message = "Không tìm thấy phương thức thanh toán" });

            entity.TrangThai = !entity.TrangThai;

            await _repository.UpdateAsync(entity);

            return Ok(new
            {
                message = entity.TrangThai
                    ? "Đã kích hoạt phương thức"
                    : "Đã vô hiệu phương thức"
            });
        }
    }
}