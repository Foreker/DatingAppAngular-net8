using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.DTOs;
using API.Entities;
using API.Interfaces;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.EntityFrameworkCore;

namespace API.Data
{
    public class UserRepository(DataContext context, IMapper mapper) : IUserRepository
    {
        public async Task<AppUser> GetUserByIdAsync(int id)
        {
            return await context.Users.FindAsync(id)
                   ?? throw new KeyNotFoundException($"User with ID {id} not found.");
        }

        public async Task<IEnumerable<AppUser>> GetUsersAsync()
        {
            return await context.Users
                .Include(u => u.Photos) // Include related photos if needed
                .ToListAsync()
                ?? throw new InvalidOperationException("No users found.");
        }

        public async Task<AppUser> GetUserByUsernameAsync(string username)
        {
            return await context.Users
                .Include(x => x.Photos) // Include related photos if needed
                .FirstOrDefaultAsync(x => x.UserName.ToLower() == username.ToLower())
                ?? throw new KeyNotFoundException($"User with username {username} not found.");
        }

        public async Task<IEnumerable<MemberDto>> GetMembersAsync()
        {
                return await context.Users
                    .ProjectTo<MemberDto>(mapper.ConfigurationProvider)
                    .ToListAsync();
        }

        public async Task<MemberDto?> GetMemberAsync(string username)
        {
            return await context.Users
                .Where(u => u.UserName.ToLower() == username.ToLower())
                .ProjectTo<MemberDto>(mapper.ConfigurationProvider)
                .FirstOrDefaultAsync()
                ?? throw new KeyNotFoundException($"Member with username {username} not found.");
        }

        public async Task<bool> SaveAllAsync()
        {
            return await context.SaveChangesAsync() > 0;
        }

        public Task AddUser(AppUser user)
        {
            if (user == null) throw new ArgumentNullException(nameof(user), "User cannot be null.");

            context.Users.Add(user);
            return Task.CompletedTask; // No need to await here, as SaveChangesAsync will be called later
        }

        public void UpdateUser(AppUser user)
        {
            context.Entry(user).State = EntityState.Modified;
        }

        public Task DeleteUser(AppUser user)
        {
            if (user == null) throw new ArgumentNullException(nameof(user), "User cannot be null.");

            context.Users.Remove(user);
            return Task.CompletedTask; // No need to await here, as SaveChangesAsync will be called later
        }

        
    }
}