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
    public class ChatHoiThoaiController : ControllerBase
    {
        private readonly IGenericRepository<ChatHoiThoai> _repository;
        private readonly IGenericRepository<ChatTinNhan> _ctRepository;
        private readonly IGenericRepository<KhachHang> _khRepository;
        private readonly IMapper _mapper;

        public ChatHoiThoaiController(
            IGenericRepository<ChatHoiThoai> repository,
            IGenericRepository<ChatTinNhan> ctRepository,
            IGenericRepository<KhachHang> khRepository,
            IMapper mapper)
        {
            _repository = repository;
            _ctRepository = ctRepository;
            _khRepository = khRepository;
            _mapper = mapper;
        }

      [HttpGet]
[Authorize(Roles = "Admin,NhanVien")]
public async Task<IActionResult> GetAll()
{
    var hoiThoais = await _repository.GetAllAsync();

    foreach (var ht in hoiThoais)
    {
        if (ht.MaKH.HasValue)
        {
            ht.KhachHang = await _khRepository.GetByIdAsync(ht.MaKH.Value);
        }

        var tinNhans = await _ctRepository.FindAsync(t => t.ChatID == ht.ID);
        ht.ChatTinNhans = tinNhans.ToList();
    }

    var result = _mapper.Map<IEnumerable<ChatHoiThoaiDto>>(hoiThoais);
    return Ok(result);
}

      [HttpGet("{id}")]
public async Task<IActionResult> GetById(int id)
{
    var hoiThoai = await _repository.GetByIdAsync(id);
    if (hoiThoai == null)
        return NotFound(new { message = "Không tìm thấy hội thoại" });

    if (hoiThoai.MaKH.HasValue)
    {
        hoiThoai.KhachHang = await _khRepository.GetByIdAsync(hoiThoai.MaKH.Value);
    }

    var tinNhans = await _ctRepository.FindAsync(t => t.ChatID == id);
    hoiThoai.ChatTinNhans = tinNhans.ToList();

    var result = _mapper.Map<ChatHoiThoaiDto>(hoiThoai);
    return Ok(result);
}

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ChatHoiThoaiCreateDto createDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // Kiểm tra đã có hội thoại chưa
            var existing = await _repository.FindAsync(c => 
                c.MaKH == createDto.MaKH && c.TrangThai == "Đang hoạt động");
            
            if (existing.Any())
                return BadRequest(new { message = "Khách hàng đã có hội thoại đang hoạt động" });

            var hoiThoai = _mapper.Map<ChatHoiThoai>(createDto);
            var result = await _repository.AddAsync(hoiThoai);
            var resultDto = _mapper.Map<ChatHoiThoaiDto>(result);
            
            return CreatedAtAction(nameof(GetById), new { id = result.ID }, resultDto);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] ChatHoiThoaiUpdateDto updateDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var hoiThoai = await _repository.GetByIdAsync(id);
            if (hoiThoai == null)
                return NotFound(new { message = "Không tìm thấy hội thoại" });

            _mapper.Map(updateDto, hoiThoai);
            await _repository.UpdateAsync(hoiThoai);
            
            return Ok(new { message = "Cập nhật thành công" });
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var hoiThoai = await _repository.GetByIdAsync(id);
            if (hoiThoai == null)
                return NotFound(new { message = "Không tìm thấy hội thoại" });

            // Xóa tất cả tin nhắn trong hội thoại
            var tinNhans = await _ctRepository.FindAsync(t => t.ChatID == id);
            foreach (var tn in tinNhans)
            {
                await _ctRepository.DeleteAsync(tn.ID);
            }

            await _repository.DeleteAsync(id);
            return Ok(new { message = "Xóa thành công" });
        }

      [HttpGet("khach-hang/{maKH}")]
public async Task<IActionResult> GetByKhachHang(int maKH)
{
    var hoiThoais = await _repository.FindAsync(c => c.MaKH == maKH);

    foreach (var ht in hoiThoais)
    {
        // Load khách hàng
        ht.KhachHang = await _khRepository.GetByIdAsync(maKH);

        // Load tin nhắn
        var tinNhans = await _ctRepository.FindAsync(t => t.ChatID == ht.ID);
        ht.ChatTinNhans = tinNhans.ToList();
    }

    var result = _mapper.Map<IEnumerable<ChatHoiThoaiDto>>(hoiThoais);
    return Ok(result);
}

        [HttpGet("{id}/tin-nhan")]
        public async Task<IActionResult> GetTinNhan(int id)
        {
            var tinNhans = await _ctRepository.FindAsync(t => t.ChatID == id);
            var result = _mapper.Map<IEnumerable<ChatTinNhanDto>>(tinNhans.OrderBy(t => t.ThoiGian));
            return Ok(result);
        }

        [HttpPost("{id}/gui-tin")]
        public async Task<IActionResult> GuiTinNhan(int id, [FromBody] ChatTinNhanCreateDto createDto)
        {
            var hoiThoai = await _repository.GetByIdAsync(id);
            if (hoiThoai == null)
                return NotFound(new { message = "Không tìm thấy hội thoại" });

            if (hoiThoai.TrangThai != "Đang hoạt động")
                return BadRequest(new { message = "Hội thoại đã kết thúc" });

            createDto.ChatID = id;
            var tinNhan = _mapper.Map<ChatTinNhan>(createDto);
            
            var result = await _ctRepository.AddAsync(tinNhan);
            var resultDto = _mapper.Map<ChatTinNhanDto>(result);
            
            return Ok(resultDto);
        }

        [HttpPut("{id}/ket-thuc")]
        public async Task<IActionResult> KetThucHoiThoai(int id)
        {
            var hoiThoai = await _repository.GetByIdAsync(id);
            if (hoiThoai == null)
                return NotFound(new { message = "Không tìm thấy hội thoại" });

            hoiThoai.TrangThai = "Kết thúc";
            await _repository.UpdateAsync(hoiThoai);
            
            return Ok(new { message = "Đã kết thúc hội thoại" });
        }

        [HttpGet("thong-ke")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ThongKe([FromQuery] DateTime? tuNgay, [FromQuery] DateTime? denNgay)
        {
            var hoiThoais = await _repository.GetAllAsync();
            
            if (tuNgay.HasValue)
                hoiThoais = hoiThoais.Where(h => h.NgayBatDau >= tuNgay);
            if (denNgay.HasValue)
                hoiThoais = hoiThoais.Where(h => h.NgayBatDau <= denNgay);

            var thongKe = new
            {
                tongHoiThoai = hoiThoais.Count(),
                dangHoatDong = hoiThoais.Count(h => h.TrangThai == "Đang hoạt động"),
                daKetThuc = hoiThoais.Count(h => h.TrangThai == "Kết thúc"),
                trungBinhTinNhan = hoiThoais.Average(h => h.ChatTinNhans?.Count ?? 0)
            };

            return Ok(thongKe);
        }
    }
}