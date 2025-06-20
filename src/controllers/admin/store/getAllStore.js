// const mongoose = require("mongoose");
// const Store = require("../../../models/store");
// const StoreAssign = require("../../../models/storeAssign");
// const catchAsync = require("../../../utils/catchAsync");
// const AppError = require("../../../utils/AppError");
// const pagination = require("../../../utils/pagination");

// exports.getAllStores = catchAsync(async (req, res, next) => {
//   const {
//     search,
//     startDate,
//     endDate,
//     page: currentPage,
//     limit: currentLimit,
//     salePersonIds,
//     collectionAgentIds,
//   } = req.body;

//   let filter = {};

//   // Handle salePersonIds and collectionAgentIds filters
//   if (salePersonIds?.length || collectionAgentIds?.length) {
//     let salePersonStoreIds = [];
//     let collectionAgentStoreIds = [];

//     // Handle salePersonIds filter
//     if (salePersonIds?.length) {
//       // Validate salePersonIds format
//       const salePersonIdsArray = salePersonIds.map(id => id.trim());
//       if (!salePersonIdsArray.every(id => mongoose.Types.ObjectId.isValid(id))) {
//         return next(new AppError("Invalid salePerson ID format", 400));
//       }

//       // Find store assignments for the given salePerson IDs
//       const salePersonAssigns = await StoreAssign.find({
//         salePerson: { $in: salePersonIdsArray },
//       }).lean();

//       if (!salePersonAssigns || salePersonAssigns.length === 0) {
//         return res.status(200).json({
//           status: true,
//           message: "No stores found for these salePerson IDs",
//           totalResult: 0,
//           totalPage: 0,
//           currentPage: parseInt(currentPage) || 1,
//           results: 0,
//           data: { stores: [] },
//         });
//       }

//       // Extract unique store IDs for salePersonIds
//       salePersonStoreIds = [...new Set(
//         salePersonAssigns
//           .filter(sa => sa.store)
//           .map(sa => sa.store.toString())
//       )];
//     }

//     // Handle collectionAgentIds filter
//     if (collectionAgentIds?.length) {
//       // Validate collectionAgentIds format
//       const collectionAgentIdsArray = collectionAgentIds.map(id => id.trim());
//       if (!collectionAgentIdsArray.every(id => mongoose.Types.ObjectId.isValid(id))) {
//         return next(new AppError("Invalid collectionAgent ID format", 400));
//       }

//       // Find store assignments for the given collectionAgent IDs
//       const collectionAgentAssigns = await StoreAssign.find({
//         collectionAgent: { $in: collectionAgentIdsArray },
//       }).lean();

//       if (!collectionAgentAssigns || collectionAgentAssigns.length === 0) {
//         return res.status(200).json({
//           status: true,
//           message: "No stores found for these collectionAgent IDs",
//           totalResult: 0,
//           totalPage: 0,
//           currentPage: parseInt(currentPage) || 1,
//           results: 0,
//           data: { stores: [] },
//         });
//       }

//       // Extract unique store IDs for collectionAgentIds
//       collectionAgentStoreIds = [...new Set(
//         collectionAgentAssigns
//           .filter(sa => sa.store)
//           .map(sa => sa.store.toString())
//       )];
//     }

//     // Combine filters: intersect store IDs if both salePersonIds and collectionAgentIds are provided
//     let filteredStoreIds = [];
//     if (salePersonIds?.length && collectionAgentIds?.length) {
//       filteredStoreIds = salePersonStoreIds.filter(id => collectionAgentStoreIds.includes(id));
//     } else if (salePersonIds?.length) {
//       filteredStoreIds = salePersonStoreIds;
//     } else {
//       filteredStoreIds = collectionAgentStoreIds;
//     }

//     if (!filteredStoreIds.length) {
//       return res.status(200).json({
//         status: true,
//         message: "No stores found matching the provided filters",
//         totalResult: 0,
//         totalPage: 0,
//         currentPage: parseInt(currentPage) || 1,
//         results: 0,
//         data: { stores: [] },
//       });
//     }

