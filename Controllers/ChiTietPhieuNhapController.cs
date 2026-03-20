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
    [Authorize(Roles = "Admin,NhanVien")]
    public class ChiTietPhieuNhapController : ControllerBase
    {
        private readonly IGenericRepository<ChiTietPhieuNhap> _repository;
        private readonly IGenericRepository<PhieuNhap> _pnRepository;
        private readonly IGenericRepository<SanPham> _spRepository;
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;

        public ChiTietPhieuNhapController(
            IGenericRepository<ChiTietPhieuNhap> repository,
            IGenericRepository<PhieuNhap> pnRepository,
            IGenericRepository<SanPham> spRepository,
            ApplicationDbContext context,
            IMapper mapper)
        {
            _repository = repository;
            _pnRepository = pnRepository;
            _spRepository = spRepository;
            _context = context;
            _mapper = mapper;
        }

        // ================= GET ALL =================
    [HttpGet]
public async Task<IActionResult> GetAll()
{
    var data = await (
        from ct in _context.ChiTietPhieuNhaps
        join sp in _context.SanPhams
            on ct.MaSP equals sp.MaSP
        select new ChiTietPhieuNhapDto
        {
            MaCTPN = ct.MaCTPN,
            MaPN = ct.MaPN,
            MaSP = ct.MaSP,
            TenSP = sp.TenSP,     // LẤY TRỰC TIẾP TỪ JOIN
            SoLuong = ct.SoLuong,
            DonGiaNhap = ct.DonGiaNhap,
            ThanhTien = (ct.SoLuong ?? 0) * (ct.DonGiaNhap ?? 0) // ✅ Tính toán từ code
        }
    ).ToListAsync();

    return Ok(data);
}

        // ================= CREATE =================
        [HttpPost]
        public async Task<IActionResult> Create(ChiTietPhieuNhapCreateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (!dto.MaPN.HasValue)
                return BadRequest("Mã phiếu nhập không được để trống");
            
            if (dto.SoLuong <= 0 || dto.DonGiaNhap <= 0)
                return BadRequest("Số lượng và đơn giá phải > 0");

            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                var phieuNhap = await _pnRepository.GetByIdAsync(dto.MaPN.Value);
                if (phieuNhap == null)
                    return BadRequest("Phiếu nhập không tồn tại");

                var sanPham = await _spRepository.GetByIdAsync(dto.MaSP);
                if (sanPham == null)
                    return BadRequest("Sản phẩm không tồn tại");

                var entity = _mapper.Map<ChiTietPhieuNhap>(dto);
                entity.ThanhTien = dto.SoLuong * dto.DonGiaNhap;

                await _repository.AddAsync(entity);

                // Cập nhật tồn kho
                sanPham.SoLuongTon += dto.SoLuong ?? 0;
                sanPham.GiaNhap = dto.DonGiaNhap;
                await _spRepository.UpdateAsync(sanPham);

                // Cập nhật tổng tiền phiếu nhập
                await CapNhatTongTien(dto.MaPN.Value);

                await transaction.CommitAsync();

                return Ok(new { message = "Thêm thành công" });
            }
            catch
            {
                await transaction.RollbackAsync();
                return StatusCode(500, "Có lỗi xảy ra");
            }
        }

        // ================= UPDATE =================
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, ChiTietPhieuNhapUpdateDto dto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                var entity = await _repository.GetByIdAsync(id);
                if (entity == null)
                    return NotFound("Không tìm thấy chi tiết");

                var soLuongCu = entity.SoLuong ?? 0;
                var maSPCu = entity.MaSP;

                if (dto.SoLuong <= 0 || dto.DonGiaNhap <= 0)
                    return BadRequest("Số lượng và đơn giá phải > 0");

                _mapper.Map(dto, entity);
                entity.ThanhTien = entity.SoLuong * entity.DonGiaNhap;

                await _repository.UpdateAsync(entity);

                // Nếu đổi sản phẩm
                if (maSPCu != entity.MaSP)
                {
                    var spCu = await _spRepository.GetByIdAsync(maSPCu);
                    if (spCu != null)
                    {
                        spCu.SoLuongTon -= soLuongCu;
                        await _spRepository.UpdateAsync(spCu);
                    }

                    var spMoi = await _spRepository.GetByIdAsync(entity.MaSP);
                    if (spMoi != null)
                    {
                        spMoi.SoLuongTon += entity.SoLuong ?? 0;
                        await _spRepository.UpdateAsync(spMoi);
                    }
                }
                else
                {
                    var sp = await _spRepository.GetByIdAsync(entity.MaSP);
                    if (sp != null)
                    {
                        var chenhLech = (entity.SoLuong ?? 0) - soLuongCu;
                        sp.SoLuongTon += chenhLech;

                        if (sp.SoLuongTon < 0)
                            return BadRequest("Tồn kho không đủ");

                        await _spRepository.UpdateAsync(sp);
                    }
                }

                await CapNhatTongTien(entity.MaPN);

                await transaction.CommitAsync();

                return Ok(new { message = "Cập nhật thành công" });
            }
            catch
            {
                await transaction.RollbackAsync();
                return StatusCode(500, "Có lỗi xảy ra");
            }
        }

        // ================= DELETE =================
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                var entity = await _repository.GetByIdAsync(id);
                if (entity == null)
                    return NotFound("Không tìm thấy");

                var sp = await _spRepository.GetByIdAsync(entity.MaSP);
                if (sp != null)
                {
                    sp.SoLuongTon -= entity.SoLuong ?? 0;

                    if (sp.SoLuongTon < 0)
                        return BadRequest("Tồn kho không hợp lệ");

                    await _spRepository.UpdateAsync(sp);
                }

                await _repository.DeleteAsync(id);
                await CapNhatTongTien(entity.MaPN);

                await transaction.CommitAsync();

                return Ok(new { message = "Xóa thành công" });
            }
            catch
            {
                await transaction.RollbackAsync();
                return StatusCode(500, "Có lỗi xảy ra");
            }
        }

        // ================= PRIVATE =================
        private async Task CapNhatTongTien(int maPN)
        {
            var phieuNhap = await _pnRepository.GetByIdAsync(maPN);
            if (phieuNhap == null) return;

            var chiTiets = await _repository.FindAsync(c => c.MaPN == maPN);
            // ✅ Tính toán ThanhTien từ code thay vì từ DB
            phieuNhap.TongTien = chiTiets.Sum(c => (c.SoLuong ?? 0) * (c.DonGiaNhap ?? 0));

            await _pnRepository.UpdateAsync(phieuNhap);
        }
    }
}