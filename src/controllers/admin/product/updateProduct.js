const { isValidObjectId } = require("mongoose");
const Product = require("../../../models/product");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const deleteOldFiles = require("../../../utils/deleteOldFiles");

exports.updateProduct = catchAsync(async (req, res, next) => {
  const { name, title, disclaimer, price, description,fileType } = req.body;
  const id = req.params.id;
  const updateData = {};
  let thumbImagePath,
    downloadImagePath,
    catalogueImagePaths,
    videoPath = [];

  if (!isValidObjectId(id)) {
    return next(new AppError("Invalid product ID", 400));
  }

  // Collect updated fields
  if (name) updateData.name = name;
  if (title) updateData.title = title;
  if (disclaimer) updateData.disclaimer = disclaimer;
  if (fileType) updateData.fileType = fileType;
  if (price) updateData.price = price;
  if (description) updateData.description = description;

  try {
    const product = await Product.findById(id);

    if (!product) {
      return next(new AppError("Product not found", 404));
    }

    // Update thumbImage
    if (req.files && req.files.thumbImage) {
      const newThumbImage = `${req.files.thumbImage[0].destination}/${req.files.thumbImage[0].filename}`;
      thumbImagePath = newThumbImage;
      updateData.thumbImage = newThumbImage;

      // Delete old thumb image if it exists
      if (product.thumbImage) {
        await deleteOldFiles(product.thumbImage);
      }
    }

    if (req.files && req.files.video) {
      const newvideo = `${req.files.video[0].destination}/${req.files.video[0].filename}`;
      videoPath = newvideo;
      updateData.video = newvideo;

      // Delete old thumb image if it exists
      if (product.video) {
        await deleteOldFiles(product.video);
      }
    }

    // Update downloadImage
    if (req.files && req.files.downloadImage) {
      const newDownloadImage = `${req.files.downloadImage[0].destination}/${req.files.downloadImage[0].filename}`;
      downloadImagePath = newDownloadImage;
      updateData.downloadImage = newDownloadImage;

      // Delete old download image if it exists
      if (product.downloadImage) {
        await deleteOldFiles(product.downloadImage);
      }
    }

    if (req.files && req.files.catalogueImage) {
      const newCatalogueImages = req.files.catalogueImage.map((file) => {
        return `${file.destination}/${file.filename}`;
      });
      updateData.catalogueImage = newCatalogueImages;
      catalogueImagePaths = newCatalogueImages;
      if (product.catalogueImage && product.catalogueImage.length > 0) {
        await Promise.all(
          product.catalogueImage.map((imagePath) => deleteOldFiles(imagePath))
        );
      }
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: true,
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (error) {
    if (thumbImagePath) {
      await deleteOldFiles(thumbImagePath).catch((err) => {
        console.error("Failed to delete new thumb image:", err);
      });
    }
    if (videoPath) {
        await deleteOldFiles(videoPath).catch((err) => {
          console.error("Failed to delete new thumb image:", err);
        });
      }
    if (downloadImagePath) {
      await deleteOldFiles(downloadImagePath).catch((err) => {
        console.error("Failed to delete new download image:", err);
      });
    }
    if (catalogueImagePaths.length > 0) {
      await Promise.all(
        catalogueImagePaths.map((path) =>
          deleteOldFiles(path).catch((err) => {
            console.error("Failed to delete new catalogue image:", err);
          })
        )
      );
    }
    return next(error);
  }
});
