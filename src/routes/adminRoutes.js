const express = require("express");

const { register } = require("../controllers/admin/authController/register");
const { login } = require("../controllers/admin/authController/login");
const {
  adminAuthenticate,
} = require("../controllers/admin/authController/adminAuthenticate");
const {
  updatePassword,
} = require("../controllers/admin/authController/updatePassword");
const fileUploader = require("../middleware/fileUploader");
const { getAllPlans } = require("../controllers/admin/plan/getAllPlan");
const { createPlan } = require("../controllers/admin/plan/createPlan");
const { updatePlan } = require("../controllers/admin/plan/updatePlan");
const { getPlanById } = require("../controllers/admin/plan/getPlan");
const { deletePlan } = require("../controllers/admin/plan/deletePlan");
const {
  getAllGoldRates,
} = require("../controllers/admin/goldRate/getAllGoldRate");
const {
  createGoldRate,
} = require("../controllers/admin/goldRate/createGoldRate");
const {
  updateGoldRate,
} = require("../controllers/admin/goldRate/updateGoldRate");
const { getGoldRate } = require("../controllers/admin/goldRate/getGoldRate");
const {
  deleteGoldRate,
} = require("../controllers/admin/goldRate/deleteGoldRate");
const {
  getGoldExchange,
} = require("../controllers/admin/goldExchange/getGoldExchnage");
const {
  getAllGoldExchanges,
} = require("../controllers/admin/goldExchange/getAllGoldExchange");
const {
  updateGoldExchange,
} = require("../controllers/admin/goldExchange/updateGoldExchange");
const {
  deleteGoldExchange,
} = require("../controllers/admin/goldExchange/deleteGoldExchange");
const { getAllStores } = require("../controllers/admin/store/getAllStore");
const { createStore } = require("../controllers/admin/store/createStore");
const { updateStore } = require("../controllers/admin/store/updateStore");
const { getStore } = require("../controllers/admin/store/getStore");
const { deleteStore } = require("../controllers/admin/store/deleteStore");
const { getAllVisit } = require("../controllers/admin/visit/getAllVisit");
const { updateVisit } = require("../controllers/admin/visit/updateVisit");
const { getVisit } = require("../controllers/admin/visit/getVisit");
const { deleteVisit } = require("../controllers/admin/visit/deleteVisit");
const { getAllService } = require("../controllers/admin/service/getAllService");
const { updateService } = require("../controllers/admin/service/updateService");
const { getService } = require("../controllers/admin/service/getService");
const { deleteService } = require("../controllers/admin/service/deleteService");
const { getAllContact } = require("../controllers/admin/contact/getAllContact");
const { updateContact } = require("../controllers/admin/contact/updateContact");
const { getContact } = require("../controllers/admin/contact/getContact");
const { deleteContact } = require("../controllers/admin/contact/deleteContact");
const { homeController } = require("../controllers/admin/homeController/home");
const { addFaq } = require("../controllers/admin/homeController/addFaq");
const { updateFaq } = require("../controllers/admin/homeController/updateFaq");
const { deleteFaq } = require("../controllers/admin/homeController/deleteFaq");
const { getFaq } = require("../controllers/admin/homeController/getFaq");
const { getHome } = require("../controllers/admin/homeController/getHome");
const { getAllFaq } = require("../controllers/admin/homeController/getAllFaq");
const {
  createBanner,
} = require("../controllers/admin/bannerController/createBanner");
const {
  getAllBanners,
} = require("../controllers/admin/bannerController/getAllBanner");
const {
  getBanner,
} = require("../controllers/admin/bannerController/getBanner");
const {
  updateBanner,
} = require("../controllers/admin/bannerController/updateBanner");
const {
  deleteBanner,
} = require("../controllers/admin/bannerController/deleteBanner");
const {
  getAllProducts,
} = require("../controllers/admin/product/getAllProduct");
const { createProduct } = require("../controllers/admin/product/createProduct");
const { updateProduct } = require("../controllers/admin/product/updateProduct");
const { getProduct } = require("../controllers/admin/product/getProduct");
const { deleteProduct } = require("../controllers/admin/product/deleteProduct");
const {
  getAllProductQueries,
} = require("../controllers/admin/productQuery/getAllProductQuery");
const {
  updateProductQuery,
} = require("../controllers/admin/productQuery/updateProductQuery");
const {
  getProductQuery,
} = require("../controllers/admin/productQuery/getProductQuery");
const {
  deleteProductQuery,
} = require("../controllers/admin/productQuery/deleteProductQuery");
const {
  getAllDiscounts,
} = require("../controllers/admin/discount/getAllDiscount");
const {
  updateDiscount,
} = require("../controllers/admin/discount/updateDiscount");
const { getDiscount } = require("../controllers/admin/discount/getDiscount");
const {
  deleteDiscount,
} = require("../controllers/admin/discount/deleteDiscount");
const {
  createDiscount,
} = require("../controllers/admin/discount/createDiscount");
const {
  getAllSalePerson,
} = require("../controllers/admin/salePerson/getAllSalePerson");
const { createTarget } = require("../controllers/admin/business/createTarget");
const { getAllTargets } = require("../controllers/admin/business/getAllTarget");
const { updateTarget } = require("../controllers/admin/business/updateTarget");
const { getTargetById } = require("../controllers/admin/business/getTarget");
const { deleteTarget } = require("../controllers/admin/business/deleteTarget");
const {
  getSalesPersonPerformance,
} = require("../controllers/admin/business/salePersonPerformance");
const {
  getAllCollectionDetail,
} = require("../controllers/admin/collection/getAllCollectionDetail");
const {
  getOverdueUsers,
} = require("../controllers/admin/collection/getOverdueUsers");
const {
  getCurrentMonthUsers,
} = require("../controllers/admin/collection/getCurrentMonthUser");
const {
  getTotalTargetUsers,
} = require("../controllers/admin/collection/getTotaltargetUser");
const {
  getTotalCollectedUsers,
} = require("../controllers/admin/collection/getTotalCollectedUser");
const {
  getAllRedemption,
} = require("../controllers/admin/redemption/getAllRedemption");
const {
  getAllPendingRedemption,
} = require("../controllers/admin/redemption/getAllPendingRedemption");
const {
  getUpcomingMaturity,
} = require("../controllers/admin/redemption/getUpcomingMaturity");
const {
  updateRedemption,
} = require("../controllers/admin/redemption/updateRedemption");
const { getUserPlan } = require("../controllers/admin/userPlan/getUserPlan");
const {
  getPlanStatements,
} = require("../controllers/admin/userPlan/getPlanStatement");
const {
  getPlanDetails,
} = require("../controllers/admin/userPlan/getPlanDetails");
const {
  getDockDetail,
} = require("../controllers/admin/userPlan/getDockDetail");
const {
  createExhibition,
} = require("../controllers/admin/exhibition/createExhibition");
const {
  getAllExhibitions,
} = require("../controllers/admin/exhibition/getAllExhibition");
const {
  getExhibitionById,
} = require("../controllers/admin/exhibition/getExhibition");
const {
  updateExhibition,
} = require("../controllers/admin/exhibition/updateExhibition");
const {
  deleteExhibition,
} = require("../controllers/admin/exhibition/deleteExhibition");
const {
  createSeasonal,
} = require("../controllers/admin/seasonal/createSeasonal");
const {
  getAllSeasonal,
} = require("../controllers/admin/seasonal/getAllSeasonal");
const { getSeasonal } = require("../controllers/admin/seasonal/getSeasonal");
const {
  updateSeasonal,
} = require("../controllers/admin/seasonal/updateSeasonal");
const {
  deleteSeasonal,
} = require("../controllers/admin/seasonal/deleteSeasonal");
const {
  createCuponCode,
} = require("../controllers/admin/cuponCode/createCupon");
const {
  getAllCuponCodes,
} = require("../controllers/admin/cuponCode/getAllCupon");
const {
  updateCuponCode,
} = require("../controllers/admin/cuponCode/updateCupon");
const { getCuponCodeById } = require("../controllers/admin/cuponCode/getCupon");
const { deleteCupon } = require("../controllers/admin/cuponCode/deleteCupons");
const {
  getAllTransaction,
} = require("../controllers/admin/transaction/getAllTransation");
const {
  updateTransaction,
} = require("../controllers/admin/transaction/updateTransaction");
const {
  createNotification,
} = require("../controllers/admin/notification/createNoitificaton");
const createState = require("../controllers/admin/state/createState");
const getStateById = require("../controllers/admin/state/getState");
const updateState = require("../controllers/admin/state/updateState");
const deleteState = require("../controllers/admin/state/deleteState");
const createLocation = require("../controllers/admin/location/createLocation");
const getAllLocations = require("../controllers/admin/location/getAllLocation");
const getLocationById = require("../controllers/admin/location/getLocation");
const updateLocation = require("../controllers/admin/location/updateLocation");
const deleteLocation = require("../controllers/admin/location/deleteLocation");
const assignStore = require("../controllers/admin/store/assignStore");
const getStoresByLocation = require("../controllers/admin/store/getStoreByLocation");
const getSalePersonsByStore = require("../controllers/admin/store/getSalePersonByStore");
const getCollectionAgentsByStore = require("../controllers/admin/store/getCollectionAgentByStore");
const getAllStates = require("../controllers/admin/state/getAllState");
const createCollectionAgentMobile = require("../controllers/admin/collectionAgentMobile/createCollectionAgentMobile");
const getAllCollectionAgentMobiles = require("../controllers/admin/collectionAgentMobile/getAllCollectionAgentMobile");
const getCollectionAgentMobileById = require("../controllers/admin/collectionAgentMobile/getCollectionAgentMobile");
const updateCollectionAgentMobile = require("../controllers/admin/collectionAgentMobile/updateCollectionAgentMobile");
const deleteCollectionAgentMobile = require("../controllers/admin/collectionAgentMobile/deleteCollectionAgentMobile");
const {
  getTotalUserByStore,
} = require("../controllers/admin/store/getTotalUserByStore");
const {
  getAllCollectionAgents,
} = require("../controllers/admin/collectionAgent/getAllCollectionAgent");
const {
  assignUserToCollectionAgent,
} = require("../controllers/admin/collectionAgent/assignUserToCollectionAgent");
const {
  removeUserFromCollectionAgent,
} = require("../controllers/admin/collectionAgent/removeUserFromCollectionAgent");
const { createContest } = require("../controllers/admin/contest/createContest");
const {
  getAllCoontest,
} = require("../controllers/admin/contest/getAllContest");
const { getContest } = require("../controllers/admin/contest/getContest");
const { updateContest } = require("../controllers/admin/contest/updateContest");
const { deleteContest } = require("../controllers/admin/contest/deleteContest");
const createCashierMobile = require("../controllers/admin/cashierMobile/createCashierMobile");
const getAllCashierMobiles = require("../controllers/admin/cashierMobile/getAllCashierMobile");
const getCashierMobileById = require("../controllers/admin/cashierMobile/getCashierMobile");
const updateCashierMobile = require("../controllers/admin/cashierMobile/updateCashierMobile");
const deleteCashierMobile = require("../controllers/admin/cashierMobile/deleteCashierMobile");
const {
  createCollectionTarget,
} = require("../controllers/admin/collectionAgentTarget/createTarget");
const {
  getAllCollectionTargets,
} = require("../controllers/admin/collectionAgentTarget/getAllTarget");
const {
  updateCollectionTarget,
} = require("../controllers/admin/collectionAgentTarget/updateTarget");
const {
  getCollectionTargetById,
} = require("../controllers/admin/collectionAgentTarget/getTarget");
const {
  deleteCollectionTarget,
} = require("../controllers/admin/collectionAgentTarget/deleteTarget");
const { getAllUsers } = require("../controllers/admin/user/getAllUser");
const { createUser } = require("../controllers/admin/user/createUser");
const { getUser } = require("../controllers/admin/user/getUser");
const { updateUser } = require("../controllers/admin/user/updateUser");
const { deleteUser } = require("../controllers/admin/user/deleteUser");
const {
  createSalePerson,
} = require("../controllers/admin/salePerson/createSaleperson");
const {
  getSalePerson,
} = require("../controllers/admin/salePerson/getSaleperson");
const {
  updateSalePerson,
} = require("../controllers/admin/salePerson/updateSaleperson");
const {
  deleteSalePerson,
} = require("../controllers/admin/salePerson/deleteSaleperson");
const {
  createCollectionAgent,
} = require("../controllers/admin/collectionAgent/createCollectionAgent");
const {
  getCollectionAgent,
} = require("../controllers/admin/collectionAgent/getCollectionAgent");
const {
  updateCollectionAgent,
} = require("../controllers/admin/collectionAgent/updateCollectionAgent");
const {
  deleteCollectionAgent,
} = require("../controllers/admin/collectionAgent/deleteCollectionAgent");
const { createRole } = require("../controllers/admin/role/createRole");
const { getAllRoles } = require("../controllers/admin/role/getAllRole");
const { updateRole } = require("../controllers/admin/role/updateRole");
const { deleteRole } = require("../controllers/admin/role/deleteRole");
const { getRoleById } = require("../controllers/admin/role/getRole");
const { myWallet } = require("../controllers/admin/userPlan/myWallet");
const { updatePlanDock } = require("../controllers/admin/plan/updatePlanDock");
const {
  getUsersBySalesperson,
} = require("../controllers/admin/salePerson/getSalepersonUser");
const {
  getAllAssignUser,
} = require("../controllers/admin/collectionAgent/getAllAssignUser");
const {
  getCurrentMonthCollectedUsers,
} = require("../controllers/admin/collectionManagement/getCurrentMonthCollectedUser");
const {
  getTodayCollectedUsers,
} = require("../controllers/admin/collectionManagement/todayCollectedUser");
const {
  getPreviousMonthPaidEMIs,
} = require("../controllers/admin/collectionManagement/getPreviousMonthPaidEmis");
const {
  getPreviousMonthPendingEMIs,
} = require("../controllers/admin/collectionManagement/getPreviousMonthPendingEmis");
const {
  getPreviousEMIList,
} = require("../controllers/admin/collectionManagement/getPreviousEmiList");
const {
  getAllSharesForAdmin,
} = require("../controllers/admin/ntb/getAllShare");
const {
  getAllDownloadListForAdmin,
} = require("../controllers/admin/ntb/getAllDownloadList");
const {
  getAllActiveUsersForAdmin,
} = require("../controllers/admin/ntb/getAllActiveUser");
const {
  getEnrollUsers,
} = require("../controllers/salePerson/NTB/getEnrollUsers");
const {
  getAllRatingForAdmin,
} = require("../controllers/admin/ntb/getAllRating");
const {
  getEnrollUsersForAdmin,
} = require("../controllers/admin/ntb/getAllEnrollUser");
const {
  getOverdueUsersForAdmin,
} = require("../controllers/admin/collectionManagement/overDueUser");
const {
  getCurrentMonthPendingUsersForAdmin,
} = require("../controllers/admin/collectionManagement/getCurrentMonthPending");
const {
  getTotalTargetUsersForAdmin,
} = require("../controllers/admin/collectionManagement/totalTargertUser");
const {
  getTotalCollectedUsersForAdmin,
} = require("../controllers/admin/collectionManagement/getTotalCollectedUser");
const {
  closeUserPlan,
  completeUserPlan,
  manageIsRedemStatus,
} = require("../controllers/admin/plan/closePlan");
const {
  assignSalePersonToUserPlan,
} = require("../controllers/admin/plan/assignSalepersonToUserPlan");
const {
  getAllSalePersonDetail,
} = require("../controllers/admin/salePerson/getSalepresonData");
const {
  getAllForclosedPlans,
} = require("../controllers/admin/redemption/getAllForeclosedPlan");
const removeStoreAssignment = require("../controllers/admin/store/removeStoreAssign");

