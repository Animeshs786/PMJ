// const mongoose = require("mongoose");
// const AppError = require("../../../utils/AppError");
// const catchAsync = require("../../../utils/catchAsync");
// const StoreAssign = require("../../../models/storeAssign");
// const SalePerson = require("../../../models/salePerson");

// const getSalePersonsByStore = catchAsync(async (req, res, next) => {
//   const { storeIds, search, page = 1, limit = 10, dateFilter } = req.body;

//   let salePersonIds = [];
//   let salePersonFilter = {};

//   // Handle storeIds if provided
//   if (storeIds) {
//     // Validate storeIds is a non-empty array
//     if (!Array.isArray(storeIds) || storeIds.length === 0) {
//       return next(new AppError("storeIds must be a non-empty array", 400));
//     }

//     // Validate storeIds format
//     const storeIdsArray = storeIds.map(id => id.trim());
//     if (!storeIdsArray.every(id => mongoose.Types.ObjectId.isValid(id))) {
//       return next(new AppError("Invalid store ID format", 400));
//     }

//     // Build filter for StoreAssign
//     const storeFilter = { store: { $in: storeIdsArray } };

//     // Apply date filter to StoreAssign if provided
//     if (dateFilter) {
//       const now = new Date();
//       const currentMonth = now.getMonth() + 1;
//       const currentYear = now.getFullYear();
//       let start = new Date();
//       let end = new Date();

//       switch (dateFilter.toUpperCase()) {
//         case "QTD":
//           if ([1, 2, 3].includes(currentMonth)) {
//             start = new Date(currentYear, 0, 1);
//             end = new Date(currentYear, 2, 31);
//           } else if ([4, 5, 6].includes(currentMonth)) {
//             start = new Date(currentYear, 3, 1);
//             end = new Date(currentYear, 5, 30);
//           } else if ([7, 8, 9].includes(currentMonth)) {
//             start = new Date(currentYear, 6, 1);
//             end = new Date(currentYear, 8, 30);
//           } else {
//             start = new Date(currentYear, 9, 1);
//             end = new Date(currentYear, 11, 31);
//           }
//           break;

//         case "MTD":
//           start = new Date(currentYear, currentMonth - 1, 1);
//           end = new Date(currentYear, currentMonth - 1, now.getDate());
//           break;

//         case "YTD":
//           start = new Date(currentMonth >= 4 ? currentYear : currentYear - 1, 3, 1);
//           end = new Date(currentYear, 2, 31);
//           break;

//         default:
//           return next(new AppError("Invalid date filter.", 400));
//       }

//       start.setUTCHours(0, 0, 0, 0);
//       end.setUTCHours(23, 59, 59, 999);
//       storeFilter.createdAt = { $gte: start, $lte: end };
//     }

//     // Query store assignments for the given store IDs
//     const storeAssigns = await StoreAssign.find(storeFilter).lean();
//     if (!storeAssigns || storeAssigns.length === 0) {
//       return res.status(200).json({
//         status: true,
//         message: "No store assignments found for these stores",
//         data: [],
//         totalResults: 0,
//         currentPage: parseInt(page),
//         totalPages: 0,
//       });
//     }

//     // Extract unique salePerson IDs
//     salePersonIds = [...new Set(
//       storeAssigns
//         .filter(sa => sa.salePerson && Array.isArray(sa.salePerson))
//         .flatMap(sa => sa.salePerson.map(id => id.toString()))
//     )];

//     if (!salePersonIds.length) {
//       return res.status(200).json({
//         status: true,
//         message: "No salePersons assigned to these stores",
//         data: [],
//         totalResults: 0,
//         currentPage: parseInt(page),
//         totalPages: 0,
//       });
//     }

//     salePersonFilter._id = { $in: salePersonIds };
//   }

//   // Apply search filter
//   if (search) {
//     salePersonFilter.$or = [
//       { name: { $regex: search, $options: "i" } },
//       { mobile: { $regex: search, $options: "i" } },
//       { userId: { $regex: search, $options: "i" } },
//     ];
//   }

//   // Apply date filter to SalePerson if no storeIds provided
//   if (!storeIds && dateFilter) {
//     const now = new Date();
//     const currentMonth = now.getMonth() + 1;
//     const currentYear = now.getFullYear();
//     let start = new Date();
//     let end = new Date();

