using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using BackendAPI.Data;
using BackendAPI.DTOs;
using BackendAPI.Models;

namespace BackendAPI.Controllers
{
    [Route("api/[controller]")]
    [Route("api/builder")]
    [ApiController]
    [AllowAnonymous]
    [IgnoreAntiforgeryToken]
    public class BuildPCController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public BuildPCController(ApplicationDbContext context)
        {
            _context = context;
        }

        // ========================= GET DANH SÁCH CPUs =========================
        /// <summary>
        /// Lấy danh sách CPU
        /// </summary>
        [HttpGet("cpus")]
        [HttpGet("cpu")]
        public async Task<IActionResult> GetCpus()
        {
            try
            {
                var products = await _context.SanPhams
                    .Where(s => s.LoaiLinhKien == "cpu" && s.TrangThai == true)
                    .Select(s => new BuilderProductDto
                    {
                        Id = s.MaSP,
                        Name = s.TenSP ?? "",
                        Price = s.GiaBan ?? 0,
                        Image = s.HinhAnh ?? "",
                        ComponentType = "cpu"
                    })
                    .ToListAsync();

                return Ok(products);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Lỗi server: {ex.Message}" });
            }
        }

        // ========================= GET DANH SÁCH MAINBOARDS =========================
        /// <summary>
        /// Lấy danh sách Mainboard
        /// </summary>
        [HttpGet("mainboards")]
        [HttpGet("mainboard")]
        public async Task<IActionResult> GetMainboards()
        {
            try
            {
                var products = await _context.SanPhams
                    .Where(s => s.LoaiLinhKien == "mainboard" && s.TrangThai == true)
                    .Select(s => new BuilderProductDto
                    {
                        Id = s.MaSP,
                        Name = s.TenSP ?? "",
                        Price = s.GiaBan ?? 0,
                        Image = s.HinhAnh ?? "",
                        ComponentType = "mainboard"
                    })
                    .ToListAsync();

                return Ok(products);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Lỗi server: {ex.Message}" });
            }
        }

        // ========================= GET DANH SÁCH RAMs =========================
        /// <summary>
        /// Lấy danh sách RAM
        /// </summary>
        [HttpGet("rams")]
        [HttpGet("ram")]
        public async Task<IActionResult> GetRams()
        {
            try
            {
                var products = await _context.SanPhams
                    .Where(s => s.LoaiLinhKien == "ram" && s.TrangThai == true)
                    .Select(s => new BuilderProductDto
                    {
                        Id = s.MaSP,
                        Name = s.TenSP ?? "",
                        Price = s.GiaBan ?? 0,
                        Image = s.HinhAnh ?? "",
                        ComponentType = "ram"
                    })
                    .ToListAsync();

                return Ok(products);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Lỗi server: {ex.Message}" });
            }
        }

        // ========================= GET DANH SÁCH GPUs =========================
        /// <summary>
        /// Lấy danh sách GPU
        /// </summary>
        [HttpGet("gpus")]
        [HttpGet("gpu")]
        public async Task<IActionResult> GetGpus()
        {
            try
            {
                var products = await _context.SanPhams
                    .Where(s => s.LoaiLinhKien == "gpu" && s.TrangThai == true)
                    .Select(s => new BuilderProductDto
                    {
                        Id = s.MaSP,
                        Name = s.TenSP ?? "",
                        Price = s.GiaBan ?? 0,
                        Image = s.HinhAnh ?? "",
                        ComponentType = "gpu"
                    })
                    .ToListAsync();

                return Ok(products);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Lỗi server: {ex.Message}" });
            }
        }

        // ========================= GET DANH SÁCH SSDs =========================
        /// <summary>
        /// Lấy danh sách SSD
        /// </summary>
        [HttpGet("ssds")]
        [HttpGet("ssd")]
        public async Task<IActionResult> GetSsds()
        {
            try
            {
                var products = await _context.SanPhams
                    .Where(s => s.LoaiLinhKien == "ssd" && s.TrangThai == true)
                    .Select(s => new BuilderProductDto
                    {
                        Id = s.MaSP,
                        Name = s.TenSP ?? "",
                        Price = s.GiaBan ?? 0,
                        Image = s.HinhAnh ?? "",
                        ComponentType = "ssd"
                    })
                    .ToListAsync();

                return Ok(products);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Lỗi server: {ex.Message}" });
            }
        }