const router = express.Router();

//Authentication
router.post(
  "/register",
  fileUploader([{ name: "profileImage", maxCount: 1 }], "admin"),
  register
);
router.post("/login", login);
router.get("/service/:id", getService);
router.get("/goldExchange/:id", getGoldExchange);
//Notification
router
  .route("/notification")
  .post(
    fileUploader([{ name: "file", maxCount: 1 }], "notification"),
    createNotification
  );

// router.use(adminAuthenticate);

router.patch("/updatePassword", updatePassword);

//Plan
router.route("/plan").get(getAllPlans).post(createPlan);
router.route("/plan/:id").patch(updatePlan).get(getPlanById).delete(deletePlan);

//Gold Rate
router.route("/goldRate").get(getAllGoldRates).post(createGoldRate);
router
  .route("/goldRate/:id")
  .patch(updateGoldRate)
  .get(getGoldRate)
  .delete(deleteGoldRate);

//Gold Exchange
router.route("/goldExchange").get(getAllGoldExchanges);
router
  .route("/goldExchange/:id")
  .patch(updateGoldExchange)
  .delete(deleteGoldExchange);

//Gold Store
router
  .route("/store")
  .post(fileUploader([{ name: "image", maxCount: 5 }], "store"), createStore);
router
  .route("/store/:id")
  .patch(fileUploader([{ name: "image", maxCount: 5 }], "store"), updateStore)
  .get(getStore)
  .delete(deleteStore);

