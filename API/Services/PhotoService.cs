using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Helpers;
using API.Interfaces;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.Extensions.Options;

namespace API.Services
{
    public class PhotoService : IPhotoService
    {
        private readonly CloudinaryDotNet.Cloudinary _cloudinary;

        public PhotoService(IOptions<CloudinarySettings> config)
        {
            var acc = new CloudinaryDotNet.Account(
                config.Value.CloudName,
                config.Value.ApiKey,
                config.Value.ApiSecret
            );

            _cloudinary = new CloudinaryDotNet.Cloudinary(acc);
        }
        public async Task<ImageUploadResult> UploadPhotoAsync(IFormFile file)
        {
            var uploadResult = new ImageUploadResult();

            if (file.Length > 0)
            {
                using (var stream = file.OpenReadStream())
                {
                    var uploadParams = new ImageUploadParams
                    {
                        File = new FileDescription(file.FileName, stream),
                        Transformation = new Transformation().Height(500).Width(500).Crop("fill").Gravity("face"),
                        Folder = "da-net8"
                    };

                    try
                    {
                        uploadResult = await _cloudinary.UploadAsync(uploadParams);
                    }
                    catch (System.Exception)
                    {
                        // Handle exceptions as needed, e.g., log the error
                        throw new Exception("An error occurred while uploading the photo.");
                    }

                    return uploadResult;
                }
            }
            else
            {
                throw new ArgumentException("File is empty.");
            }
        }

        public async Task<DeletionResult> DeletePhotoAsync(string publicId)
        {
            var deleteParams = new DeletionParams(publicId)
            {
                ResourceType = ResourceType.Image
            };

            return await _cloudinary.DestroyAsync(deleteParams);
        }
    }
}