//     // Add store IDs to filter
//     filter._id = { $in: filteredStoreIds };
//   }

//   // Apply search filter
//   if (search) {
//     filter.address = { $regex: search, $options: "i" };
//   }

//   // Apply date filters
//   if (startDate) {
//     filter.createdAt = { $gte: new Date(startDate) };
//   }
//   if (endDate) {
//     filter.createdAt = filter.createdAt || {};
//     filter.createdAt.$lte = new Date(endDate);
//   }

//   // Apply pagination
//   const { limit, skip, totalResult, totalPage } = await pagination(
//     currentPage,
//     currentLimit,
//     Store,
//     null,
//     filter
//   );

//   // Fetch stores
//   const stores = await Store.find(filter)
//     .populate("location", "name state")
//     .sort("-createdAt")
//     .skip(skip)
//     .limit(limit)
//     .lean();

//   res.status(200).json({
//     status: true,
//     totalResult,
//     totalPage,
//     currentPage: parseInt(currentPage) || 1,
//     results: stores.length,
//     data: {
//       stores,
//     },
//   });
// });

const mongoose = require("mongoose");
const Store = require("../../../models/store");
const StoreAssign = require("../../../models/storeAssign");
const catchAsync = require("../../../utils/catchAsync");
const AppError = require("../../../utils/AppError");
const pagination = require("../../../utils/pagination");

