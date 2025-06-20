const express = require("express");
const bodyParser = require("body-parser");

const { signUp } = require("../controllers/user/authController/signUp");
const { otpVerify } = require("../controllers/user/authController/otpVerify");
const {
  userAuthenticate,
} = require("../controllers/user/authController/userAuthenticate");
const {
  updateProfile,
} = require("../controllers/user/authController/updateProfile");
const fileUploader = require("../middleware/fileUploader");
const {
  updateMobile,
} = require("../controllers/user/authController/updateMobile");
const { getProfile } = require("../controllers/user/authController/getProfile");
const {
  deleteAccount,
} = require("../controllers/user/authController/deleteAccount");
const { signIn } = require("../controllers/user/authController/signIn");
const {
  personalDetail,
} = require("../controllers/user/authController/personalDetail");
const { getAllPlans } = require("../controllers/user/plan/getAllPlan");
const { getPlanById } = require("../controllers/user/plan/getPlan");
const {
  initiateUserPlan,
} = require("../controllers/user/plan/initiateUserPlan");
const { getUserPlan } = require("../controllers/user/plan/getUserPlan");
const {
  generateUserBill,
} = require("../controllers/user/plan/generateUserBill");
const { payEmiBill } = require("../controllers/user/plan/payEmiBill");
const { getInitiatePlan } = require("../controllers/user/plan/getInitiatePlan");
const {
  getPlanDiscounts,
} = require("../controllers/user/plan/getPlanDiscounts");
const { getClosePlan } = require("../controllers/user/plan/getClosePlan");
const {
  getPlanStatements,
} = require("../controllers/user/plan/getPlanStatements");
const { myWallet } = require("../controllers/user/plan/myWallet");
const {
  getAllGoldRates,
} = require("../controllers/user/goldRate/getAllGoldRate");
const {
  createGoldExchange,
} = require("../controllers/user/goldExchange/createGoldExchange");
const { getAllStores } = require("../controllers/user/store/getAllStore");
const { setLatLng } = require("../controllers/user/authController/setLatLng");
const { createVisit } = require("../controllers/user/visit/createVisit");
const { createService } = require("../controllers/user/service/createService");
const { createContact } = require("../controllers/user/contact/createContact");
const { getHome } = require("../controllers/admin/homeController/getHome");
const { getAllBanners } = require("../controllers/user/banner/getAllBanner");
const { getAllProducts } = require("../controllers/user/product/getAllProduct");
const { getProduct } = require("../controllers/user/product/getProduct");
const {
  createProductQuery,
} = require("../controllers/user/productQuery/createProductQuery");
const { getState } = require("../controllers/user/address/getState");
const { getCity } = require("../controllers/user/address/getCity");
const {
  getAllCountries,
} = require("../controllers/user/address/getAllCountries");
const { createPlanDock } = require("../controllers/user/plan/createPlanDock");
const {
  createGoldAlert,
} = require("../controllers/user/goldRate/createGoldAlert");
const { getActivePlan } = require("../controllers/user/plan/getActivePlan");
const { createRating } = require("../controllers/user/plan/createRating");
const { getPlanDetails } = require("../controllers/user/plan/getPlanDetails");
const {
  applyCuponToPlan,
} = require("../controllers/user/plan/applyCuponToPlan");
const { transactionWebhook } = require("../controllers/user/transaction/transactionWebhook");
const { getRatingStatus } = require("../controllers/user/plan/getRatingStatus");
const { getLocationByPincode } = require("../controllers/user/address/getLocationByPincode");
const { getNotifications } = require("../controllers/user/notification/getNotification");
const { readNotification } = require("../controllers/user/notification/readNotification");
const { notificationCount } = require("../controllers/user/notification/notificationCount");

const router = express.Router();

//Authentication
router.post("/signUp", signUp);
router.post("/signIn", signIn);
router.post("/verifyOtp", otpVerify);
router.patch(
  "/updateProfile",
  userAuthenticate,
  fileUploader([{ name: "profileImage", maxCount: 1 }], "user"),
  updateProfile
);
router.patch(
  "/personalDetail",
  userAuthenticate,
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
  personalDetail
);
router.get("/getProfile", userAuthenticate, getProfile);
router.patch("/updateMobile", userAuthenticate, updateMobile);
router.delete("/deleteAccount", userAuthenticate, deleteAccount);
router.patch("/setLatLng", userAuthenticate, setLatLng);

//Plan
router.get("/plan", userAuthenticate, getAllPlans);
router.post("/plan", userAuthenticate, getPlanById);
router.post("/initiatePlan", userAuthenticate, initiateUserPlan);
router.get("/userPlan", userAuthenticate, getUserPlan);
router.get("/generateUserBill", userAuthenticate, generateUserBill);
router.post("/payBill", userAuthenticate, payEmiBill);
router.get("/initiatePlan", userAuthenticate, getInitiatePlan);
router.post("/planDiscounts", userAuthenticate, getPlanDiscounts);
router.get("/closePlan", userAuthenticate, getClosePlan);
router.post("/planStatements", userAuthenticate, getPlanStatements);
router.get("/myWallet", userAuthenticate, myWallet);
router.post(
  "/planDock",
  userAuthenticate,
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
  createPlanDock
);

router.get("/activePlan", userAuthenticate, getActivePlan);
router.post("/cuponApply", userAuthenticate, applyCuponToPlan);

//Gold Rate
router.get("/goldRate", getAllGoldRates);

//Gold Exchange
router.route("/goldExchange").post(createGoldExchange);

//Store
router.get("/store", userAuthenticate, getAllStores);

//Visit
router.route("/visit").post(createVisit);

//Service
router.route("/service").post(createService);

//Contact
router.route("/contact").post(createContact);

//home
router.get("/home", getHome);

//Banner
router.get("/banner", getAllBanners);

//Product
router.get("/product", getAllProducts);
router.get("/product/:id", getProduct);

//Product Query
router.route("/productQuery").post(createProductQuery);

//Address
router.get("/getState", getState);
router.get("/getCity", getCity);
router.get("/getCountry", getAllCountries);
router.get("/pincode", getLocationByPincode);

//Gold Alert
router.post("/goldAlert", userAuthenticate, createGoldAlert);

//Rating
router.post("/rating", userAuthenticate, createRating);
router.get("/rating", userAuthenticate, getRatingStatus);

router.get("/planDetails", getPlanDetails);

router.post(
  "/transactionWebhook",
  bodyParser.raw({ type: "application/json" }),
  transactionWebhook
);

//Notification
router.route("/notification").get(userAuthenticate, getNotifications);
router
  .route("/notification/:notificationId")
  .get(userAuthenticate, readNotification);
router.get("/notificationCount", userAuthenticate, notificationCount);
// router.get(
//   "/readAllNotification",
//   userAuthenticate,
//   markAllNotificationsAsRead
// );
module.exports = router;