        // ========================= GET DANH SÁCH PSUs =========================
        /// <summary>
        /// Lấy danh sách PSU
        /// </summary>
        [HttpGet("psus")]
        [HttpGet("psu")]
        public async Task<IActionResult> GetPsus()
        {
            try
            {
                var products = await _context.SanPhams
                    .Where(s => s.LoaiLinhKien == "psu" && s.TrangThai == true)
                    .Select(s => new BuilderProductDto
                    {
                        Id = s.MaSP,
                        Name = s.TenSP ?? "",
                        Price = s.GiaBan ?? 0,
                        Image = s.HinhAnh ?? "",
                        ComponentType = "psu"
                    })
                    .ToListAsync();

                return Ok(products);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Lỗi server: {ex.Message}" });
            }
        }

        // ========================= GET DANH SÁCH CASEs =========================
        /// <summary>
        /// Lấy danh sách Case
        /// </summary>
        [HttpGet("cases")]
        [HttpGet("case")]
        public async Task<IActionResult> GetCases()
        {
            try
            {
                var products = await _context.SanPhams
                    .Where(s => s.LoaiLinhKien == "case" && s.TrangThai == true)
                    .Select(s => new BuilderProductDto
                    {
                        Id = s.MaSP,
                        Name = s.TenSP ?? "",
                        Price = s.GiaBan ?? 0,
                        Image = s.HinhAnh ?? "",
                        ComponentType = "case"
                    })
                    .ToListAsync();

                return Ok(products);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Lỗi server: {ex.Message}" });
            }
        }

        // ========================= GET LINH KIỆN THEO LOẠI (Legacy) =========================
        /// <summary>
        /// Lấy danh sách linh kiện theo loại
        /// </summary>
        /// <param name="loai">cpu, mainboard, ram, gpu, ssd, psu, case</param>
        [HttpGet("linh-kien/{loai}")]
        public async Task<IActionResult> GetLinhKienTheoLoai(string loai)
        {
            try
            {
                // Validate input
                if (string.IsNullOrWhiteSpace(loai))
                {
                    return BadRequest(new { message = "Loại linh kiện không được để trống" });
                }

                var loaiLower = loai.ToLower().Trim();

                // Validate loại linh kiện
                var validLoai = new[] { "cpu", "mainboard", "ram", "gpu", "ssd", "psu", "case", "hdd", "fan", "cooler" };
                if (!validLoai.Contains(loaiLower))
                {
                    return BadRequest(new { message = "Loại linh kiện không hợp lệ. Các loại hợp lệ: cpu, mainboard, ram, gpu, ssd, psu, case" });
                }

                // Query by LoaiLinhKien string
                var sanPhams = await _context.SanPhams
                    .Where(s => s.LoaiLinhKien == loaiLower && s.TrangThai == true)
                    .Select(s => new LinhKienDto
                    {
                        MaSP = s.MaSP,
                        TenSP = s.TenSP ?? "",
                        GiaBan = s.GiaBan ?? 0,
                        HinhAnh = s.HinhAnh ?? "",
                        MoTa = s.MoTa ?? "",
                        SoLuongTon = s.SoLuongTon ?? 0
                    })
                    .ToListAsync();

                // Return empty list if no products found
                return Ok(sanPhams ?? new List<LinhKienDto>());
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Lỗi server: {ex.Message}" });
            }
        }