exports.getAllStores = catchAsync(async (req, res, next) => {
  const {
    search,
    startDate,
    endDate,
    page: currentPage,
    limit: currentLimit,
    salePersonIds,
    collectionAgentIds,
    locationIds,
  } = req.body;

  let filter = {};

  // Handle salePersonIds, collectionAgentIds, and locationIds filters
  if (
    salePersonIds?.length ||
    collectionAgentIds?.length ||
    locationIds?.length
  ) {
    let salePersonStoreIds = [];
    let collectionAgentStoreIds = [];
    let locationStoreIds = [];

    // Handle salePersonIds filter
    if (salePersonIds?.length) {
      const salePersonIdsArray = Array.isArray(salePersonIds)
        ? salePersonIds.map((id) => id.trim())
        : salePersonIds.split(",").map((id) => id.trim());

      // Validate salePersonIds format
      if (
        !salePersonIdsArray.every((id) => mongoose.Types.ObjectId.isValid(id))
      ) {
        return next(new AppError("Invalid salePerson ID format", 400));
      }

      // Find store assignments for the given salePerson IDs
      const salePersonAssigns = await StoreAssign.find({
        salePerson: { $in: salePersonIdsArray },
      }).lean();

      if (!salePersonAssigns || salePersonAssigns.length === 0) {
        return res.status(200).json({
          status: true,
          message: "No stores found for these salePerson IDs",
          totalResult: 0,
          totalPage: 0,
          currentPage: parseInt(currentPage) || 1,
          results: 0,
          data: { stores: [] },
        });
      }

      // Extract unique store IDs for salePersonIds
      salePersonStoreIds = [
        ...new Set(
          salePersonAssigns
            .filter((sa) => sa.store)
            .map((sa) => sa.store.toString())
        ),
      ];
    }

    // Handle collectionAgentIds filter
    if (collectionAgentIds?.length) {
      const collectionAgentIdsArray = Array.isArray(collectionAgentIds)
        ? collectionAgentIds.map((id) => id.trim())
        : collectionAgentIds.split(",").map((id) => id.trim());

      // Validate collectionAgentIds format
      if (
        !collectionAgentIdsArray.every((id) =>
          mongoose.Types.ObjectId.isValid(id)
        )
      ) {
        return next(new AppError("Invalid collectionAgent ID format", 400));
      }

      // Find store assignments for the given collectionAgent IDs
      const collectionAgentAssigns = await StoreAssign.find({
        collectionAgent: { $in: collectionAgentIdsArray },
      }).lean();

      if (!collectionAgentAssigns || collectionAgentAssigns.length === 0) {
        return res.status(200).json({
          status: true,
          message: "No stores found for these collectionAgent IDs",
          totalResult: 0,
          totalPage: 0,
          currentPage: parseInt(currentPage) || 1,
          results: 0,
          data: { stores: [] },
        });
      }

      // Extract unique store IDs for collectionAgentIds
      collectionAgentStoreIds = [
        ...new Set(
          collectionAgentAssigns
            .filter((sa) => sa.store)
            .map((sa) => sa.store.toString())
        ),
      ];
    }

    // Handle locationIds filter
    if (locationIds?.length) {
      const locationIdsArray = Array.isArray(locationIds)
        ? locationIds.map((id) => id.trim())
        : locationIds.split(",").map((id) => id.trim());

      // Validate locationIds format
      if (
        !locationIdsArray.every((id) => mongoose.Types.ObjectId.isValid(id))
      ) {
        return next(new AppError("Invalid location ID format", 400));
      }

      // Find stores for the given location IDs
      const locationStores = await Store.find({
        location: { $in: locationIdsArray },
      })
        .select("_id")
        .lean();

      if (!locationStores || locationStores.length === 0) {
        return res.status(200).json({
          status: true,
          message: "No stores found for these location IDs",
          totalResult: 0,
          totalPage: 0,
          currentPage: parseInt(currentPage) || 1,
          results: 0,
          data: { stores: [] },
        });
      }

      // Extract unique store IDs for locationIds
      locationStoreIds = [
        ...new Set(locationStores.map((store) => store._id.toString())),
      ];
    }

    // Combine filters: intersect store IDs if multiple filters are provided
    let filteredStoreIds = [];
    if (
      salePersonIds?.length &&
      collectionAgentIds?.length &&
      locationIds?.length
    ) {
      filteredStoreIds = salePersonStoreIds
        .filter((id) => collectionAgentStoreIds.includes(id))
        .filter((id) => locationStoreIds.includes(id));
    } else if (salePersonIds?.length && collectionAgentIds?.length) {
      filteredStoreIds = salePersonStoreIds.filter((id) =>
        collectionAgentStoreIds.includes(id)
      );
    } else if (salePersonIds?.length && locationIds?.length) {
      filteredStoreIds = salePersonStoreIds.filter((id) =>
        locationStoreIds.includes(id)
      );
    } else if (collectionAgentIds?.length && locationIds?.length) {
      filteredStoreIds = collectionAgentStoreIds.filter((id) =>
        locationStoreIds.includes(id)
      );
    } else if (salePersonIds?.length) {
      filteredStoreIds = salePersonStoreIds;
    } else if (collectionAgentIds?.length) {
      filteredStoreIds = collectionAgentStoreIds;
    } else {
      filteredStoreIds = locationStoreIds;
    }

    if (!filteredStoreIds.length) {
      return res.status(200).json({
        status: true,
        message: "No stores found matching the provided filters",
        totalResult: 0,
        totalPage: 0,
        currentPage: parseInt(currentPage) || 1,
        results: 0,
        data: { stores: [] },
      });
    }

    // Add store IDs to filter
    filter._id = { $in: filteredStoreIds };
  }

  // Apply search filter
  if (search) {
    filter.address = { $regex: search, $options: "i" };
  }

  // Apply date filters
  if (startDate) {
    filter.createdAt = { $gte: new Date(startDate) };
  }
  if (endDate) {
    filter.createdAt = filter.createdAt || {};
    filter.createdAt.$lte = new Date(endDate);
  }

  // Apply pagination
  const { limit, skip, totalResult, totalPage } = await pagination(
    currentPage,
    currentLimit,
    Store,
    null,
    filter
  );

  // Fetch stores
  const stores = await Store.find(filter)
    .populate("location", "name state")
    .sort("-createdAt")
    .skip(skip)
    .limit(limit)
    .lean();

  res.status(200).json({
    status: true,
    totalResult,
    totalPage,
    currentPage: parseInt(currentPage) || 1,
    results: stores.length,
    data: {
      stores,
    },
  });
});