//     switch (dateFilter.toUpperCase()) {
//       case "QTD":
//         if ([1, 2, 3].includes(currentMonth)) {
//           start = new Date(currentYear, 0, 1);
//           end = new Date(currentYear, 2, 31);
//         } else if ([4, 5, 6].includes(currentMonth)) {
//           start = new Date(currentYear, 3, 1);
//           end = new Date(currentYear, 5, 30);
//         } else if ([7, 8, 9].includes(currentMonth)) {
//           start = new Date(currentYear, 6, 1);
//           end = new Date(currentYear, 8, 30);
//         } else {
//           start = new Date(currentYear, 9, 1);
//           end = new Date(currentYear, 11, 31);
//         }
//         break;

//       case "MTD":
//         start = new Date(currentYear, currentMonth - 1, 1);
//         end = new Date(currentYear, currentMonth - 1, now.getDate());
//         break;

//       case "YTD":
//         start = new Date(currentMonth >= 4 ? currentYear : currentYear - 1, 3, 1);
//         end = new Date(currentYear, 2, 31);
//         break;

//       default:
//         return next(new AppError("Invalid date filter.", 400));
//     }

//     start.setUTCHours(0, 0, 0, 0);
//     end.setUTCHours(23, 59, 59, 999);
//     salePersonFilter.createdAt = { $gte: start, $lte: end };
//   }

//   // Apply pagination
//   const totalResults = await SalePerson.countDocuments(salePersonFilter);
//   const salePersons = await SalePerson.find(salePersonFilter)
//     .skip((page - 1) * limit)
//     .limit(parseInt(limit))
//     .select("name mobile userId email status createdAt")
//     .lean();

//   res.status(200).json({
//     status: true,
//     message: storeIds ? "SalePersons fetched successfully for provided stores" : "All SalePersons fetched successfully",
//     data: salePersons,
//     totalResults,
//     currentPage: parseInt(page),
//     totalPages: Math.ceil(totalResults / limit),
//   });
// });

// module.exports = getSalePersonsByStore;



const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const StoreAssign = require("../../../models/storeAssign");
const SalePerson = require("../../../models/salePerson"); // Import SalePerson model

const getSalePersonsByStore = catchAsync(async (req, res, next) => {
  const { storeId, search, page = 1, limit = 10, dateFilter } = req.query;

  // Build the base filter for StoreAssign
  const filter = { store: storeId };

  // Apply date filter if provided
  if (dateFilter) {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    let start = new Date();
    let end = new Date();

    switch (dateFilter.toUpperCase()) {
      case "QTD":
        if ([1, 2, 3].includes(currentMonth)) {
          start = new Date(currentYear, 0, 1);
          end = new Date(currentYear, 2, 31);
        } else if ([4, 5, 6].includes(currentMonth)) {
          start = new Date(currentYear, 3, 1);
          end = new Date(currentYear, 5, 30);
        } else if ([7, 8, 9].includes(currentMonth)) {
          start = new Date(currentYear, 6, 1);
          end = new Date(currentYear, 8, 30);
        } else {
          start = new Date(currentYear, 9, 1);
          end = new Date(currentYear, 11, 31);
        }
        break;

      case "MTD":
        start = new Date(currentYear, currentMonth - 1, 1);
        end = new Date(currentYear, currentMonth - 1, now.getDate());
        break;

      case "YTD":
        start = new Date(currentMonth >= 4 ? currentYear : currentYear - 1, 3, 1);
        end = new Date(currentYear, 2, 31);
        break;

      default:
        return next(new AppError("Invalid date filter.", 400));
    }

    start.setUTCHours(0, 0, 0, 0);
    end.setUTCHours(23, 59, 59, 999);
    filter.createdAt = { $gte: start, $lte: end };
  }

  // Query storeAssign separately
  const storeAssign = await StoreAssign.findOne(filter);
  if (!storeAssign) {
    return next(new AppError("No salePersons found for this store.", 404));
  }

  // Extract salePerson IDs
  const salePersonIds = storeAssign.salePerson;
  if (!salePersonIds.length) {
    return res.status(200).json({
      status: true,
      message: "No salePersons assigned to this store.",
      data: [],
      totalResults: 0,
      currentPage: parseInt(page),
      totalPages: 0,
    });
  }

  // Build query for SalePerson collection
  const salePersonFilter = { _id: { $in: salePersonIds } };
  if (search) {
    salePersonFilter.name = { $regex: search, $options: "i" };
  }

  // Apply pagination
  const totalResults = await SalePerson.countDocuments(salePersonFilter);
  const salePersons = await SalePerson.find(salePersonFilter)
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  res.status(200).json({
    status: true,
    message: "SalePersons fetched successfully.",
    data: salePersons,
    totalResults,
    currentPage: parseInt(page),
    totalPages: Math.ceil(totalResults / limit),
  });
});

module.exports = getSalePersonsByStore;
