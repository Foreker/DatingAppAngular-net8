using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
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
public class UsersController(IUserRepository userRepository, ILogger<UsersController> _logger) : BaseApiController
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

    [HttpPut("{id:int}")] // api/users/1
    public async Task<IActionResult> UpdateUser(int id, AppUser user)
    {
        if (id != user.Id)
        {
            _logger.LogWarning("User id mismatch: {Id} vs {UserId}", id, user.Id);
            return BadRequest();
        }

        userRepository.UpdateUser(user);
        await userRepository.SaveAllAsync();

        _logger.LogInformation("User with id {Id} updated", id);
        return NoContent();
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
