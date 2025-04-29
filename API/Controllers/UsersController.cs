using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using API.Data;
using API.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]  // api/users
    public class UsersController(DataContext _dataContext, ILogger<UsersController> _logger) : ControllerBase
    {

        [HttpGet]
        public async Task<ActionResult<IEnumerable<AppUser>>> GetUsers()
        {
            var result = await _dataContext.Users.ToListAsync();
            _logger.LogInformation("GetUsers called, returning {Count} users", result.Count);

            return result;
        }

        [HttpGet("{id:int}")] // api/users/1
        public async Task<ActionResult<AppUser>> GetUser(int id)
        {
            var user = await _dataContext.Users.FindAsync(id);
            if (user == null)
            {
            _logger.LogWarning("User with id {Id} not found", id);
            return NotFound();
            }

            _logger.LogInformation("GetUser called for id {Id}", id);
            return user;
        }

        [HttpPost] // api/users
        public async Task<ActionResult<AppUser>> CreateUser(AppUser user)
        {
            await _dataContext.Users.AddAsync(user);
            await _dataContext.SaveChangesAsync();

            _logger.LogInformation("User created with id {Id}", user.Id);
            return CreatedAtAction(nameof(GetUser), new { id = user.Id }, user);
        }

        [HttpPut("{id:int}")] // api/users/1
        public async Task<IActionResult> UpdateUser(int id, AppUser user)
        {
            if (id != user.Id)
            {
                _logger.LogWarning("User id mismatch: {Id} vs {UserId}", id, user.Id);
                return BadRequest();
            }

            _dataContext.Entry(user).State = EntityState.Modified;
            await _dataContext.SaveChangesAsync();

            _logger.LogInformation("User with id {Id} updated", id);
            return NoContent();
        }

        [HttpDelete("{id:int}")] // api/users/1
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _dataContext.Users.FindAsync(id);
            if (user == null)
            {
                _logger.LogWarning("User with id {Id} not found", id);
                return NotFound();
            }

            _dataContext.Users.Remove(user);
            await _dataContext.SaveChangesAsync();

            _logger.LogInformation("User with id {Id} deleted", id);
            return NoContent();
        }
    }
}