router.post("/storeAll", getAllStores);

router.post("/storeAssign", assignStore);
router.get("/storeLocation", getStoresByLocation);
router.get("/storeSalePerson", getSalePersonsByStore);
router.get("/storeCollectionAgent", getCollectionAgentsByStore);
router.post("/storeCustomer", getTotalUserByStore);
router.post("/removeStoreAssign",removeStoreAssignment)

//Visit
router.route("/visit").get(getAllVisit);
router.route("/visit/:id").patch(updateVisit).get(getVisit).delete(deleteVisit);

//Service
router.route("/service").get(getAllService);
router.route("/service/:id").patch(updateService).delete(deleteService);

//Contact
router.route("/contact").get(getAllContact);
router
  .route("/contact/:id")
  .patch(updateContact)
  .get(getContact)
  .delete(deleteContact);

//Home
router.route("/home").post(homeController).get(getHome);
router
  .route("/home/faq")
  .post(addFaq)
  .patch(updateFaq)
  .get(getAllFaq)
  .delete(deleteFaq);
router.route("/home/faq/:id").get(getFaq);

//Banner
router
  .route("/banner")
  .post(fileUploader([{ name: "image", maxCount: 1 }], "banner"), createBanner)
  .get(getAllBanners);
router
  .route("/banner/:id")
  .get(getBanner)
  .patch(fileUploader([{ name: "image", maxCount: 1 }], "banner"), updateBanner)
  .delete(deleteBanner);