        // ========================= TÍNH GIÁ CẤU HÌNH =========================
        /// <summary>
        /// Tính tổng giá cấu hình PC
        /// </summary>
        [HttpPost("tinh-gia")]
        public async Task<IActionResult> TinhGia([FromBody] TinhGiaDto dto)
        {
            try
            {
                // Validate: nếu dto là null hoặc tất cả ID đều không có giá trị
                if (dto == null)
                {
                    return BadRequest(new { message = "Dữ liệu không hợp lệ" });
                }

                // Collect all product IDs
                var idsToQuery = new List<int>();
                if (dto.CpuId.HasValue) idsToQuery.Add(dto.CpuId.Value);
                if (dto.MainboardId.HasValue) idsToQuery.Add(dto.MainboardId.Value);
                if (dto.RamId.HasValue) idsToQuery.Add(dto.RamId.Value);
                if (dto.GpuId.HasValue) idsToQuery.Add(dto.GpuId.Value);
                if (dto.SsdId.HasValue) idsToQuery.Add(dto.SsdId.Value);
                if (dto.PsuId.HasValue) idsToQuery.Add(dto.PsuId.Value);
                if (dto.CaseId.HasValue) idsToQuery.Add(dto.CaseId.Value);

                // Validate: không có sản phẩm nào được chọn
                if (idsToQuery.Count == 0)
                {
                    return BadRequest(new { message = "Vui lòng chọn ít nhất một linh kiện" });
                }

                // Query products one by one to avoid any potential CTE issues
                decimal tongTien = 0;
                var chiTiet = new List<ChiTietGiaDto>();

                // Query each product individually to avoid Contains() with list
                if (dto.CpuId.HasValue)
                {
                    var sp = await _context.SanPhams.FirstOrDefaultAsync(s => s.MaSP == dto.CpuId);
                    if (sp != null)
                    {
                        chiTiet.Add(new ChiTietGiaDto
                        {
                            LoaiLinhKien = "CPU - Bộ vi xử lý",
                            TenSanPham = sp.TenSP ?? "",
                            Gia = sp.GiaBan ?? 0
                        });
                        tongTien += sp.GiaBan ?? 0;
                    }
                }

                if (dto.MainboardId.HasValue)
                {
                    var sp = await _context.SanPhams.FirstOrDefaultAsync(s => s.MaSP == dto.MainboardId);
                    if (sp != null)
                    {
                        chiTiet.Add(new ChiTietGiaDto
                        {
                            LoaiLinhKien = "Mainboard - Bo mạch chủ",
                            TenSanPham = sp.TenSP ?? "",
                            Gia = sp.GiaBan ?? 0
                        });
                        tongTien += sp.GiaBan ?? 0;
                    }
                }

                if (dto.RamId.HasValue)
                {
                    var sp = await _context.SanPhams.FirstOrDefaultAsync(s => s.MaSP == dto.RamId);
                    if (sp != null)
                    {
                        chiTiet.Add(new ChiTietGiaDto
                        {
                            LoaiLinhKien = "RAM - Bộ nhớ",
                            TenSanPham = sp.TenSP ?? "",
                            Gia = sp.GiaBan ?? 0
                        });
                        tongTien += sp.GiaBan ?? 0;
                    }
                }

                if (dto.GpuId.HasValue)
                {
                    var sp = await _context.SanPhams.FirstOrDefaultAsync(s => s.MaSP == dto.GpuId);
                    if (sp != null)
                    {
                        chiTiet.Add(new ChiTietGiaDto
                        {
                            LoaiLinhKien = "GPU - Card màn hình",
                            TenSanPham = sp.TenSP ?? "",
                            Gia = sp.GiaBan ?? 0
                        });
                        tongTien += sp.GiaBan ?? 0;
                    }
                }

                if (dto.SsdId.HasValue)
                {
                    var sp = await _context.SanPhams.FirstOrDefaultAsync(s => s.MaSP == dto.SsdId);
                    if (sp != null)
                    {
                        chiTiet.Add(new ChiTietGiaDto
                        {
                            LoaiLinhKien = "SSD - Ổ lưu trữ",
                            TenSanPham = sp.TenSP ?? "",
                            Gia = sp.GiaBan ?? 0
                        });
                        tongTien += sp.GiaBan ?? 0;
                    }
                }

                if (dto.PsuId.HasValue)
                {
                    var sp = await _context.SanPhams.FirstOrDefaultAsync(s => s.MaSP == dto.PsuId);
                    if (sp != null)
                    {
                        chiTiet.Add(new ChiTietGiaDto
                        {
                            LoaiLinhKien = "PSU - Nguồn máy",
                            TenSanPham = sp.TenSP ?? "",
                            Gia = sp.GiaBan ?? 0
                        });
                        tongTien += sp.GiaBan ?? 0;
                    }
                }

                if (dto.CaseId.HasValue)
                {
                    var sp = await _context.SanPhams.FirstOrDefaultAsync(s => s.MaSP == dto.CaseId);
                    if (sp != null)
                    {
                        chiTiet.Add(new ChiTietGiaDto
                        {
                            LoaiLinhKien = "Case - Vỏ máy",
                            TenSanPham = sp.TenSP ?? "",
                            Gia = sp.GiaBan ?? 0
                        });
                        tongTien += sp.GiaBan ?? 0;
                    }
                }

                return Ok(new TinhGiaResultDto
                {
                    TongTien = tongTien,
                    ChiTiet = chiTiet
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Lỗi server: {ex.Message}" });
            }
        }

        // ========================= LƯU CẤU HÌNH PC (JWT Auth) =========================
        /// <summary>
        /// Lưu cấu hình PC - Lấy MaKH từ JWT token
        /// </summary>
        [HttpPost("luu-cau-hinh")]
        public async Task<IActionResult> LuuCauHinh([FromBody] LuuCauHinhRequestDto dto)
        {
            // Handle null dto
            if (dto == null)
            {
                return BadRequest(new { message = "Dữ liệu không hợp lệ" });
            }

            // Validate TenCauHinh - allow default if not provided
            if (string.IsNullOrWhiteSpace(dto.TenCauHinh))
            {
                dto.TenCauHinh = "Cấu hình PC " + DateTime.Now.ToString("yyyy-MM-dd HH:mm");
            }

            // Validate DanhSachLinhKien
            if (dto.DanhSachLinhKien == null || !dto.DanhSachLinhKien.Any())
            {
                return BadRequest(new { message = "Danh sách linh kiện không được để trống" });
            }

            // Get MaKH from JWT claims
            var maKHClaim = User.FindFirst("MaKH")?.Value;
            int maKH;
            if (string.IsNullOrEmpty(maKHClaim) || !int.TryParse(maKHClaim, out maKH))
            {
                // Try to get from dto if not in JWT
                if (dto.MaKH.HasValue)
                {
                    maKH = dto.MaKH.Value;
                }
                else
                {
                    return Unauthorized(new { message = "Vui lòng đăng nhập để lưu cấu hình" });
                }
            }

            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                // Query products one by one to avoid any potential CTE issues with Contains()
                var products = new List<SanPham>();
                foreach (var item in dto.DanhSachLinhKien)
                {
                    if (item.SanPhamId <= 0) continue;
                    
                    var sp = await _context.SanPhams.FirstOrDefaultAsync(s => s.MaSP == item.SanPhamId);
                    if (sp != null)
                    {
                        products.Add(sp);
                    }
                }

                // Calculate total price
                decimal tongTien = 0;
                foreach (var item in dto.DanhSachLinhKien)
                {
                    if (item.SanPhamId <= 0) continue;
                    
                    var sp = products.FirstOrDefault(s => s.MaSP == item.SanPhamId);
                    if (sp != null)
                    {
                        var soLuong = item.SoLuong > 0 ? item.SoLuong : 1;
                        tongTien += (sp.GiaBan ?? 0) * soLuong;
                    }
                }

                // Use provided TongTien or calculate if not provided
                if (dto.TongTien > 0)
                {
                    tongTien = dto.TongTien;
                }

                // Create PC configuration
                var cauHinh = new CauHinhPC
                {
                    TenCauHinh = dto.TenCauHinh,
                    MaKH = maKH,
                    TongTien = tongTien,
                    NgayTao = DateTime.Now
                };

                _context.CauHinhPCs.Add(cauHinh);
                await _context.SaveChangesAsync();

                // Create configuration details
                foreach (var item in dto.DanhSachLinhKien)
                {
                    if (item.SanPhamId <= 0) continue;
                    
                    var sp = products.FirstOrDefault(s => s.MaSP == item.SanPhamId);
                    if (sp != null)
                    {
                        var chiTiet = new ChiTietCauHinhPC
                        {
                            CauHinhPCId = cauHinh.Id,
                            SanPhamId = item.SanPhamId,
                            LoaiLinhKien = sp.LoaiLinhKien ?? "",
                            Gia = sp.GiaBan ?? 0,
                            SoLuong = item.SoLuong > 0 ? item.SoLuong : 1
                        };
                        _context.ChiTietCauHinhPCs.Add(chiTiet);
                    }
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new
                {
                    message = "Lưu cấu hình thành công",
                    cauHinhId = cauHinh.Id,
                    tongTien = tongTien
                });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, new { message = $"Lỗi: {ex.Message}" });
            }
        }

