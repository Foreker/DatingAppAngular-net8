using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using API.Data;
using API.DTOs;
using API.Entities;
using API.Interfaces;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace API.Controllers;

[Authorize]
public class UsersController(IUserRepository userRepository, IMapper mapper, ILogger<UsersController> _logger) : BaseApiController
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<MemberDto>>> GetUsers()
    {
        var users = await userRepository.GetMembersAsync();
        if (users == null || !users.Any())
        {
            _logger.LogWarning("No users found");
            return NotFound("No users found");
        }

        _logger.LogInformation("GetUsers called, returning {Count} users", users.Count());

        return Ok(users);
    }

    [HttpGet("{username}")] // api/users/username
    public async Task<ActionResult<MemberDto>> GetUser(string username)
    {
        var user = await userRepository.GetMemberAsync(username);
        if (user == null)
        {
            _logger.LogWarning("User with username {UserName} not found", username);
            return NotFound();
        }

        _logger.LogInformation("GetUser called for username {UserName}", username);
        return user;
    }

    [Authorize]
    [HttpPost] // api/users
    public async Task<ActionResult<AppUser>> CreateUser(AppUser user)
    {
        await userRepository.AddUser(user);
        await userRepository.SaveAllAsync();

        _logger.LogInformation("User created with id {Id}", user.Id);
        return CreatedAtAction(nameof(GetUser), new { id = user.Id }, user);
    }

    [HttpPut]
    public async Task<ActionResult> UpdateUser(MemberUpdateDto memberUpdateDto)
    {
        var username = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (username == null)
        {
            _logger.LogWarning("User not found for update");
            return BadRequest("Not username found in token");
        }

        var user = await userRepository.GetUserByUsernameAsync(username);
        if (user == null)
        {
            _logger.LogWarning("User with username {UserName} not found for update", username);
            return BadRequest("User not found");
        }

        mapper.Map(memberUpdateDto, user);
        userRepository.UpdateUser(user);

        if (await userRepository.SaveAllAsync())
        {
            _logger.LogInformation("User with username {UserName} updated successfully", username);
            return NoContent();
        }
        else
        {
            _logger.LogError("Failed to update user with username {UserName}", username);
            return BadRequest("Failed to update user");
        }
    }

    [HttpDelete("{username}")] // api/users/username
    public async Task<IActionResult> DeleteUser(string username)
    {
        var user = await userRepository.GetUserByUsernameAsync(username);
        if (user == null)
        {
            _logger.LogWarning("User with id {Id} not found", username);
            return NotFound();
        }

        await userRepository.DeleteUser(user);
        await userRepository.SaveAllAsync();

        _logger.LogInformation("User with id {Id} deleted", username);
        return NoContent();
    }
}
