const express = require("express");
const {
  signIn,
} = require("../controllers/collectionAgent/authController/signIn");
const {
  signUp,
} = require("../controllers/collectionAgent/authController/signUp");
const {
  otpVerify,
} = require("../controllers/collectionAgent/authController/otpVerify");
const {
  CollectionAgentAuthenticate,
} = require("../controllers/collectionAgent/authController/collectionAgentAuthenticate");
const {
  getAllAssignUser,
} = require("../controllers/collectionAgent/AssignUser/getAllAssignUser");
const {
  getCurrentMonthCollectedUsers,
} = require("../controllers/collectionAgent/AssignUser/getCurrentMonthCollectedUsers");
const {
  getTodayCollectedUsers,
} = require("../controllers/collectionAgent/AssignUser/getTodayCollectedUsers");
const {
  getTotalCollectedUsers,
} = require("../controllers/collectionAgent/AssignUser/totalCollectedUsers");
const {
  getPreviousMonthPaidEMIs,
} = require("../controllers/collectionAgent/AssignUser/getPreviousMonthCollectedUser");
const {
  getPreviousMonthPendingEMIs,
} = require("../controllers/collectionAgent/AssignUser/getPreviousMonthPendingEmis");
const {
  getAnalytics,
} = require("../controllers/collectionAgent/AssignUser/getAnalytics");
const {
  getPreviousEMIList,
} = require("../controllers/collectionAgent/AssignUser/getPreviousEmiList");
const {
  getTransactionList,
} = require("../controllers/collectionAgent/AssignUser/getTransactionList");
const {
  createDenomination,
} = require("../controllers/collectionAgent/denomination/createDenomination");
const router = express.Router();

//Authentication
router.post("/register", signUp);
router.post("/signIn", signIn);
router.post("/verifyOtp", otpVerify);

router.use(CollectionAgentAuthenticate);

//Assign User
router.get("/assignUser", getAllAssignUser);
router.get("/currentMonthCollected", getCurrentMonthCollectedUsers);
router.get("/todayCollectedUser", getTodayCollectedUsers);
router.get("/totalCollectedUser", getTotalCollectedUsers);
router.get("/previousMonthPaidEmi", getPreviousMonthPaidEMIs);
router.get("/previousMonthPendingEmi", getPreviousMonthPendingEMIs);
router.get("/analytics", getAnalytics);
router.get("/previousEmiUser", getPreviousEMIList);
router.get("/transactionHistory", getTransactionList);

//Denomination
router.post("/denomination", createDenomination);

module.exports = router;
