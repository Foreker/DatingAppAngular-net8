using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using API.Data;
using API.DTOs;
using API.Entities;
using API.Extensions;
using API.Interfaces;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Authorize]
public class UsersController(IUserRepository userRepository, IMapper mapper,
                            IPhotoService photoService, ILogger<UsersController> _logger) : BaseApiController
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
        var username = User.GetUsername();
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

    [HttpPost("add-photo")]
    public async Task<ActionResult<PhotoDto>> AddPhoto(IFormFile file)
    {
        var username = User.GetUsername();
        var user = await userRepository.GetUserByUsernameAsync(username);
        if (user == null)
        {
            _logger.LogWarning("User with username {UserName} not found for adding photo", username);
            return NotFound();
        }

        var uploadResult = await photoService.UploadPhotoAsync(file);
        if (uploadResult.Error != null)
        {
            _logger.LogError("Error uploading photo: {ErrorMessage}", uploadResult.Error.Message);
            return BadRequest(uploadResult.Error.Message);
        }

        var photo = new Photo
        {
            Url = uploadResult.SecureUrl.AbsoluteUri,
            PublicId = uploadResult.PublicId
        };

        if (user.Photos.Count == 0) photo.IsMain = true;

        user.Photos.Add(photo);

        if (await userRepository.SaveAllAsync())
        {
            _logger.LogInformation("Photo added successfully for user {UserName}", username);
            return CreatedAtAction(nameof(GetUser), new { username = user.UserName }, mapper.Map<PhotoDto>(photo));
        }

        _logger.LogError("Failed to add photo for user {UserName}", username);
        return BadRequest("Problem adding photo");
    }

    [HttpPut("set-main-photo/{photoId:int}")]
    public async Task<ActionResult> SetMainPhoto(int photoId)
    {
        var username = User.GetUsername();
        var user = await userRepository.GetUserByUsernameAsync(username);
        if (user == null)
        {
            _logger.LogWarning("User with username {UserName} not found for setting main photo", username);
            return NotFound();
        }

        var photo = user.Photos.FirstOrDefault(x => x.Id == photoId);
        if (photo == null || photo.IsMain)
        {
            _logger.LogWarning(photo == null 
            ? "Photo with id {PhotoId} not found for user {UserName}" 
            : "Photo with id {PhotoId} is already the main photo for user {UserName}", 
            photoId, username);
            return photo == null ? NotFound() : BadRequest("This is already your main photo");
        }

        var currentMain = user.Photos.FirstOrDefault(x => x.IsMain);
        if (currentMain != null) currentMain.IsMain = false;

        photo.IsMain = true;

        if (await userRepository.SaveAllAsync())
        {
            _logger.LogInformation("Main photo set to id {PhotoId} for user {UserName}", photoId, username);
            return NoContent();
        }

        _logger.LogError("Failed to set main photo for user {UserName}", username);
        return BadRequest("Problem setting main photo");
    }   

    [HttpDelete("delete-photo/{photoId:int}")]
    public async Task<ActionResult> DeletePhoto(int photoId)
    {
        var username = User.GetUsername();
        var user = await userRepository.GetUserByUsernameAsync(username);
        if (user == null)
        {
            _logger.LogWarning("User with username {UserName} not found for deleting photo", username);
            return NotFound();
        }

        var photo = user.Photos.FirstOrDefault(x => x.Id == photoId);
        if (photo == null || photo.IsMain)
        {
            _logger.LogWarning(photo == null 
            ? "Photo with id {PhotoId} not found for user {UserName}" 
            : "Cannot delete main photo for user {UserName}", 
            photoId, username);
            return photo == null ? NotFound() : BadRequest("You cannot delete your main photo");
        }

        if (!string.IsNullOrEmpty(photo.PublicId))
        {
           var deletionResult = await photoService.DeletePhotoAsync(photo.PublicId);
            if (deletionResult.Error != null)
            {
                _logger.LogError("Error deleting photo: {ErrorMessage}", deletionResult.Error.Message);
                return BadRequest(deletionResult.Error.Message);
            }
        }
        
        user.Photos.Remove(photo);

        if (await userRepository.SaveAllAsync())
        {
            _logger.LogInformation("Photo with id {PhotoId} deleted successfully for user {UserName}", photoId, username);
            return Ok();
        }

        _logger.LogError("Failed to delete photo with id {PhotoId} for user {UserName}", photoId, username);
        return BadRequest("Problem deleting photo");
    }
}
