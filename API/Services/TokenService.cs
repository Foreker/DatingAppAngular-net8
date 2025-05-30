using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using API.Entities;
using API.Interfaces;
using Microsoft.IdentityModel.Tokens;

namespace API.Services
{
    public class TokenService(IConfiguration _config, ILogger<TokenService> _logger) : ITokenService
    {
        public string CreateToken(AppUser user)
        {
            var tokenKey = _config["TokenKey"] ?? throw new Exception("TokenKey is not set in the configuration.");

            if (tokenKey.Length < 64)
            {
                _logger.LogError("TokenKey is too short. It must be at least 64 characters long.");
                throw new Exception("TokenKey is too short. It must be at least 64 characters long.");
            }

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(tokenKey));

            var claims = new List<Claim>
            {
                new(ClaimTypes.NameIdentifier, user.UserName)
            };

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddDays(7),
                SigningCredentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature)
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);

            return tokenHandler.WriteToken(token);
        }
    }
}