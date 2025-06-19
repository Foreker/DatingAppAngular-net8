using System.ComponentModel.DataAnnotations.Schema;

namespace API.Entities
{
    [Table("Photos")]
    public class Photo
    {
        public int Id { get; set; }
        public required string Url { get; set; }
        public bool IsMain { get; set; }
        public string? PublicId { get; set; }
        public DateTime DateAdded { get; set; } = DateTime.UtcNow;
        public string? Description { get; set; }

        // Navigation property to the user
        public int AppUserId { get; set; }
        public AppUser AppUser { get; set; } = null!;
    }
}