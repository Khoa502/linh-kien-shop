using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BackendAPI.Data;
using BackendAPI.DTOs;
using BackendAPI.Models;
using System.Security.Claims;

namespace BackendAPI.Controllers
{
    [Route("api/[controller]")]
    [Route("api/giohang")]
    [ApiController]
    [AllowAnonymous]
    [IgnoreAntiforgeryToken]
    public class GioHangController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public GioHangController(ApplicationDbContext context)
        {
            _context = context;
        }

        // ========================= THÊM VÀO GIỎ HÀNG =========================
        /// <summary>
        /// Thêm sản phẩm vào giỏ hàng
        /// </summary>
        [HttpPost("them")]
        public async Task<IActionResult> Them([FromBody] ThemGioHangRequestDto dto)
        {
            // Validate DanhSachSanPham
            if (dto.DanhSachSanPham == null || !dto.DanhSachSanPham.Any())
            {
                return BadRequest(new { message = "Danh sách sản phẩm không được để trống" });
            }

            // Get MaKH from JWT claims
            var maKHClaim = User.FindFirst("MaKH")?.Value;
            if (string.IsNullOrEmpty(maKHClaim) || !int.TryParse(maKHClaim, out int maKH))
            {
                return Unauthorized(new { message = "Vui lòng đăng nhập để thêm vào giỏ hàng" });
            }

            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                // Get or create cart for this customer
                var gioHang = await _context.GioHangs
                    .Include(g => g.GioHangChiTiets)
                    .FirstOrDefaultAsync(g => g.MaKH == maKH);

                if (gioHang == null)
                {
                    // Create new cart
                    gioHang = new GioHang
                    {
                        MaKH = maKH,
                        NgayTao = DateTime.Now,
                        NgayCapNhat = DateTime.Now
                    };
                    _context.GioHangs.Add(gioHang);
                    await _context.SaveChangesAsync();
                }
                else
                {
                    gioHang.NgayCapNhat = DateTime.Now;
                }

                // Get product IDs
                var productIds = dto.DanhSachSanPham.Select(x => x.SanPhamId).ToList();
                var products = await _context.SanPhams
                    .Where(s => productIds.Contains(s.MaSP))
                    .ToListAsync();

                // Add or update items in cart
                foreach (var item in dto.DanhSachSanPham)
                {
                    var sp = products.FirstOrDefault(s => s.MaSP == item.SanPhamId);
                    if (sp == null)
                    {
                        continue; // Skip invalid products
                    }

                    // Check if product already in cart
                    var existingItem = gioHang.GioHangChiTiets?
                        .FirstOrDefault(x => x.SanPhamId == item.SanPhamId);

                    if (existingItem != null)
                    {
                        // Update quantity
                        existingItem.SoLuong += item.SoLuong;
                        existingItem.DonGia = sp.GiaBan ?? 0;
                    }
                    else
                    {
                        // Add new item
                        var chiTiet = new GioHangChiTiet
                        {
                            GioHangId = gioHang.Id,
                            SanPhamId = item.SanPhamId,
                            SoLuong = item.SoLuong,
                            DonGia = sp.GiaBan ?? 0
                        };
                        _context.GioHangChiTiets.Add(chiTiet);
                    }
                }

                await _context.SaveChangesAsync();

                // Calculate total
                var updatedCart = await _context.GioHangs
                    .Include(g => g.GioHangChiTiets)
                    .ThenInclude(ct => ct.SanPham)
                    .FirstOrDefaultAsync(g => g.Id == gioHang.Id);

                decimal tongTien = 0;
                int soLuongSanPham = 0;
                var chiTietList = new List<GioHangChiTietResponseDto>();

                if (updatedCart != null && updatedCart.GioHangChiTiets != null)
                {
                    foreach (var ct in updatedCart.GioHangChiTiets)
                    {
                        tongTien += ct.DonGia * ct.SoLuong;
                        soLuongSanPham += ct.SoLuong;
                        chiTietList.Add(new GioHangChiTietResponseDto
                        {
                            SanPhamId = ct.SanPhamId,
                            TenSanPham = ct.SanPham?.TenSP ?? "",
                            HinhAnh = ct.SanPham?.HinhAnh ?? "",
                            SoLuong = ct.SoLuong,
                            DonGia = ct.DonGia,
                            ThanhTien = ct.DonGia * ct.SoLuong
                        });
                    }
                }

                await transaction.CommitAsync();

                return Ok(new GioHangResponseDto
                {
                    GioHangId = gioHang.Id,
                    MaKH = maKH,
                    TongTien = tongTien,
                    SoLuongSanPham = soLuongSanPham,
                    ChiTiet = chiTietList,
                    Message = "Thêm vào giỏ hàng thành công"
                });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, new { message = $"Lỗi: {ex.Message}" });
            }
        }

        // ========================= LẤY GIỎ HÀNG =========================
        /// <summary>
        /// Lấy giỏ hàng của khách hàng
        /// </summary>
        [HttpGet("lay-gio-hang")]
        [HttpGet("")]
        public async Task<IActionResult> LayGioHang()
        {
            // Get MaKH from JWT claims
            var maKHClaim = User.FindFirst("MaKH")?.Value;
            if (string.IsNullOrEmpty(maKHClaim) || !int.TryParse(maKHClaim, out int maKH))
            {
                return Unauthorized(new { message = "Vui lòng đăng nhập để xem giỏ hàng" });
            }

            try
            {
                var gioHang = await _context.GioHangs
                    .Include(g => g.GioHangChiTiets)
                    .ThenInclude(ct => ct.SanPham)
                    .FirstOrDefaultAsync(g => g.MaKH == maKH);

                if (gioHang == null)
                {
                    return Ok(new GioHangResponseDto
                    {
                        GioHangId = 0,
                        MaKH = maKH,
                        TongTien = 0,
                        SoLuongSanPham = 0,
                        ChiTiet = new List<GioHangChiTietResponseDto>(),
                        Message = "Giỏ hàng trống"
                    });
                }

                decimal tongTien = 0;
                int soLuongSanPham = 0;
                var chiTietList = new List<GioHangChiTietResponseDto>();

                if (gioHang.GioHangChiTiets != null)
                {
                    foreach (var ct in gioHang.GioHangChiTiets)
                    {
                        tongTien += ct.DonGia * ct.SoLuong;
                        soLuongSanPham += ct.SoLuong;
                        chiTietList.Add(new GioHangChiTietResponseDto
                        {
                            SanPhamId = ct.SanPhamId,
                            TenSanPham = ct.SanPham?.TenSP ?? "",
                            HinhAnh = ct.SanPham?.HinhAnh ?? "",
                            SoLuong = ct.SoLuong,
                            DonGia = ct.DonGia,
                            ThanhTien = ct.DonGia * ct.SoLuong
                        });
                    }
                }

                return Ok(new GioHangResponseDto
                {
                    GioHangId = gioHang.Id,
                    MaKH = maKH,
                    TongTien = tongTien,
                    SoLuongSanPham = soLuongSanPham,
                    ChiTiet = chiTietList,
                    Message = "Lấy giỏ hàng thành công"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Lỗi: {ex.Message}" });
            }
        }

        // ========================= XÓA SẢN PHẨM KHỎI GIỎ HÀNG =========================
        /// <summary>
        /// Xóa sản phẩm khỏi giỏ hàng
        /// </summary>
        [HttpDelete("xoa/{sanPhamId}")]
        public async Task<IActionResult> Xoa(int sanPhamId)
        {
            // Get MaKH from JWT claims
            var maKHClaim = User.FindFirst("MaKH")?.Value;
            if (string.IsNullOrEmpty(maKHClaim) || !int.TryParse(maKHClaim, out int maKH))
            {
                return Unauthorized(new { message = "Vui lòng đăng nhập" });
            }

            try
            {
                var gioHang = await _context.GioHangs
                    .Include(g => g.GioHangChiTiets)
                    .FirstOrDefaultAsync(g => g.MaKH == maKH);

                if (gioHang == null)
                {
                    return NotFound(new { message = "Không tìm thấy giỏ hàng" });
                }

                var chiTiet = gioHang.GioHangChiTiets?
                    .FirstOrDefault(x => x.SanPhamId == sanPhamId);

                if (chiTiet == null)
                {
                    return NotFound(new { message = "Không tìm thấy sản phẩm trong giỏ hàng" });
                }

                _context.GioHangChiTiets.Remove(chiTiet);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Xóa sản phẩm khỏi giỏ hàng thành công" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Lỗi: {ex.Message}" });
            }
        }

        // ========================= CẬP NHẬT SỐ LƯỢNG =========================
        /// <summary>
        /// Cập nhật số lượng sản phẩm trong giỏ hàng
        /// </summary>
        [HttpPut("cap-nhat")]
        public async Task<IActionResult> CapNhat([FromBody] CapNhatGioHangDto dto)
        {
            // Get MaKH from JWT claims
            var maKHClaim = User.FindFirst("MaKH")?.Value;
            if (string.IsNullOrEmpty(maKHClaim) || !int.TryParse(maKHClaim, out int maKH))
            {
                return Unauthorized(new { message = "Vui lòng đăng nhập" });
            }

            try
            {
                var gioHang = await _context.GioHangs
                    .Include(g => g.GioHangChiTiets)
                    .FirstOrDefaultAsync(g => g.MaKH == maKH);

                if (gioHang == null)
                {
                    return NotFound(new { message = "Không tìm thấy giỏ hàng" });
                }

                var chiTiet = gioHang.GioHangChiTiets?
                    .FirstOrDefault(x => x.SanPhamId == dto.SanPhamId);

                if (chiTiet == null)
                {
                    return NotFound(new { message = "Không tìm thấy sản phẩm trong giỏ hàng" });
                }

                if (dto.SoLuong <= 0)
                {
                    _context.GioHangChiTiets.Remove(chiTiet);
                }
                else
                {
                    chiTiet.SoLuong = dto.SoLuong;
                }

                await _context.SaveChangesAsync();

                return Ok(new { message = "Cập nhật giỏ hàng thành công" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Lỗi: {ex.Message}" });
            }
        }

        // ========================= XÓA TOÀN BỘ GIỎ HÀNG =========================
        /// <summary>
        /// Xóa toàn bộ giỏ hàng
        /// </summary>
        [HttpDelete("xoa-tat-ca")]
        public async Task<IActionResult> XoaTatCa()
        {
            // Get MaKH from JWT claims
            var maKHClaim = User.FindFirst("MaKH")?.Value;
            if (string.IsNullOrEmpty(maKHClaim) || !int.TryParse(maKHClaim, out int maKH))
            {
                return Unauthorized(new { message = "Vui lòng đăng nhập" });
            }

            try
            {
                var gioHang = await _context.GioHangs
                    .Include(g => g.GioHangChiTiets)
                    .FirstOrDefaultAsync(g => g.MaKH == maKH);

                if (gioHang == null)
                {
                    return NotFound(new { message = "Không tìm thấy giỏ hàng" });
                }

                _context.GioHangChiTiets.RemoveRange(gioHang.GioHangChiTiets);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Xóa giỏ hàng thành công" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Lỗi: {ex.Message}" });
            }
        }
    }
}