//Product
router
  .route("/product")
  .get(getAllProducts)
  .post(
    fileUploader(
      [
        { name: "thumbImage", maxCount: 1 },
        { name: "catalogueImage", maxCount: 20 },
        { name: "downloadImage", maxCount: 1 },
        { name: "video", maxCount: 1 },
      ],
      "product"
    ),
    createProduct
  );
router
  .route("/product/:id")
  .patch(
    fileUploader(
      [
        { name: "thumbImage", maxCount: 1 },
        { name: "catalogueImage", maxCount: 20 },
        { name: "downloadImage", maxCount: 1 },
        { name: "video", maxCount: 1 },
      ],
      "product"
    ),
    updateProduct
  )
  .get(getProduct)
  .delete(deleteProduct);

//Product
router.route("/productQuery").get(getAllProductQueries);
router
  .route("/productQuery/:id")
  .patch(updateProductQuery)
  .get(getProductQuery)
  .delete(deleteProductQuery);

//Discount
router.route("/discount").post(createDiscount).get(getAllDiscounts);
router
  .route("/discount/:id")
  .patch(updateDiscount)
  .get(getDiscount)
  .delete(deleteDiscount);

//Sale Person
router.post("/salePersonAll", getAllSalePerson);
router.post("/salePersonDetail", getAllSalePersonDetail);

