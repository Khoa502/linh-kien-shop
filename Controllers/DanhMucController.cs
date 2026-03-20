using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using AutoMapper;
using BackendAPI.DTOs;
using BackendAPI.Models;
using BackendAPI.Repositories;
using BackendAPI.Data;
using Microsoft.EntityFrameworkCore;

namespace BackendAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DanhMucController : ControllerBase
    {
        private readonly IGenericRepository<DanhMuc> _repository;
        private readonly IGenericRepository<SanPham> _spRepository;
        private readonly IGenericRepository<NhaCungCap> _nccRepository;
        private readonly IMapper _mapper;
        private readonly ApplicationDbContext _context;
    
        public DanhMucController(
            IGenericRepository<DanhMuc> repository,
            IGenericRepository<SanPham> spRepository,
            IGenericRepository<NhaCungCap> nccRepository,
            IMapper mapper,
            ApplicationDbContext context)
        {
            _repository = repository;
            _spRepository = spRepository;
            _nccRepository = nccRepository;
            _mapper = mapper;
            _context = context;
        }

        // ============================
        // LẤY TẤT CẢ DANH MỤC
        // ============================
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAll()
        {
            var danhMucs = await _repository.GetAllAsync();
            var result = _mapper.Map<IEnumerable<DanhMucDto>>(danhMucs);
            return Ok(result);
        }

        // ============================
        // LẤY DANH MỤC THEO ID
        // ============================
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetById(int id)
        {
            var danhMuc = await _repository.GetByIdAsync(id);

            if (danhMuc == null)
                return NotFound(new { message = "Không tìm thấy danh mục" });

            var result = _mapper.Map<DanhMucDto>(danhMuc);
            return Ok(result);
        }

        // ============================
        // LẤY SẢN PHẨM THEO DANH MỤC
        // ============================
        [HttpGet("{id}/san-pham")]
        [AllowAnonymous]
        public async Task<IActionResult> GetSanPhamByDanhMuc(int id)
        {
            var sanPhams = await _context.SanPhams
                .Include(s => s.DanhMuc)
                .Include(s => s.NhaCungCap)
                .Where(s => s.MaLoai == id)
                .ToListAsync();

            var result = _mapper.Map<IEnumerable<SanPhamDto>>(sanPhams);
            return Ok(result);
        }

        // ============================
        // TẠO DANH MỤC
        // ============================
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create([FromBody] DanhMucCreateDto createDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var danhMuc = _mapper.Map<DanhMuc>(createDto);
            var result = await _repository.AddAsync(danhMuc);

            var resultDto = _mapper.Map<DanhMucDto>(result);

            return CreatedAtAction(nameof(GetById),
                new { id = result.MaLoai },
                resultDto);
        }

        // ============================
        // CẬP NHẬT DANH MỤC
        // ============================
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(int id, [FromBody] DanhMucUpdateDto updateDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var danhMuc = await _repository.GetByIdAsync(id);

            if (danhMuc == null)
                return NotFound(new { message = "Không tìm thấy danh mục" });

            _mapper.Map(updateDto, danhMuc);
            await _repository.UpdateAsync(danhMuc);

            return Ok(new { message = "Cập nhật thành công" });
        }

        // ============================
        // XÓA DANH MỤC
        // ============================
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var danhMuc = await _repository.GetByIdAsync(id);

            if (danhMuc == null)
                return NotFound(new { message = "Không tìm thấy danh mục" });

            var sanPhams = await _spRepository.FindAsync(s => s.MaLoai == id);

            if (sanPhams.Any())
                return BadRequest(new
                {
                    message = "Không thể xóa danh mục đang có sản phẩm"
                });

            await _repository.DeleteAsync(id);

            return Ok(new { message = "Xóa thành công" });
        }

        // ============================
        // THỐNG KÊ
        // ============================
        [HttpGet("thong-ke")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ThongKe()
        {
            var danhMucs = await _repository.GetAllAsync();
            var thongKe = new List<object>();

            foreach (var dm in danhMucs)
            {
                var sanPhams = await _spRepository.FindAsync(s => s.MaLoai == dm.MaLoai);

                thongKe.Add(new
                {
                    maLoai = dm.MaLoai,
                    tenLoai = dm.TenLoai,
                    soSanPham = sanPhams.Count(),
                    tongTonKho = sanPhams.Sum(s => s.SoLuongTon ?? 0)
                });
            }

            return Ok(thongKe);
        }
    }
}