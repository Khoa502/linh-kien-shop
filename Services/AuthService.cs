using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BackendAPI.Data;
using BackendAPI.DTOs;
using BackendAPI.Models;
using UAParser;

namespace BackendAPI.Services
{
    public class AuthService : IAuthService
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public AuthService(ApplicationDbContext context, IConfiguration configuration, IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _configuration = configuration;
            _httpContextAccessor = httpContextAccessor;
        }

        private (string browser, string os, string device) ParseUserAgent(string userAgent)
        {
            var parser = Parser.GetDefault();
            var clientInfo = parser.Parse(userAgent);
            var browser = clientInfo.UA.Family ?? "Unknown";
            var os = clientInfo.OS.Family ?? "Unknown";
            return (browser, os, $"{browser} - {os}");
        }

        private string GetClientIp()
        {
            var httpContext = _httpContextAccessor.HttpContext;
            if (httpContext == null) return "Unknown";

            // Check RemoteIpAddress first
            var remoteIp = httpContext.Connection.RemoteIpAddress?.ToString();
            if (!string.IsNullOrEmpty(remoteIp) && remoteIp != "::1")
                return remoteIp;

            // Check X-Forwarded-For for proxies
            var forwardedFor = httpContext.Request.Headers["X-Forwarded-For"].FirstOrDefault();
            if (!string.IsNullOrEmpty(forwardedFor))
            {
                return forwardedFor.Split(',')[0].Trim();
            }

            return "Unknown";
        }

        // ================= LOGIN =================
        public async Task<LoginResponseDto> LoginAsync(LoginDto loginDto)
        {
            var ipAddress = GetClientIp();
            var userAgent = _httpContextAccessor.HttpContext?.Request.Headers["User-Agent"].ToString() ?? "Unknown";
            var uaInfo = ParseUserAgent(userAgent);

            var taiKhoan = await _context.TaiKhoans
                .Include(t => t.PhanQuyen)
                .Include(t => t.NhanVien)
                .Include(t => t.KhachHang)
                .FirstOrDefaultAsync(t =>
                    t.TenDangNhap == loginDto.TenDangNhap &&
                    t.TrangThai);

            if (taiKhoan == null)
            {
                // Login fail - account not exist
                var failLog = new LichSuDangNhap
                {
                    TaiKhoanID = 0,
                    TenDangNhap = loginDto.TenDangNhap,
                    ThoiGian = DateTime.Now,
                    DiaChiIP = ipAddress,
                    ThietBi = uaInfo.device,
                    Browser = uaInfo.browser,
                    OS = uaInfo.os,
                    Device = uaInfo.device,
                    TrangThai = "Thất bại"
                };
                _context.LichSuDangNhaps.Add(failLog);
                await _context.SaveChangesAsync();
                return null;
            }

            if (taiKhoan.MatKhau != loginDto.MatKhau)
            {
                // Login fail - wrong password
                var failLog = new LichSuDangNhap
                {
                    TaiKhoanID = taiKhoan.ID,
                    TenDangNhap = taiKhoan.TenDangNhap,
                    ThoiGian = DateTime.Now,
                    DiaChiIP = ipAddress,
                    ThietBi = uaInfo.device,
                    Browser = uaInfo.browser,
                    OS = uaInfo.os,
                    Device = uaInfo.device,
                    TrangThai = "Thất bại"
                };
                _context.LichSuDangNhaps.Add(failLog);
                await _context.SaveChangesAsync();
                return null;
            }

            if (taiKhoan.PhanQuyen == null)
                return null;

            // ✅ Trích xuất MaNV và MaKH từ navigation properties
            int? maNV = taiKhoan.NhanVien?.MaNV;
            int? maKH = taiKhoan.KhachHang?.MaKH;

            var token = GenerateJwtToken(taiKhoan);

            var successLog = new LichSuDangNhap
            {
                TaiKhoanID = taiKhoan.ID,
                TenDangNhap = taiKhoan.TenDangNhap,
                ThoiGian = DateTime.Now,
                DiaChiIP = ipAddress,
                ThietBi = uaInfo.device,
                Browser = uaInfo.browser,
                OS = uaInfo.os,
                Device = uaInfo.device,
                TrangThai = "Thành công"
            };

            _context.LichSuDangNhaps.Add(successLog);
            await _context.SaveChangesAsync();

            return new LoginResponseDto
            {
                Token = token,
                TenDangNhap = taiKhoan.TenDangNhap,
                Role = taiKhoan.PhanQuyen.TenQuyen,
                UserId = taiKhoan.ID,
Expiration = DateTime.UtcNow.AddMinutes(30),
                MaNV = maNV,   // ✅ Thêm MaNV vào response
                MaKH = maKH    // ✅ Thêm MaKH vào response
            };
        }

        // ================= CHANGE PASSWORD =================
        public async Task<bool> ChangePasswordAsync(int userId, string oldPassword, string newPassword)
        {
            var taiKhoan = await _context.TaiKhoans.FindAsync(userId);

            if (taiKhoan == null)
                return false;

            if (taiKhoan.MatKhau != oldPassword)
                return false;

            taiKhoan.MatKhau = newPassword;

            await _context.SaveChangesAsync();
            return true;
        }

        // ================= GENERATE JWT =================
        private string GenerateJwtToken(TaiKhoan taiKhoan)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]);

            // Lấy MaKH nếu là khách hàng
            int? maKH = null;
            if (taiKhoan.KhachHang != null)
            {
                maKH = taiKhoan.KhachHang.MaKH;
            }

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, taiKhoan.ID.ToString()),
                new Claim(ClaimTypes.Name, taiKhoan.TenDangNhap),
                new Claim(ClaimTypes.Role, taiKhoan.PhanQuyen.TenQuyen),
                new Claim("MaKH", maKH?.ToString() ?? "")
            };

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
Expires = DateTime.UtcNow.AddMinutes(30),
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(key),
                    SecurityAlgorithms.HmacSha256Signature
                ),
                Issuer = _configuration["Jwt:Issuer"],
                Audience = _configuration["Jwt:Audience"]
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }
}