//Target
router.route("/target").post(createTarget).get(getAllTargets);
router
  .route("/target/:id")
  .patch(updateTarget)
  .get(getTargetById)
  .delete(deleteTarget);

router.get("/bussiness", getSalesPersonPerformance);

//collection
router.get("/collectionDetail", getAllCollectionDetail);
// router.get("/overdueUsers", getOverdueUsers);
router.get("/currentMonthUser", getCurrentMonthUsers);
router.get("/totalTargetUser", getTotalTargetUsers);
router.get("/totalCollectedUser", getTotalCollectedUsers);

//Redemption
router.post("/redemptionAll", getAllRedemption);
router.post("/pendingRedemptionAll", getAllPendingRedemption);
router.post("/upcomingMaturityAll", getUpcomingMaturity);
router.post("/foreClosedAll", getAllForclosedPlans);
router.patch("/updateRedemption", updateRedemption);

//user Plan
router.post("/userPlan", getUserPlan);
router.get("/planStatements", getPlanStatements);
router.get("/getPlanDetails", getPlanDetails);
router.get("/planDock", getDockDetail);

//Exhibition
router
  .route("/exhibition")
  .post(
    fileUploader([{ name: "file", maxCount: 1 }], "exhibition"),
    createExhibition
  )
  .get(getAllExhibitions);
