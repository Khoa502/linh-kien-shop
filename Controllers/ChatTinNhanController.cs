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
    public class ChatTinNhanController : ControllerBase
    {
        private readonly IGenericRepository<ChatTinNhan> _repository;
        private readonly IGenericRepository<ChatHoiThoai> _htRepository;
        private readonly IMapper _mapper;

        public ChatTinNhanController(
            IGenericRepository<ChatTinNhan> repository,
            IGenericRepository<ChatHoiThoai> htRepository,
            IMapper mapper)
        {
            _repository = repository;
            _htRepository = htRepository;
            _mapper = mapper;
        }

        [HttpGet]
        [Authorize(Roles = "Admin,NhanVien")]
        public async Task<IActionResult> GetAll()
        {
            var tinNhans = await _repository.GetAllAsync();
            var result = _mapper.Map<IEnumerable<ChatTinNhanDto>>(tinNhans.OrderByDescending(t => t.ThoiGian));
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var tinNhan = await _repository.GetByIdAsync(id);
            if (tinNhan == null)
                return NotFound(new { message = "Không tìm thấy tin nhắn" });

            var result = _mapper.Map<ChatTinNhanDto>(tinNhan);
            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ChatTinNhanCreateDto createDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // Kiểm tra hội thoại còn hoạt động không
            var hoiThoai = await _htRepository.GetByIdAsync(createDto.ChatID.Value);
            if (hoiThoai == null)
                return NotFound(new { message = "Không tìm thấy hội thoại" });

            if (hoiThoai.TrangThai != "Đang hoạt động")
                return BadRequest(new { message = "Hội thoại đã kết thúc" });

            var tinNhan = _mapper.Map<ChatTinNhan>(createDto);
            var result = await _repository.AddAsync(tinNhan);
            var resultDto = _mapper.Map<ChatTinNhanDto>(result);
            
            return CreatedAtAction(nameof(GetById), new { id = result.ID }, resultDto);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(int id, [FromBody] ChatTinNhanCreateDto updateDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var tinNhan = await _repository.GetByIdAsync(id);
            if (tinNhan == null)
                return NotFound(new { message = "Không tìm thấy tin nhắn" });

            _mapper.Map(updateDto, tinNhan);
            await _repository.UpdateAsync(tinNhan);
            
            return Ok(new { message = "Cập nhật thành công" });
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var tinNhan = await _repository.GetByIdAsync(id);
            if (tinNhan == null)
                return NotFound(new { message = "Không tìm thấy tin nhắn" });

            await _repository.DeleteAsync(id);
            return Ok(new { message = "Xóa thành công" });
        }

        [HttpGet("hoi-thoai/{chatID}")]
        public async Task<IActionResult> GetByHoiThoai(int chatID)
        {
            var tinNhans = await _repository.FindAsync(t => t.ChatID == chatID);
            var result = _mapper.Map<IEnumerable<ChatTinNhanDto>>(tinNhans.OrderBy(t => t.ThoiGian));
            return Ok(result);
        }

        [HttpGet("tim-kiem")]
        public async Task<IActionResult> Search([FromQuery] string keyword)
        {
            var tinNhans = await _repository.FindAsync(t => 
                t.NoiDung.Contains(keyword) || 
                t.NguoiGui.Contains(keyword));
            
            var result = _mapper.Map<IEnumerable<ChatTinNhanDto>>(tinNhans.OrderByDescending(t => t.ThoiGian));
            return Ok(result);
        }

        [HttpGet("thong-ke/hoi-thoai/{chatID}")]
        public async Task<IActionResult> ThongKeHoiThoai(int chatID)
        {
            var tinNhans = await _repository.FindAsync(t => t.ChatID == chatID);
            
            var thongKe = new
            {
                tongTinNhan = tinNhans.Count(),
                tuKhachHang = tinNhans.Count(t => t.NguoiGui == "Khách hàng"),
                tuNhanVien = tinNhans.Count(t => t.NguoiGui == "Nhân viên"),
                thoiGianDau = tinNhans.Min(t => t.ThoiGian),
                thoiGianCuoi = tinNhans.Max(t => t.ThoiGian)
            };

            return Ok(thongKe);
        }

        [HttpGet("moi-nhat")]
        public async Task<IActionResult> GetMoiNhat([FromQuery] int limit = 50)
        {
            var tinNhans = await _repository.GetAllAsync();
            var result = _mapper.Map<IEnumerable<ChatTinNhanDto>>(
                tinNhans.OrderByDescending(t => t.ThoiGian).Take(limit)
            );
            return Ok(result);
        }
    }
}