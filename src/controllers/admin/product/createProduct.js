const Product = require("../../../models/product");
const catchAsync = require("../../../utils/catchAsync");
const deleteOldFiles = require("../../../utils/deleteOldFiles");

// Create a new product
exports.createProduct = catchAsync(async (req, res, next) => {
  const { name, title, disclaimer, price, description,fileType } = req.body;
  let thumbImagePath,
    downloadImagePath,
    catalogueImagePaths,
    videoPath = [];

  const productData = {
    name,
    title,
    disclaimer,
    price,
    description,
    fileType,
  };

  try {
    // Handle thumbImage
    if (req.files && req.files.thumbImage) {
      const thumbImageUrl = `${req.files.thumbImage[0].destination}/${req.files.thumbImage[0].filename}`;
      productData.thumbImage = thumbImageUrl;
      thumbImagePath = thumbImageUrl;
    }

    if (req.files && req.files.video) {
      const videoUrl = `${req.files.video[0].destination}/${req.files.video[0].filename}`;
      productData.video = videoUrl;
      videoPath = videoUrl;
    }

    // Handle downloadImage
    if (req.files && req.files.downloadImage) {
      const downloadImageUrl = `${req.files.downloadImage[0].destination}/${req.files.downloadImage[0].filename}`;
      productData.downloadImage = downloadImageUrl;
      downloadImagePath = downloadImageUrl;
    }

    // Handle catalogueImage (multiple images)
    if (req.files && req.files.catalogueImage) {
      const catalogueImageUrls = req.files.catalogueImage.map((file) => {
        return `${file.destination}/${file.filename}`;
      });
      productData.catalogueImage = catalogueImageUrls;
      catalogueImagePaths = catalogueImageUrls;
    }

    // Create and save the product
    const newProduct = await Product.create(productData);

    res.status(201).json({
      status: true,
      message: "Product created successfully",
      data: newProduct,
    });
  } catch (error) {
    // Delete uploaded images if product creation fails
    if (thumbImagePath) {
      await deleteOldFiles(thumbImagePath).catch((err) => {
        console.error("Failed to delete thumb image:", err);
      });
    }
    if (videoPath) {
      await deleteOldFiles(videoPath).catch((err) => {
        console.error("Failed to delete thumb image:", err);
      });
    }
    if (downloadImagePath) {
      await deleteOldFiles(downloadImagePath).catch((err) => {
        console.error("Failed to delete download image:", err);
      });
    }
    if (catalogueImagePaths?.length > 0) {
      await Promise.all(
        catalogueImagePaths.map((path) =>
          deleteOldFiles(path).catch((err) => {
            console.error("Failed to delete catalogue image:", err);
          })
        )
      );
    }
    return next(error);
  }
});