router
  .route("/exhibition/:id")
  .get(getExhibitionById)
  .patch(
    fileUploader([{ name: "file", maxCount: 1 }], "exhibition"),
    updateExhibition
  )
  .delete(deleteExhibition);

//Seasonal
router
  .route("/seasonal")
  .post(
    fileUploader([{ name: "file", maxCount: 1 }], "seasonal"),
    createSeasonal
  )
  .get(getAllSeasonal);

router
  .route("/seasonal/:id")
  .get(getSeasonal)
  .patch(
    fileUploader([{ name: "file", maxCount: 1 }], "seasonal"),
    updateSeasonal
  )
  .delete(deleteSeasonal);

//Cupon
router.route("/cupon").post(createCuponCode).get(getAllCuponCodes);
router
  .route("/cupon/:id")
  .patch(updateCuponCode)
  .get(getCuponCodeById)
  .delete(deleteCupon);

//Transaction
router.route("/transaction").post(getAllTransaction);
router.route("/transaction/:id").patch(updateTransaction);

// State Routes
router.post("/states", createState);
router.get("/states", getAllStates);
router.get("/states/:id", getStateById);
router.patch("/states/:id", updateState);
router.delete("/states/:id", deleteState);

// Location Routes
router.post("/locations", createLocation);
router.get("/locations", getAllLocations);
router.get("/locations/:id", getLocationById);
router.patch("/locations/:id", updateLocation);
router.delete("/locations/:id", deleteLocation);

// Collection Agent Mobile Routes
router.post("/collectionAgentMobiles", createCollectionAgentMobile);
router.get("/collectionAgentMobiles", getAllCollectionAgentMobiles);
router.get("/collectionAgentMobiles/:id", getCollectionAgentMobileById);
router.patch("/collectionAgentMobiles/:id", updateCollectionAgentMobile);
router.delete("/collectionAgentMobiles/:id", deleteCollectionAgentMobile);

//Collection Agent
router.post("/collectionAgentAll", getAllCollectionAgents);
router
  .route("/collectionAgentUser")
  .post(assignUserToCollectionAgent)
  .delete(removeUserFromCollectionAgent);

