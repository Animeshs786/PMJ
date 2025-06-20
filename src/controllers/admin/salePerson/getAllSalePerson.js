// const SalePerson = require("../../../models/salePerson");
// const catchAsync = require("../../../utils/catchAsync");
// const pagination = require("../../../utils/pagination");

// exports.getAllSalePerson = catchAsync(async (req, res) => {
//   const {
//     search,
//     startDate,
//     endDate,
//     page: currentPage,
//     limit: currentLimit,
//     status,
//   } = req.query;

//   const filter = {};

//   if (search) {
//     filter.name = { $regex: search, $options: "i" };
//   }
//   if (status) {
//     filter.status = status;
//   }

//   if (startDate) {
//     filter.createdAt = { $gte: new Date(startDate) };
//   }
//   if (endDate) {
//     filter.createdAt = { $lte: new Date(endDate) };
//   }

//   const { limit, skip, totalResult, totalPage } = await pagination(
//     currentPage,
//     currentLimit,
//     SalePerson,
//     null,
//     filter
//   );
//   const salePerson = await SalePerson.find(filter)
//     .skip(skip)
//     .limit(limit)
//     .sort("-createdAt");

//   res.status(200).json({
//     status: true,
//     totalResult,
//     totalPage,
//     currentPage: currentPage ? parseInt(currentPage) : 1,
//     results: salePerson.length,
//     data: {
//       salePerson,
//     },
//   });
// });


// const AppError = require("../../../utils/AppError");
// const catchAsync = require("../../../utils/catchAsync");
// const pagination = require("../../../utils/pagination");
// const SalePerson = require("../../../models/salePerson");
// const StoreAssign = require("../../../models/storeAssign");
// const Store = require("../../../models/store");
// const Location = require("../../../models/location");

// exports.getAllSalePerson = catchAsync(async (req, res, next) => {
//   const {
//     search,
//     startDate,
//     endDate,
//     page: currentPage,
//     limit: currentLimit,
//     status,
//     storeIds,
//   } = req.body;

//   let filter = {};

//   // Handle search by name, mobile, or userId
//   if (search) {
//     filter.$or = [
//       { name: { $regex: search, $options: "i" } },
//       { mobile: { $regex: search, $options: "i" } },
//       { userId: { $regex: search, $options: "i" } },
//     ];
//   }

//   // Handle status filter
//   if (status) {
//     filter.status = status;
//   }

//   // Handle date range filter
//   if (startDate) {
//     filter.createdAt = { $gte: new Date(startDate) };
//   }
//   if (endDate) {
//     filter.createdAt = filter.createdAt || {};
//     filter.createdAt.$lte = new Date(endDate);
//   }

//   // Handle storeIds filter
//   let salePersonIds = [];
//   if (storeIds && storeIds.length > 0) {
//     const storeIdsArray = Array.isArray(storeIds) ? storeIds : storeIds.split(",");

//     // Find store assignments for the given store IDs
//     const storeAssigns = await StoreAssign.find({ store: { $in: storeIdsArray } }).lean();

//     if (!storeAssigns || storeAssigns.length === 0) {
//       console.log(`No store assignments found for storeIds: ${storeIdsArray}`);
//       return next(new AppError("No store assignments found for the provided store IDs.", 404));
//     }

//     // Log raw store assignments before population
//     console.log("Raw store assignments:", storeAssigns.map(sa => ({
//       store: sa.store,
//       salePerson: sa.salePerson,
//     })));

//     // Validate salePerson IDs
//     const salePersonObjectIds = [...new Set(storeAssigns.map(sa => sa.salePerson.toString()))];
//     const validSalePersons = await SalePerson.find({ _id: { $in: salePersonObjectIds } }).select("_id").lean();

//     salePersonIds = validSalePersons.map(sp => sp._id.toString());

//     // Log populated salePerson IDs
//     console.log("Valid salePerson IDs:", salePersonIds);

//     if (salePersonIds.length === 0) {
//       console.log("No valid salePerson references found for store assignments");
//       return next(
//         new AppError(
//           "No valid sale persons found for these stores. Store assignments may reference non-existent salespeople.",
//           404
//         )
//       );
//     }

//     // Add salePerson IDs to filter
//     filter._id = { $in: salePersonIds };
//   }

//   // Pagination
//   const { limit, skip, totalResult, totalPage } = await pagination(
//     currentPage,
//     currentLimit,
//     SalePerson,
//     null,
//     filter
//   );

//   // Fetch salespeople with applied filters
//   const salePersons = await SalePerson.find(filter)
//     .skip(skip)
//     .limit(limit)
//     .sort("-createdAt")
//     .select("name mobile userId email status createdAt")
//     .lean();

//   // Fetch store details for each salesperson
//   const salePersonData = await Promise.all(
//     salePersons.map(async (salePerson) => {
//       // Find store assignments for the current salesperson
//       const storeAssigns = await StoreAssign.find({ salePerson: salePerson._id })
//         .populate({
//           path: "store",
//           select: "address",
//           populate: {
//             path: "location",
//             select: "name state",
//           },
//         })
//         .lean();

//       // Extract store details
//       const stores = [
//         ...new Set(
//           storeAssigns
//             .filter((sa) => sa.store && sa.store.location)
//             .map((sa) => ({
//               storeId: sa.store._id.toString(),
//               address: sa.store.address,
//               locationName: sa.store.location.name,
//               state: sa.store.location.state,
//             }))
//         ),
//       ];

