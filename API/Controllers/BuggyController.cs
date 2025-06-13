using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Data;
using API.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    public class BuggyController(DataContext _dataContext, ILogger<BuggyController> _logger) : BaseApiController
    {
        [Authorize]
        [HttpGet("auth")]
        public ActionResult<string> GetAuth()
        {
            _logger.LogInformation("Accessed secret text");
            return "secret text";
        }

        [HttpGet("not-found")]
        public ActionResult<AppUser> GetNotFound()
        {
            var thing = _dataContext.Users.Find(-1);
            if (thing == null) return NotFound();
            _logger.LogInformation("Found user with id {Id}", thing.Id);

            return Ok(thing);
        }

        [HttpGet("server-error")]
        public ActionResult<AppUser> GetServerError()
        {
            var thing = _dataContext.Users.Find(-1) ?? throw new Exception("This is a server error");
            try
            {
                return Ok(thing);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while processing the request");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("bad-request")]
        public ActionResult<string> GetBadRequest()
        {
            _logger.LogWarning("Bad request made to the server");
            return BadRequest("This was a bad request");
        }


    }

}