//contest
router
  .route("/contest")
  .post(fileUploader([{ name: "file", maxCount: 1 }], "contest"), createContest)
  .get(getAllCoontest);

router
  .route("/contest/:id")
  .get(getContest)
  .patch(
    fileUploader([{ name: "file", maxCount: 1 }], "contest"),
    updateContest
  )
  .delete(deleteContest);

// Cashier Agent Mobile Routes
router.post("/cashierMobiles", createCashierMobile);
router.get("/cashierMobiles", getAllCashierMobiles);
router.get("/cashierMobiles/:id", getCashierMobileById);
router.patch("/cashierMobiles/:id", updateCashierMobile);
router.delete("/cashierMobiles/:id", deleteCashierMobile);

//Target
router
  .route("/collectionAgentTarget")
  .post(createCollectionTarget)
  .get(getAllCollectionTargets);
router
  .route("/collectionAgentTarget/:id")
  .patch(updateCollectionTarget)
  .get(getCollectionTargetById)
  .delete(deleteCollectionTarget);

//user
router.route("/user").post(createUser);
router.route("/userAll").post(getAllUsers);
router
  .route("/user/:id")
  .get(getUser)
  .patch(
    fileUploader([{ name: "file", maxCount: 1 }], "profileImage"),
    updateUser
  )
  .delete(deleteUser);

//user
router.route("/saleperson").get(getAllSalePerson).post(createSalePerson);
router
  .route("/saleperson/:id")
  .get(getSalePerson)
  .patch(updateSalePerson)
  .delete(deleteSalePerson);

//user
router
  .route("/collectionAgent")
  .get(getAllCollectionAgents)
  .post(createCollectionAgent);
router
  .route("/collectionAgent/:id")
  .get(getCollectionAgent)
  .patch(updateCollectionAgent)
  .delete(deleteCollectionAgent);

//Role
router.route("/role").post(createRole).get(getAllRoles);
router.route("/role/:id").patch(updateRole).delete(deleteRole).get(getRoleById);

//myWallet
router.get("/myWallet", myWallet);

//planDock
router.patch(
  "/planDock/:id",
  fileUploader(
    [
      { name: "panImage", maxCount: 2 },
      { name: "adharImage", maxCount: 2 },
      { name: "gurdianProofImage", maxCount: 2 },
      { name: "governmentIdProofImage", maxCount: 2 },
      { name: "form60Image", maxCount: 2 },
    ],
    "user"
  ),
  updatePlanDock
);

router.get("/getUserBySalesPerson", getUsersBySalesperson);
router.get("/collectionAgentUser", getAllAssignUser);
router.get("/getCurrentMonthCollectedUser", getCurrentMonthCollectedUsers);

router.get("/getTodayCollectedUser", getTodayCollectedUsers);
router.get("/getTotalCollectedUser", getTotalCollectedUsersForAdmin);
router.get("/getPreviousMonthPaidEmis", getPreviousMonthPaidEMIs);
router.get("/getPreviousMonthPendingEmis", getPreviousMonthPendingEMIs);
router.get("/getPreviousEmis", getPreviousEMIList);

//ntb
router.route("/share").post(getAllSharesForAdmin);
router.post("/downloadList", getAllDownloadListForAdmin);
router.post("/activeUser", getAllActiveUsersForAdmin);
router.post("/enrollUser", getEnrollUsersForAdmin);
router.post("/rating", getAllRatingForAdmin);
// router.get("/dashboard", getDashboardCounts);

//collection
router.get("/overdueUsers", getOverdueUsersForAdmin);
router.get("/currentMonthPendingUser", getCurrentMonthPendingUsersForAdmin);
router.get("/totalTargetPendingUser", getTotalTargetUsersForAdmin);

router.post("/forClose", closeUserPlan);
router.post("/completePlan", completeUserPlan);
router.post("/setRedem", manageIsRedemStatus);

router.post("/assignUserToSaleperson", assignSalePersonToUserPlan);
module.exports = router;
