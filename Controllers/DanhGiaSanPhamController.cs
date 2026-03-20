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
    public class DanhGiaSanPhamController : ControllerBase
    {
        private readonly IGenericRepository<DanhGiaSanPham> _repository;
        private readonly IGenericRepository<SanPham> _spRepository;
        private readonly IGenericRepository<KhachHang> _khRepository;
        private readonly IMapper _mapper;

        public DanhGiaSanPhamController(
            IGenericRepository<DanhGiaSanPham> repository,
            IGenericRepository<SanPham> spRepository,
            IGenericRepository<KhachHang> khRepository,
            IMapper mapper)
        {
            _repository = repository;
            _spRepository = spRepository;
            _khRepository = khRepository;
            _mapper = mapper;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAll()
        {
            var danhGias = await _repository.GetAllAsync();
            var result = _mapper.Map<IEnumerable<DanhGiaSanPhamDto>>(danhGias);
            return Ok(result);
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetById(int id)
        {
            var danhGia = await _repository.GetByIdAsync(id);
            if (danhGia == null)
                return NotFound(new { message = "Không tìm thấy đánh giá" });

            var result = _mapper.Map<DanhGiaSanPhamDto>(danhGia);
            return Ok(result);
        }

        [HttpPost]
        [Authorize(Roles = "KhachHang")]
        public async Task<IActionResult> Create([FromBody] DanhGiaSanPhamCreateDto createDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // Kiểm tra đã đánh giá chưa
            var existing = await _repository.FindAsync(d => 
                d.MaSP == createDto.MaSP && d.MaKH == createDto.MaKH);
            
            if (existing.Any())
                return BadRequest(new { message = "Bạn đã đánh giá sản phẩm này rồi" });

            var danhGia = _mapper.Map<DanhGiaSanPham>(createDto);
            var result = await _repository.AddAsync(danhGia);
            
            // Cập nhật điểm tích lũy cho khách hàng
            var khachHang = await _khRepository.GetByIdAsync(createDto.MaKH.Value);
            if (khachHang != null)
            {
                khachHang.DiemTichLuy += 10; // Thưởng 10 điểm khi đánh giá
                await _khRepository.UpdateAsync(khachHang);
            }

            var resultDto = _mapper.Map<DanhGiaSanPhamDto>(result);
            return CreatedAtAction(nameof(GetById), new { id = result.ID }, resultDto);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "KhachHang,Admin")]
        public async Task<IActionResult> Update(int id, [FromBody] DanhGiaSanPhamUpdateDto updateDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var danhGia = await _repository.GetByIdAsync(id);
            if (danhGia == null)
                return NotFound(new { message = "Không tìm thấy đánh giá" });

            _mapper.Map(updateDto, danhGia);
            await _repository.UpdateAsync(danhGia);
            
            return Ok(new { message = "Cập nhật thành công" });
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var danhGia = await _repository.GetByIdAsync(id);
            if (danhGia == null)
                return NotFound(new { message = "Không tìm thấy đánh giá" });

            await _repository.DeleteAsync(id);
            return Ok(new { message = "Xóa thành công" });
        }

        [HttpGet("san-pham/{maSP}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetBySanPham(int maSP)
        {
            var danhGias = await _repository.FindAsync(d => d.MaSP == maSP);
            var result = _mapper.Map<IEnumerable<DanhGiaSanPhamDto>>(danhGias);
            
            var danhGiaList = result.ToList();
            var tongSao = danhGiaList.Sum(d => d.SoSao ?? 0);
            var trungBinh = danhGiaList.Any() ? (double)tongSao / danhGiaList.Count : 0;

            return Ok(new
            {
                tongDanhGia = danhGiaList.Count,
                trungBinhSao = Math.Round(trungBinh, 1),
                chiTiet = danhGiaList
            });
        }

        [HttpGet("khach-hang/{maKH}")]
        public async Task<IActionResult> GetByKhachHang(int maKH)
        {
            var danhGias = await _repository.FindAsync(d => d.MaKH == maKH);
            var result = _mapper.Map<IEnumerable<DanhGiaSanPhamDto>>(danhGias);
            return Ok(result);
        }

        [HttpGet("thong-ke/san-pham/{maSP}")]
        [AllowAnonymous]
        public async Task<IActionResult> ThongKeSanPham(int maSP)
        {
            var danhGias = await _repository.FindAsync(d => d.MaSP == maSP);
            
            var thongKe = new
            {
                tongLuotDanhGia = danhGias.Count(),
                phanBoSao = Enumerable.Range(1, 5).Select(i => new
                {
                    sao = i,
                    soLuong = danhGias.Count(d => d.SoSao == i),
                    tiLe = danhGias.Any() ? (double)danhGias.Count(d => d.SoSao == i) / danhGias.Count() * 100 : 0
                }),
                trungBinhSao = danhGias.Any() ? danhGias.Average(d => d.SoSao) : 0
            };

            return Ok(thongKe);
        }

        [HttpGet("top-rated")]
        [AllowAnonymous]
        public async Task<IActionResult> GetTopRated([FromQuery] int limit = 10)
        {
            var danhGias = await _repository.GetAllAsync();
            var topSanPham = danhGias
                .GroupBy(d => d.MaSP)
                .Select(g => new
                {
                    maSP = g.Key,
                    tenSP = g.First().SanPham?.TenSP,
                    tongDanhGia = g.Count(),
                    trungBinhSao = g.Average(d => d.SoSao)
                })
                .OrderByDescending(x => x.trungBinhSao)
                .ThenByDescending(x => x.tongDanhGia)
                .Take(limit);

            return Ok(topSanPham);
        }
    }
}