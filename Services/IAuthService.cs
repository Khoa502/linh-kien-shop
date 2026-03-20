using BackendAPI.DTOs;
using Microsoft.AspNetCore.Http;

namespace BackendAPI.Services
{
    public interface IAuthService
    {
        Task<LoginResponseDto> LoginAsync(LoginDto loginDto);
        Task<bool> ChangePasswordAsync(int userId, string oldPassword, string newPassword);
    }
}
