using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Threading.Tasks;
using System.Security.Cryptography;
using API.Data;
using API.Entities;
using Microsoft.AspNetCore.Mvc;
using System.Text;
using API.DTOs;
using Microsoft.EntityFrameworkCore;
using API.Interfaces;

namespace API.Controllers
{
    public class AccountController(DataContext _dataContext, ILogger<UsersController> _logger, ITokenService _tokenService) : BaseApiController
    {
        [HttpPost("register")] // account/register
        public async Task<ActionResult<UserDto>> Register(RegisterDto registerDto)
        {
            // Check if the user already exists
            if (await UserExists(registerDto.Username))
            {
                _logger.LogWarning("User with username {Username} already exists", registerDto.Username);
                return BadRequest("Username is taken");
            }

            return Ok();

            // Hash the password and save the user
            // using var hmac = new HMACSHA512();

            // var user = new AppUser
            // {
            //     UserName = registerDto.Username.ToLower(),
            //     PasswordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(registerDto.Password)),
            //     PasswordSalt = hmac.Key
            // };


            // await _dataContext.Users.AddAsync(user);
            // await _dataContext.SaveChangesAsync();

            // _logger.LogInformation("User registered with id {Username}", user.UserName);

            // return new UserDto
            // {
            //     Username = user.UserName,
            //     Token = _tokenService.CreateToken(user)
            // };
        }

        [HttpPost("login")] // account/login
        public async Task<ActionResult<UserDto>> Login(LoginDto loginDto)
        {
            // Find the user by username
            var user = await _dataContext.Users.Include(p => p.Photos).FirstOrDefaultAsync(x => x.UserName.ToLower() == loginDto.Username.ToLower());

            if (user == null)
            {
                _logger.LogWarning("User with username {Username} not found", loginDto.Username);
                return Unauthorized("Invalid username");
            }

            // Verify the password
            using var hmac = new HMACSHA512(user.PasswordSalt);
            var computedHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(loginDto.Password));

            for (int i = 0; i < computedHash.Length; i++)
            {
                if (computedHash[i] != user.PasswordHash[i]) return Unauthorized("Invalid password");
            }

            return new UserDto
            {
                Username = user.UserName,
                Token = _tokenService.CreateToken(user),
                PhotoUrl = user.Photos.FirstOrDefault(x => x.IsMain)?.Url
            };
        }

        private async Task<bool> UserExists(string username)
        {
            return await _dataContext.Users.AnyAsync(x => x.UserName.ToLower() == username.ToLower());
        }
    }
}