//       return {
//         _id: salePerson._id,
//         name: salePerson.name,
//         mobile: salePerson.mobile,
//         userId: salePerson.userId,
//         email: salePerson.email,
//         status: salePerson.status,
//         createdAt: salePerson.createdAt,
//         stores,
//       };
//     })
//   );

//   res.status(200).json({
//     status: true,
//     totalResult,
//     totalPage,
//     currentPage: currentPage ? parseInt(currentPage) : 1,
//     results: salePersonData.length,
//     data: {
//       salePersons: salePersonData,
//     },
//   });
// });



const mongoose = require("mongoose");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const pagination = require("../../../utils/pagination");
const SalePerson = require("../../../models/salePerson");
const StoreAssign = require("../../../models/storeAssign");
const Store = require("../../../models/store");
const Location = require("../../../models/location");

exports.getAllSalePerson = catchAsync(async (req, res, next) => {
  const {
    search,
    startDate,
    endDate,
    page: currentPage = 1,
    limit: currentLimit = 10,
    status,
    storeIds,
  } = req.body;

  let filter = {};

  // Handle search by name, mobile, or userId
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { mobile: { $regex: search, $options: "i" } },
      { userId: { $regex: search, $options: "i" } },
    ];
  }

  // Handle status filter
  if (status) {
    filter.status = status;
  }

  // Handle date range filter
  if (startDate) {
    filter.createdAt = { $gte: new Date(startDate) };
    filter.createdAt.$gte.setUTCHours(0, 0, 0, 0);
  }
  if (endDate) {
    filter.createdAt = filter.createdAt || {};
    filter.createdAt.$lte = new Date(endDate);
    filter.createdAt.$lte.setUTCHours(23, 59, 59, 999);
  }

  // Handle storeIds filter
  if (storeIds && (Array.isArray(storeIds) || typeof storeIds === "string")) {
    let storeIdsArray = Array.isArray(storeIds)
      ? storeIds
      : storeIds.split(",").map(id => id.trim()).filter(id => id);

    // Validate each store ID
    const validStoreIds = storeIdsArray.filter(id => 
      mongoose.Types.ObjectId.isValid(id) && /^[0-9a-fA-F]{24}$/.test(id)
    );

    if (!validStoreIds.length) {
      return next(new AppError("No valid store IDs provided.", 400));
    }

    // Find store assignments for the given store IDs
    const storeAssigns = await StoreAssign.find({
      store: { $in: validStoreIds },
    }).select("salePerson").lean();

    if (!storeAssigns || storeAssigns.length === 0) {
      return res.status(200).json({
        status: true,
        message: "No store assignments found for the provided store IDs.",
        totalResult: 0,
        totalPage: 0,
        currentPage: parseInt(currentPage),
        results: 0,
        data: {
          salePersons: [],
        },
      });
    }

    console.log(storeAssigns, "is");
    // Extract unique salePerson IDs from arrays
    const salePersonIds = [...new Set(
      storeAssigns.flatMap(sa => 
        sa.salePerson.map(id => id.toString())
      )
    )];

    if (salePersonIds.length === 0) {
      return res.status(200).json({
        status: true,
        message: "No sale persons found for these stores.",
        totalResult: 0,
        totalPage: 0,
        currentPage: parseInt(currentPage),
        results: 0,
        data: {
          salePersons: [],
        },
      });
    }

    // Convert salePersonIds to ObjectId for the filter
    try {
      filter._id = { $in: salePersonIds.map(id => new mongoose.Types.ObjectId(id)) };
    } catch (error) {
      return next(new AppError("Invalid sale person ID format.", 400));
    }
  }

  // Pagination
  const { limit, skip, totalResult, totalPage } = await pagination(
    currentPage,
    currentLimit,
    SalePerson,
    null,
    filter
  );

  // Fetch salespeople with applied filters
  const salePersons = await SalePerson.find(filter)
    .skip(skip)
    .limit(limit)
    .sort("-createdAt")
    .select("name mobile userId email status createdAt")
    .lean();

  // Fetch store details for each salesperson
  const salePersonData = await Promise.all(
    salePersons.map(async (salePerson) => {
      // Find store assignments for the current salesperson
      const storeAssigns = await StoreAssign.find({ 
        salePerson: { $in: [salePerson._id] }
      })
        .populate({
          path: "store",
          select: "address",
          populate: {
            path: "location",
            select: "name state",
          },
        })
        .lean();

      // Extract store details
      const stores = [
        ...new Set(
          storeAssigns
            .filter((sa) => sa.store && sa.store.location)
            .map((sa) => ({
              storeId: sa.store._id.toString(),
              address: sa.store.address,
              locationName: sa.store.location.name,
              state: sa.store.location.state,
            }))
        ),
      ];

      return {
        _id: salePerson._id,
        name: salePerson.name,
        mobile: salePerson.mobile,
        userId: salePerson.userId,
        email: salePerson.email,
        status: salePerson.status,
        createdAt: salePerson.createdAt,
        stores,
      };
    })
  );

  res.status(200).json({
    status: true,
    totalResult,
    totalPage,
    currentPage: parseInt(currentPage),
    results: salePersonData.length,
    data: {
      salePersons: salePersonData,
    },
  });
});