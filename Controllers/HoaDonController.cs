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
    [Authorize]
    public class HoaDonController : ControllerBase
    {
        private readonly IGenericRepository<HoaDon> _repository;
        private readonly IGenericRepository<ChiTietHoaDon> _ctRepository;
        private readonly IGenericRepository<SanPham> _spRepository;
        private readonly IGenericRepository<ThanhToan> _ttRepository;
        private readonly IGenericRepository<BaoHanh> _bhRepository;
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;

        public HoaDonController(
            IGenericRepository<HoaDon> repository,
            IGenericRepository<ChiTietHoaDon> ctRepository,
            IGenericRepository<SanPham> spRepository,
            IGenericRepository<ThanhToan> ttRepository,
            IGenericRepository<BaoHanh> bhRepository,
            ApplicationDbContext context,
            IMapper mapper)
        {
            _repository = repository;
            _ctRepository = ctRepository;
            _spRepository = spRepository;
            _ttRepository = ttRepository;
            _bhRepository = bhRepository;
            _context = context;
            _mapper = mapper;
        }

        // ========================= GET ALL =========================
        [HttpGet]
        [Authorize(Roles = "Admin")] // ✅ Chỉ Admin mới xem được toàn bộ đơn hàng
        public async Task<IActionResult> GetAll()
        {
            var hoaDons = await _repository.GetAllAsync(
                h => h.NhanVien,
                h => h.KhachHang
            );

            var result = _mapper.Map<IEnumerable<HoaDonDto>>(hoaDons);
            return Ok(result);
        }

        // ========================= GET BY ID =========================
        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> GetById(int id)
        {
            // Lấy thông tin user từ token
            var roleClaim = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
            var userIdClaim = User.FindFirst("MaKH")?.Value 
                              ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            
            int.TryParse(userIdClaim, out int maKH);
            
            var hoaDons = await _repository.GetAllAsync(
                h => h.NhanVien,
                h => h.KhachHang
            );

            var hoaDon = hoaDons.FirstOrDefault(h => h.MaHD == id);

            if (hoaDon == null)
                return NotFound(new { message = "Không tìm thấy hóa đơn" });

            // ✅ Nếu là User, chỉ cho phép xem hóa đơn của chính họ
            if (roleClaim == "User" && hoaDon.MaKH != maKH)
            {
                return Forbid(); // Trả về 403 nếu user cố xem hóa đơn của người khác
            }

            var result = _mapper.Map<HoaDonDto>(hoaDon);
            return Ok(result);
        }

        // ========================= GET CHI TIẾT =========================
        [HttpGet("{id}/chi-tiet")]
public async Task<IActionResult> GetChiTiet(int id)
{
    var chiTiets = await _ctRepository.GetAllAsync(
        c => c.SanPham,
        c => c.HoaDon
    );

    var filtered = chiTiets.Where(c => c.MaHD == id);

    var result = _mapper.Map<IEnumerable<ChiTietHoaDonDto>>(filtered);

    return Ok(result);
}
        // ========================= CREATE =========================
        [HttpPost]
        [Authorize] 
        public async Task<IActionResult> Create([FromBody] HoaDonCreateDto createDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // Bắt đầu transaction để đảm bảo tính toàn vẹn dữ liệu
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                // 1. KIỂM TRA MÃ KHÁCH HÀNG TỒN TẠI (chỉ khi có MaKH > 0)
                if (createDto.MaKH.HasValue && createDto.MaKH.Value > 0)
                {
                    var khachHangExists = await _context.KhachHangs.AnyAsync(x => x.MaKH == createDto.MaKH);
                    if (!khachHangExists)
                    {
                        await transaction.RollbackAsync();
                        return BadRequest(new { error = $"Khách hàng với mã {createDto.MaKH} không tồn tại trong hệ thống." });
                    }
                }
                else
                {
                    // Nếu MaKH = 0 hoặc null thì để null trong DB
                    createDto.MaKH = null;
                }

                // 2. MAP DỮ LIỆU VÀ GÁN GIÁ TRỊ MẶC ĐỊNH
                var hoaDon = _mapper.Map<HoaDon>(createDto);
                hoaDon.MaHoaDon = "HD" + DateTime.Now.ToString("yyyyMMddHHmmssfff");
                
                // Gán giá trị mặc định BẮT BUỘC (vì JSON payload có thể không gửi这些字段)
                hoaDon.NgayBan = DateTime.Now;
                hoaDon.TongTien = 0;
                hoaDon.GiamGia = 0;
                hoaDon.ThanhTien = 0;
                hoaDon.TrangThai = "Chờ thanh toán";
                
                // Nếu frontend gửi giá trị thì sử dụng giá trị đó (không ghi đè nếu đã có)
                if (createDto.NgayBan.HasValue)
                    hoaDon.NgayBan = createDto.NgayBan.Value;
                if (createDto.TongTien.HasValue && createDto.TongTien.Value > 0)
                    hoaDon.TongTien = createDto.TongTien.Value;
                if (createDto.GiamGia.HasValue && createDto.GiamGia.Value > 0)
                    hoaDon.GiamGia = createDto.GiamGia.Value;
                if (!string.IsNullOrEmpty(createDto.TrangThai))
                    hoaDon.TrangThai = createDto.TrangThai;

                // Tính lại ThanhTien
                hoaDon.ThanhTien = hoaDon.TongTien - hoaDon.GiamGia;

                // 3. LƯU HÓA ĐƠN TRƯỚC ĐỂ LẤY MaHD
                var result = await _repository.AddAsync(hoaDon);
                var maHD = result.MaHD;

                // 4. LƯU CHI TIẾT ĐƠN HÀNG (nếu có)
                if (createDto.ChiTietDonHangs != null && createDto.ChiTietDonHangs.Any())
                {
                    // 4.1 KIỂM TRA MaSP CÓ TRONG ChiTietDonHangs
                    foreach (var item in createDto.ChiTietDonHangs)
                    {
if (item.MaSP <= 0)
                        {
                            await transaction.RollbackAsync();
                            return BadRequest(new { error = "ChiTietDonHangs phải chứa MaSP hợp lệ" });
                        }
                    }

                    // 4.2 TÍNH TỔNG TIỀN VÀ LƯU CHI TIẾT
                    decimal tongTien = 0;

                    foreach (var item in createDto.ChiTietDonHangs)
                    {
                        // 4.2.1 KIỂM TRA MaSP TỒN TẠI TRONG BẢNG SanPham
                        var sanPham = await _context.SanPhams.FindAsync(item.MaSP);
                        if (sanPham == null)
                        {
                            await transaction.RollbackAsync();
                            return BadRequest(new { error = $"Sản phẩm với mã {item.MaSP} không tồn tại" });
                        }

decimal giaBan = sanPham.GiaBan ?? 0m;
tongTien += giaBan * (item.SoLuong ?? 0);
var chiTiet = new ChiTietHoaDon
{
    MaHD = maHD,
    MaSP = item.MaSP,
    SoLuong = item.SoLuong ?? 0,
    DonGia = giaBan,
    GhiChu = item.GhiChu
};
_context.ChiTietHoaDons.Add(chiTiet);
// tạo bảo hành
var baoHanh = new BaoHanh
{
    MaHD = maHD,
    MaSP = sanPham.MaSP,
    SoSerial = $"SN-{sanPham.MaLinhKien ?? "UNK"}_{DateTime.Now:yyyyMMddHHmmssfff}",
    ThoiHanBaoHanh = sanPham.ThoiHanBaoHanh,
    NgayBatDau = DateTime.Now,
    NgayKetThuc = DateTime.Now.AddMonths(sanPham.ThoiHanBaoHanh ?? 0)
};

_context.BaoHanhs.Add(baoHanh);

}
                    // 4.3 CẬP NHẬT TỔNG TIỀN (Backend tự tính)
                    hoaDon.TongTien = tongTien;
                    hoaDon.ThanhTien = hoaDon.TongTien - (hoaDon.GiamGia ?? 0);
                    
                    await _repository.UpdateAsync(hoaDon);
                }

                // 5. TẠO BẢN GHI THANH TOÁN TỰ ĐỘNG
                // Map HinhThucThanhToan từ string sang MaPTTT (int)
                // TienMat -> 1, ChuyenKhoan -> 2, MoMo -> 3
                int maPTTT = createDto.HinhThucThanhToan switch
                {
                    "TienMat" => 1,
                    "ChuyenKhoan" => 2,
                    "MoMo" => 3,
                    _ => 1 // Mặc định là Tiền mặt
                };

                // Tạo bản ghi ThanhToan
                var thanhToan = new ThanhToan
                {
                    MaHD = maHD,
                    MaPTTT = maPTTT,
                    SoTien = hoaDon.ThanhTien,
                    TrangThai = "ChuaThanhToan",
                    NgayThanhToan = DateTime.Now,
                    MaGiaoDich = "TT" + DateTime.Now.ToString("yyyyMMddHHmmssfff") // ✅ Generate unique MaGiaoDich
                };

                await _ttRepository.AddAsync(thanhToan);

                // Commit transaction nếu mọi thứ thành công
                await transaction.CommitAsync();

                var resultDto = _mapper.Map<HoaDonDto>(result);

                return CreatedAtAction(nameof(GetById), new { id = result.MaHD }, resultDto);
            }
            catch (DbUpdateException ex)
            {
                // Rollback khi có lỗi database
                await transaction.RollbackAsync();
                var errorMessage = ex.InnerException?.Message ?? ex.Message;
                return BadRequest(new { error = $"Lỗi database: {errorMessage}" });
            }
            catch (Exception ex)
            {
                // Rollback khi có lỗi khác
                await transaction.RollbackAsync();
                return BadRequest(new { error = ex.Message });
            }
        }

        // ========================= ADD CHI TIẾT =========================
        [HttpPost("{id}/them-chi-tiet")]
        [Authorize(Roles = "Admin,NhanVien")]
        public async Task<IActionResult> AddChiTiet(int id, [FromBody] ChiTietHoaDonCreateDto createDto)
        {
            var hoaDon = await _repository.GetByIdAsync(id);
            if (hoaDon == null)
                return NotFound(new { message = "Không tìm thấy hóa đơn" });

            var chiTiet = _mapper.Map<ChiTietHoaDon>(createDto);
            chiTiet.MaHD = id;

            await _ctRepository.AddAsync(chiTiet);

            var chiTiets = await _ctRepository.FindAsync(c => c.MaHD == id);

            hoaDon.TongTien = chiTiets.Sum(c => c.SoLuong * c.DonGia);
            hoaDon.ThanhTien = (hoaDon.TongTien ?? 0) - (hoaDon.GiamGia ?? 0);

            await _repository.UpdateAsync(hoaDon);

            return Ok(new { message = "Thêm chi tiết thành công" });
        }

        // ========================= UPDATE HOÀN CHỈNH =========================
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,NhanVien")]
        public async Task<IActionResult> Update(int id, [FromBody] HoaDonUpdateDto updateDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (id != updateDto.MaHD)
                return BadRequest(new { message = "ID không khớp với dữ liệu" });

            try
            {
                // Lấy hóa đơn hiện tại từ database
                var existingHoaDon = await _repository.GetByIdAsync(id);
                if (existingHoaDon == null)
                    return NotFound(new { message = "Không tìm thấy hóa đơn" });

                // Kiể tra MaKH tồn tại (nếu có MaKH > 0)
                if (updateDto.MaKH.HasValue && updateDto.MaKH.Value > 0)
                {
                    var khachHangExists = await _context.KhachHangs.AnyAsync(x => x.MaKH == updateDto.MaKH);
                    if (!khachHangExists)
                    {
                        return BadRequest(new { error = $"Khách hàng với mã {updateDto.MaKH} không tồn tại trong hệ thống." });
                    }
                }
                else
                {
                    updateDto.MaKH = null;
                }

                // Lưu trạng thái cũ để kiểm tra thay đổi
                var trangThaiCu = existingHoaDon.TrangThai;

                // Map dữ liệu từ DTO vào entity hiện tại
                _mapper.Map(updateDto, existingHoaDon);

                // Tính lại ThanhTien nếu có thay đổi
                existingHoaDon.ThanhTien = (existingHoaDon.TongTien ?? 0) - (existingHoaDon.GiamGia ?? 0);

                // Cập nhật vào database
                await _repository.UpdateAsync(existingHoaDon);

                // Nếu trạng thái mới là "Đã thanh toán" hoặc "DaThanhToan", cập nhật bảng ThanhToan
                var trangThaiMoi = existingHoaDon.TrangThai;
                if ((trangThaiMoi == "Đã thanh toán" || trangThaiMoi == "DaThanhToan") 
                    && trangThaiCu != trangThaiMoi)
                {
                    // Tìm bản ghi ThanhToan theo MaHD
                    var danhSachThanhToan = await _ttRepository.FindAsync(tt => tt.MaHD == id);
                    var thanhToan = danhSachThanhToan.FirstOrDefault();

                    if (thanhToan != null)
                    {
                        thanhToan.TrangThai = "DaThanhToan";
                        thanhToan.NgayThanhToan = DateTime.Now;
                        await _ttRepository.UpdateAsync(thanhToan);
                    }
                }

                // Map lại để trả về
                var resultDto = _mapper.Map<HoaDonDto>(existingHoaDon);

                return Ok(resultDto);
            }
            catch (DbUpdateException ex)
            {
                var errorMessage = ex.InnerException?.Message ?? ex.Message;
                return BadRequest(new { error = $"Lỗi database: {errorMessage}" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        // ========================= UPDATE TRẠNG THÁI =========================
        [HttpPut("{id}/trang-thai")]
        [Authorize(Roles = "Admin,NhanVien")]
        public async Task<IActionResult> UpdateTrangThai(int id, [FromBody] string trangThai)
        {
            var hoaDon = await _repository.GetByIdAsync(id);
            if (hoaDon == null)
                return NotFound(new { message = "Không tìm thấy hóa đơn" });

            // Lưu trạng thái cũ để so sánh
            var trangThaiCu = hoaDon.TrangThai;
            
            // Cập nhật trạng thái hóa đơn
            hoaDon.TrangThai = trangThai;
            await _repository.UpdateAsync(hoaDon);

            // Nếu trạng thái mới là "Đã thanh toán" hoặc "DaThanhToan", cập nhật bảng ThanhToan
            if (trangThai == "Đã thanh toán" || trangThai == "DaThanhToan")
            {
                // Tìm bản ghi ThanhToan theo MaHD
                var danhSachThanhToan = await _ttRepository.FindAsync(tt => tt.MaHD == id);
                var thanhToan = danhSachThanhToan.FirstOrDefault();

                if (thanhToan != null)
                {
                    thanhToan.TrangThai = "DaThanhToan";
                    thanhToan.NgayThanhToan = DateTime.Now;
                    await _ttRepository.UpdateAsync(thanhToan);
                }
            }

            return Ok(new { message = "Cập nhật trạng thái thành công" });
        }

        // ========================= GET THEO KHÁCH HÀNG =========================
        [HttpGet("khach-hang/{maKH}")]
        [Authorize] // ✅ Sửa: Cho phép cả Admin và User/KhachHang
        public async Task<IActionResult> GetByKhachHang(int maKH)
        {
            // Lấy thông tin user từ token
            var roleClaim = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
            var userIdClaim = User.FindFirst("MaKH")?.Value 
                              ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            
            int.TryParse(userIdClaim, out int currentMaKH);
            
            // Include đầy đủ: HoaDon -> ChiTietHoaDon -> SanPham
            var hoaDons = await _context.HoaDons
                .Include(h => h.NhanVien)
                .Include(h => h.KhachHang)
                .Include(h => h.ChiTietHoaDons)
                    .ThenInclude(ct => ct.SanPham)
                .Where(h => h.MaKH == maKH)
                .ToListAsync();

            // ✅ Nếu là User hoặc KhachHang, chỉ cho phép xem hóa đơn của chính họ
            // Backend trả về "User" nhưng Frontend normalize thành "KhachHang"
            if ((roleClaim == "User" || roleClaim == "KhachHang") && maKH != currentMaKH)
            {
                return Forbid(); // Trả về 403 nếu user cố xem hóa đơn của người khác
            }

            var result = _mapper.Map<IEnumerable<HoaDonDto>>(hoaDons);
            return Ok(result);
        }

        // ========================= THỐNG KÊ =========================
        [HttpGet("thong-ke/doanh-thu")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ThongKeDoanhThu(
            [FromQuery] DateTime tuNgay,
            [FromQuery] DateTime denNgay)
        {
            var hoaDons = await _repository.FindAsync(h =>
                h.NgayBan >= tuNgay && h.NgayBan <= denNgay);

            var tongDoanhThu = hoaDons.Sum(h => h.ThanhTien ?? 0);
            var soLuongHoaDon = hoaDons.Count();

            return Ok(new
            {
                tuNgay,
                denNgay,
                tongDoanhThu,
                soLuongHoaDon,
                trungBinh = soLuongHoaDon > 0
                    ? tongDoanhThu / soLuongHoaDon
                    : 0
            });
        }

        // ========================= DELETE =========================
    // ========================= DELETE =========================
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            // 1. Tìm hóa đơn theo id
            var hoaDon = await _repository.GetByIdAsync(id);
            if (hoaDon == null)
                return NotFound(new { message = "Không tìm thấy hóa đơn" });

            // 2. XÓA DỮ LIỆU BẢNG THANH TOÁN
            var thanhToans = _context.ThanhToans.Where(t => t.MaHD == id).ToList();
            if (thanhToans.Any())
            {
                _context.ThanhToans.RemoveRange(thanhToans);
            }

            // 3. XÓA DỮ LIỆU BẢNG BẢO HÀNH (Vì lúc Create có tự động tạo ra)
            var baoHanhs = _context.BaoHanhs.Where(b => b.MaHD == id).ToList();
            if (baoHanhs.Any())
            {
                _context.BaoHanhs.RemoveRange(baoHanhs);
            }

            // 4. Xóa tất cả ChiTietHoaDon thuộc về hóa đơn
            var chiTiets = await _ctRepository.FindAsync(c => c.MaHD == id);
            if (chiTiets.Any())
            {
                foreach (var chiTiet in chiTiets)
                {
                    _context.ChiTietHoaDons.Remove(chiTiet);
                }
            }

            // 5. Cuối cùng mới Xóa hóa đơn chính
            _context.HoaDons.Remove(hoaDon);

            // 6. Lưu thay đổi
            await _context.SaveChangesAsync();

            return Ok(new { message = "Xóa hóa đơn và các dữ liệu liên quan thành công" });
        }

        // ========================= DASHBOARD - PHÂN LUỒNG THEO QUYỀN =========================
        [HttpGet("dashboard")]
        [Authorize]
        public async Task<IActionResult> GetDashboardData()
        {
            try
            {
                // 1. LẤY THÔNG TIN USER TỪ TOKEN
                var userIdClaim = User.FindFirst("MaKH")?.Value 
                                  ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                var roleClaim = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
                
                // Chuyển đổi userId sang int
                int.TryParse(userIdClaim, out int userId);
                
                // Lấy danh sách hóa đơn với include
                var allHoaDons = await _repository.GetAllAsync(
                    h => h.NhanVien,
                    h => h.KhachHang
                );
                
                IEnumerable<HoaDon> filteredHoaDons;
                decimal tongDoanhThu = 0;
                int soLuongHoaDon = 0;
                int choXuLy = 0;
                int daHoanThanh = 0;
                int daHuy = 0;
                
                // 2. PHÂN LUỒNG THEO QUYỀN
                if (roleClaim == "Admin" || roleClaim == "NhanVien")
                {
                    // ADMIN: Lấy toàn bộ hóa đơn
                    filteredHoaDons = allHoaDons;
                    
                    // Thống kê toàn hệ thống - CHỈ tính doanh thu từ hóa đơn đã thanh toán
                    var hoaDonDaThanhToan = allHoaDons.Where(h => 
                        h.TrangThai == "Đã thanh toán" || h.TrangThai == "Hoàn thành");
                    tongDoanhThu = hoaDonDaThanhToan.Sum(h => h.ThanhTien ?? 0);
                    soLuongHoaDon = allHoaDons.Count();
                    choXuLy = allHoaDons.Count(h => h.TrangThai == "Chờ thanh toán" || h.TrangThai == "Chờ xử lý");
                    daHoanThanh = hoaDonDaThanhToan.Count();
                    daHuy = allHoaDons.Count(h => h.TrangThai == "Đã hủy");
                }
                else
                {
                    // USER/CUSTOMER: Chỉ lấy hóa đơn của mình (lọc theo MaKH)
                    if (userId > 0)
                    {
                        filteredHoaDons = allHoaDons.Where(h => h.MaKH == userId);
                    }
                    else
                    {
                        // Nếu không có MaKH trong token, trả về danh sách rỗng
                        filteredHoaDons = Enumerable.Empty<HoaDon>();
                    }
                    
                    // Thống kê theo đơn hàng của user - CHỈ tính doanh thu từ hóa đơn đã thanh toán
                    var userHoaDons = filteredHoaDons.ToList();
                    var userHoaDonDaThanhToan = userHoaDons.Where(h => 
                        h.TrangThai == "Đã thanh toán" || h.TrangThai == "Hoàn thành");
                    tongDoanhThu = userHoaDonDaThanhToan.Sum(h => h.ThanhTien ?? 0);
                    soLuongHoaDon = userHoaDons.Count;
                    choXuLy = userHoaDons.Count(h => h.TrangThai == "Chờ thanh toán" || h.TrangThai == "Chờ xử lý");
                    daHoanThanh = userHoaDonDaThanhToan.Count();
                    daHuy = userHoaDons.Count(h => h.TrangThai == "Đã hủy");
                }
                
                // Map kết quả
                var result = _mapper.Map<IEnumerable<HoaDonDto>>(filteredHoaDons);
                
                // 3. TRẢ VỀ JSON NHẤT QUÁN
                return Ok(new
                {
                    userRole = roleClaim,
                    userId = userId,
                    hoaDons = result,
                    thongKe = new
                    {
                        tongDon = soLuongHoaDon,
                        choXuLy = choXuLy,
                        daHoanThanh = daHoanThanh,
                        daHuy = daHuy,
                        tongTien = tongDoanhThu,
                        trungBinh = soLuongHoaDon > 0 ? tongDoanhThu / soLuongHoaDon : 0
                    }
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }
    }
}
