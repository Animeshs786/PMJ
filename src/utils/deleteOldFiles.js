// utils/deleteOldFile.js
const fs = require("fs");
const path = require("path");
const AppError = require("./AppError");

const deleteOldFiles = (filePath) => {
  return new Promise((resolve, reject) => {
    if (!filePath) {
      return reject(new AppError("File path is required", 400));
    }

    const absolutePath = path.resolve(filePath);

    fs.unlink(absolutePath, (err) => {
      if (err) {
        console.error(err);
        return reject(new AppError("Failed to delete file", 500));
      }

      console.log(`File deleted: ${absolutePath}`);
      resolve(`File deleted: ${absolutePath}`);
    });
  });
};

module.exports = deleteOldFiles;