        // ========================= THÊM VÀO GIỎ HÀNG (JWT Auth) =========================
        /// <summary>
        /// Thêm sản phẩm vào giỏ hàng của người dùng hiện tại
        /// </summary>
        [HttpPost("them-gio-hang")]
        public async Task<IActionResult> ThemGioHang([FromBody] ThemGioHangRequestDto dto)
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

        // ========================= ĐẶT HÀNG TỪ CẤU HÌNH =========================
        /// <summary>
        /// Đặt hàng từ cấu hình PC
        /// </summary>
        [HttpPost("dat-hang")]
        public async Task<IActionResult> DatHang([FromBody] DatHangDto dto)
        {
            if (dto.ChiTiet == null || !dto.ChiTiet.Any())
            {
                return BadRequest(new { message = "Danh sách sản phẩm không được để trống" });
            }

            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                // Lấy thông tin sản phẩm
                var productIds = dto.ChiTiet.Select(c => c.SanPhamId).ToList();
                var products = await _context.SanPhams
                    .Where(s => productIds.Contains(s.MaSP))
                    .ToListAsync();

                // Tính tổng tiền
                decimal tongTien = 0;
                foreach (var item in dto.ChiTiet)
                {
                    var sp = products.FirstOrDefault(s => s.MaSP == item.SanPhamId);
                    if (sp != null)
                    {
                        tongTien += (sp.GiaBan ?? 0) * item.SoLuong;
                    }
                }

                // Tạo hóa đơn
                var hoaDon = new HoaDon
                {
                    MaHoaDon = "HD" + DateTime.Now.ToString("yyyyMMddHHmmss"),
                    MaKH = dto.MaKH,
                    MaNV = dto.MaNV,
                    NgayBan = DateTime.Now,
                    TongTien = tongTien,
                    GiamGia = 0,
                    ThanhTien = tongTien,
                    HinhThucThanhToan = dto.HinhThucThanhToan ?? "Tiền mặt",
                    GhiChu = dto.GhiChu,
                    TrangThai = "Chờ thanh toán"
                };

                _context.HoaDons.Add(hoaDon);
                await _context.SaveChangesAsync();

                // Tạo chi tiết hóa đơn
                foreach (var item in dto.ChiTiet)
                {
                    var sp = products.FirstOrDefault(s => s.MaSP == item.SanPhamId);
                    if (sp != null)
                    {
                        var chiTiet = new ChiTietHoaDon
                        {
                            MaHD = hoaDon.MaHD,
                            MaSP = item.SanPhamId,
                            SoLuong = item.SoLuong,
                            DonGia = sp.GiaBan ?? 0
                        };
                        _context.ChiTietHoaDons.Add(chiTiet);

                        // Giảm số lượng tồn
                        sp.SoLuongTon = (sp.SoLuongTon ?? 0) - item.SoLuong;
                    }
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new DatHangResultDto
                {
                    MaHD = hoaDon.MaHD,
                    MaHoaDon = hoaDon.MaHoaDon,
                    TongTien = tongTien,
                    Message = "Đặt hàng thành công!"
                });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return BadRequest(new { message = $"Lỗi: {ex.Message}" });
            }
        }

        // ========================= LẤY TẤT CẢ CẤU HÌNH =========================
        /// <summary>
        /// Lấy danh sách tất cả cấu hình PC (API công khai)
        /// </summary>
        [HttpGet("cau-hinh")]
        public async Task<IActionResult> GetAllCauHinh()
        {
            try
            {
                var cauHinhs = await _context.CauHinhPCs
                    .Include(c => c.ChiTietCauHinhPCs)
                        .ThenInclude(ct => ct.SanPham)
                    .OrderByDescending(c => c.NgayTao)
                    .ToListAsync();

                // Always return a valid JSON array, never null
                if (cauHinhs == null || cauHinhs.Count == 0)
                {
                    return Ok(new List<object>());
                }

                var result = new List<object>();
                foreach (var c in cauHinhs)
                {
                    var chiTietList = new List<object>();
                    if (c.ChiTietCauHinhPCs != null)
                    {
                        foreach (var ct in c.ChiTietCauHinhPCs)
                        {
                            chiTietList.Add(new
                            {
                                id = ct.Id,
                                cauHinhPCId = ct.CauHinhPCId,
                                sanPhamId = ct.SanPhamId,
                                loaiLinhKien = ct.LoaiLinhKien,
                                gia = ct.Gia,
                                soLuong = ct.SoLuong,
                                sanPham = ct.SanPham != null ? new
                                {
                                    maSP = ct.SanPham.MaSP,
                                    tenSanPham = ct.SanPham.TenSP,
                                    gia = ct.SanPham.GiaBan,
                                    hinhAnh = ct.SanPham.HinhAnh,
                                    moTa = ct.SanPham.MoTa
                                } : null
                            });
                        }
                    }
                    result.Add(new
                    {
                        id = c.Id,
                        tenCauHinh = c.TenCauHinh,
                        maKH = c.MaKH,
                        tongTien = c.TongTien,
                        ngayTao = c.NgayTao,
                        chiTietCauHinhs = chiTietList
                    });
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Lỗi server: {ex.Message}" });
            }
        }

        // ========================= LẤY CẤU HÌNH CỦA KHÁCH HÀNG =========================
        /// <summary>
        /// Lấy danh sách cấu hình đã lưu của khách hàng
        /// </summary>
        [HttpGet("cau-hinh/{maKH}")]
        public async Task<IActionResult> GetCauHinhByKhachHang(int maKH)
        {
            try
            {
                var cauHinhs = await _context.CauHinhPCs
                    .Include(c => c.ChiTietCauHinhPCs)
                        .ThenInclude(ct => ct.SanPham)
                    .Where(c => c.MaKH == maKH)
                    .OrderByDescending(c => c.NgayTao)
                    .ToListAsync();

                var result = cauHinhs.Select(c => new
                {
                    c.Id,
                    c.TenCauHinh,
                    c.MaKH,
                    c.TongTien,
                    c.NgayTao,
                    ChiTietCauHinhPCs = c.ChiTietCauHinhPCs.Select(ct => new
                    {
                        ct.Id,
                        ct.CauHinhPCId,
                        ct.SanPhamId,
                        ct.LoaiLinhKien,
                        ct.Gia,
                        ct.SoLuong,
                        SanPham = ct.SanPham != null ? new
                        {
                            ct.SanPham.MaSP,
                            TenSanPham = ct.SanPham.TenSP,
                            Gia = ct.SanPham.GiaBan,
                            ct.SanPham.HinhAnh,
                            ct.SanPham.MoTa
                        } : null
                    }).ToList()
                }).ToList();

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Lỗi server: {ex.Message}" });
            }
        }

        // ========================= LẤY CẤU HÌNH CỦA USER ĐANG ĐĂNG NHẬP (JWT) =========================
        /// <summary>
        /// Lấy danh sách cấu hình đã lưu của user hiện tại (từ JWT)
        /// </summary>
        [HttpGet("user-configs")]
        [HttpGet("cau-hinh-cua-toi")]
        public async Task<IActionResult> GetUserConfigs()
        {
            try
            {
                // Get MaKH from JWT claims
                var maKHClaim = User.FindFirst("MaKH")?.Value;
                if (string.IsNullOrEmpty(maKHClaim) || !int.TryParse(maKHClaim, out int maKH))
                {
                    return Unauthorized(new { message = "Vui lòng đăng nhập để xem cấu hình" });
                }

                var cauHinhs = await _context.CauHinhPCs
                    .Include(c => c.ChiTietCauHinhPCs)
                        .ThenInclude(ct => ct.SanPham)
                    .Where(c => c.MaKH == maKH)
                    .OrderByDescending(c => c.NgayTao)
                    .ToListAsync();

                var result = cauHinhs.Select(c => new
                {
                    c.Id,
                    c.TenCauHinh,
                    c.MaKH,
                    c.TongTien,
                    c.NgayTao,
                    ChiTietCauHinhPCs = c.ChiTietCauHinhPCs.Select(ct => new
                    {
                        ct.Id,
                        ct.CauHinhPCId,
                        ct.SanPhamId,
                        ct.LoaiLinhKien,
                        ct.Gia,
                        ct.SoLuong,
                        SanPham = ct.SanPham != null ? new
                        {
                            ct.SanPham.MaSP,
                            TenSanPham = ct.SanPham.TenSP,
                            Gia = ct.SanPham.GiaBan,
                            ct.SanPham.HinhAnh,
                            ct.SanPham.MoTa
                        } : null
                    }).ToList()
                }).ToList();

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Lỗi server: {ex.Message}" });
            }
        }

        // ========================= XÓA CẤU HÌNH =========================
        /// <summary>
        /// Xóa cấu hình đã lưu
        /// </summary>
        [HttpDelete("cau-hinh/{id}")]
        public async Task<IActionResult> DeleteCauHinh(int id)
        {
            try
            {
                var cauHinh = await _context.CauHinhPCs
                    .Include(c => c.ChiTietCauHinhPCs)
                    .FirstOrDefaultAsync(c => c.Id == id);

                if (cauHinh == null)
                {
                    return NotFound(new { message = "Không tìm thấy cấu hình" });
                }

                // Xóa chi tiết trước
                _context.ChiTietCauHinhPCs.RemoveRange(cauHinh.ChiTietCauHinhPCs);
                _context.CauHinhPCs.Remove(cauHinh);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Xóa cấu hình thành công" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Lỗi server: {ex.Message}" });
            }
        }

        // ========================= XÓA CẤU HÌNH (Alternative Route) =========================
        /// <summary>
        /// Xóa cấu hình đã lưu theo ID
        /// </summary>
        [HttpDelete("xoa-cau-hinh/{id}")]
        public async Task<IActionResult> XoaCauHinh(int id)
        {
            try
            {
                // Tìm cấu hình PC theo ID
                var cauHinh = await _context.CauHinhPCs
                    .Include(c => c.ChiTietCauHinhPCs)
                    .FirstOrDefaultAsync(c => c.Id == id);

                if (cauHinh == null)
                {
                    return NotFound(new { message = "Không tìm thấy cấu hình" });
                }

                // Xóa tất cả các chi tiết cấu hình trước
                _context.ChiTietCauHinhPCs.RemoveRange(cauHinh.ChiTietCauHinhPCs);
                
                // Xóa cấu hình
                _context.CauHinhPCs.Remove(cauHinh);
                
                // Lưu thay đổi vào database
                await _context.SaveChangesAsync();

                return Ok(new { message = "Xóa cấu hình thành công" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Lỗi server: {ex.Message}" });
            }
        }

        // ========================= API MỚI: /api/CauHinhPC =========================

        // ========================= PHẦN 1: TẠO CẤU HÌNH PC =========================
        /// <summary>
        /// Tạo mới cấu hình PC - PHẦN 1 & 4
        /// </summary>
        [HttpPost]
        [Route("api/CauHinhPC")]
        public async Task<IActionResult> CreateCauHinhPC([FromBody] CreateCauHinhPCDTO dto)
        {
            // Validate TenCauHinh
            if (string.IsNullOrWhiteSpace(dto.TenCauHinh))
            {
                return BadRequest(new { message = "Tên cấu hình không được để trống" });
            }

            // Validate LinhKien
            if (dto.LinhKien == null || !dto.LinhKien.Any())
            {
                return BadRequest(new { message = "Danh sách linh kiện không được để trống" });
            }

            // PHẦN 4: Validate SanPhamId exists
            var productIds = dto.LinhKien.Select(x => x.SanPhamId).Distinct().ToList();
            var existingProducts = await _context.SanPhams
                .Where(s => productIds.Contains(s.MaSP))
                .Select(s => s.MaSP)
                .ToListAsync();

            var invalidProducts = productIds.Except(existingProducts).ToList();
            if (invalidProducts.Any())
            {
                return BadRequest(new { 
                    message = "Một số sản phẩm không tồn tại trong hệ thống",
                    invalidProductIds = invalidProducts
                });
            }

            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                // Get MaKH - from JWT if available, otherwise from dto
                int? maKH = null;
                var maKHClaim = User.FindFirst("MaKH")?.Value;
                if (!string.IsNullOrEmpty(maKHClaim) && int.TryParse(maKHClaim, out int parsedMaKH))
                {
                    maKH = parsedMaKH;
                }
                else if (dto.MaKH.HasValue)
                {
                    maKH = dto.MaKH;
                }

                // PHẦN 1: Step 1 - Insert CauHinhPC
                var cauHinh = new CauHinhPC
                {
                    TenCauHinh = dto.TenCauHinh,
                    MaKH = maKH,
                    TongTien = dto.LinhKien.Sum(x => x.Gia * x.SoLuong),
                    NgayTao = DateTime.Now
                };

                _context.CauHinhPCs.Add(cauHinh);
                await _context.SaveChangesAsync();

                // PHẦN 1: Step 2 - Loop and insert ChiTietCauHinhPC
                foreach (var item in dto.LinhKien)
                {
                    var ct = new ChiTietCauHinhPC
                    {
                        CauHinhPCId = cauHinh.Id,
                        SanPhamId = item.SanPhamId,
                        LoaiLinhKien = item.LoaiLinhKien,
                        Gia = item.Gia,
                        SoLuong = item.SoLuong > 0 ? item.SoLuong : 1
                    };

                    _context.ChiTietCauHinhPCs.Add(ct);
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new
                {
                    message = "Tạo cấu hình PC thành công",
                    id = cauHinh.Id,
                    tenCauHinh = cauHinh.TenCauHinh,
                    tongGia = cauHinh.TongTien,
                    ngayTao = cauHinh.NgayTao
                });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, new { message = $"Lỗi: {ex.Message}" });
            }
        }

        // ========================= PHẦN 2: LẤY CHI TIẾT CẤU HÌNH =========================
        /// <summary>
        /// Lấy chi tiết cấu hình PC theo ID - PHẦN 2
        /// </summary>
        [HttpGet]
        [Route("api/CauHinhPC/{id}")]
        public async Task<IActionResult> GetCauHinhPCById(int id)
        {
            try
            {
                var cauHinh = await _context.CauHinhPCs
                    .Include(c => c.ChiTietCauHinhPCs)
                        .ThenInclude(ct => ct.SanPham)
                    .FirstOrDefaultAsync(c => c.Id == id);

                if (cauHinh == null)
                {
                    return NotFound(new { message = "Không tìm thấy cấu hình PC" });
                }

                // Build response with product info
                var response = new CauHinhPCResponseDTO
                {
                    Id = cauHinh.Id,
                    TenCauHinh = cauHinh.TenCauHinh,
                    TongGia = cauHinh.TongTien,
                    NgayTao = cauHinh.NgayTao,
                    MaKH = cauHinh.MaKH,
                    LinhKien = cauHinh.ChiTietCauHinhPCs?.Select(ct => new ChiTietCauHinhResponseDTO
                    {
                        SanPhamId = ct.SanPhamId,
                        TenSanPham = ct.SanPham?.TenSP ?? "",
                        LoaiLinhKien = ct.LoaiLinhKien,
                        Gia = ct.Gia,
                        SoLuong = ct.SoLuong,
                        HinhAnh = ct.SanPham?.HinhAnh ?? ""
                    }).ToList() ?? new List<ChiTietCauHinhResponseDTO>()
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Lỗi server: {ex.Message}" });
            }
        }

        // ========================= PHẦN 3: MUA NGAY CẤU HÌNH PC =========================
        /// <summary>
        /// Mua ngay cấu hình PC - Tạo hóa đơn từ cấu hình - PHẦN 3
        /// </summary>
        [HttpPost]
        [Route("api/CauHinhPC/{id}/MuaNgay")]
        public async Task<IActionResult> MuaNgayCauHinhPC(int id)
        {
            try
            {
                // PHẦN 3: Step 1 - Lấy cấu hình PC
                var cauHinh = await _context.CauHinhPCs
                    .Include(c => c.ChiTietCauHinhPCs)
                    .FirstOrDefaultAsync(c => c.Id == id);

                if (cauHinh == null)
                {
                    return NotFound(new { message = "Không tìm thấy cấu hình PC" });
                }

                if (cauHinh.ChiTietCauHinhPCs == null || !cauHinh.ChiTietCauHinhPCs.Any())
                {
                    return BadRequest(new { message = "Cấu hình PC không có linh kiện nào" });
                }

                // PHẦN 3: Step 2 - Lấy danh sách ChiTietCauHinhPC
                var chiTietCauHinh = cauHinh.ChiTietCauHinhPCs.ToList();

                using var transaction = await _context.Database.BeginTransactionAsync();

                try
                {
                    // PHẦN 3: Step 3 - Tạo HoaDon
                    var hoaDon = new HoaDon
                    {
                        MaHoaDon = "HD" + DateTime.Now.ToString("yyyyMMddHHmmss"),
                        MaKH = cauHinh.MaKH,
                        NgayBan = DateTime.Now,
                        TongTien = cauHinh.TongTien,
                        GiamGia = 0,
                        ThanhTien = cauHinh.TongTien,
                        HinhThucThanhToan = "Tiền mặt",
                        TrangThai = "Chờ thanh toán"
                    };

                    _context.HoaDons.Add(hoaDon);
                    await _context.SaveChangesAsync();

                    // PHẦN 3: Step 4 - Convert từng linh kiện thành ChiTietHoaDon
                    foreach (var item in chiTietCauHinh)
                    {
                        var cthd = new ChiTietHoaDon
                        {
                            MaHD = hoaDon.MaHD,
                            MaSP = item.SanPhamId,
                            SoLuong = item.SoLuong,
                            DonGia = item.Gia
                        };

                        _context.ChiTietHoaDons.Add(cthd);
                    }

                    await _context.SaveChangesAsync();
                    await transaction.CommitAsync();

                    return Ok(new MuaNgayResponseDTO
                    {
                        MaHD = hoaDon.MaHD,
                        MaHoaDon = hoaDon.MaHoaDon,
                        TongTien = hoaDon.ThanhTien ?? 0,
                        Message = "Tạo hóa đơn thành công từ cấu hình PC"
                    });
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    return StatusCode(500, new { message = $"Lỗi khi tạo hóa đơn: {ex.Message}" });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Lỗi server: {ex.Message}" });
            }
        }

        // ========================= LẤY TẤT CẢ CẤU HÌNH PC (API MỚI) =========================
        /// <summary>
        /// Lấy danh sách tất cả cấu hình PC
        /// </summary>
        [HttpGet]
        [Route("api/CauHinhPC")]
        public async Task<IActionResult> GetAllCauHinhPC()
        {
            try
            {
                var cauHinhs = await _context.CauHinhPCs
                    .Include(c => c.ChiTietCauHinhPCs)
                        .ThenInclude(ct => ct.SanPham)
                    .OrderByDescending(c => c.NgayTao)
                    .ToListAsync();

                var result = new List<object>();
                foreach (var c in cauHinhs)
                {
                    var linhKienList = new List<object>();
                    if (c.ChiTietCauHinhPCs != null)
                    {
                        foreach (var ct in c.ChiTietCauHinhPCs)
                        {
                            linhKienList.Add(new
                            {
                                sanPhamId = ct.SanPhamId,
                                tenSanPham = ct.SanPham != null ? ct.SanPham.TenSP : null,
                                loaiLinhKien = ct.LoaiLinhKien,
                                gia = ct.Gia,
                                soLuong = ct.SoLuong,
                                hinhAnh = ct.SanPham != null ? ct.SanPham.HinhAnh : null
                            });
                        }
                    }
                    result.Add(new
                    {
                        id = c.Id,
                        tenCauHinh = c.TenCauHinh,
                        maKH = c.MaKH,
                        tongGia = c.TongTien,
                        ngayTao = c.NgayTao,
                        soLinhKien = c.ChiTietCauHinhPCs != null ? c.ChiTietCauHinhPCs.Count : 0,
                        linhKien = linhKienList
                    });
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Lỗi server: {ex.Message}" });
            }
        }
    }
}

