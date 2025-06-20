const express = require("express");
const {
  register,
} = require("../controllers/salePerson/authController/register");
const { login } = require("../controllers/salePerson/authController/login");
const { signIn } = require("../controllers/salePerson/authController/signIn");
const {
  otpVerify,
} = require("../controllers/salePerson/authController/otpVerify");
const {
  salePersonAuthenticate,
} = require("../controllers/salePerson/authController/salePersonAuthenticate");
const { createShare } = require("../controllers/salePerson/NTB/createShare");
const { getAllShare } = require("../controllers/salePerson/NTB/getAllShare");
const {
  getAllDownloadList,
} = require("../controllers/salePerson/NTB/getAllDownloadList");
const {
  getAllActiveUser,
} = require("../controllers/salePerson/NTB/getAllActiveUser");
const {
  getEnrollUsers,
} = require("../controllers/salePerson/NTB/getEnrollUsers");
const { getAllRating } = require("../controllers/salePerson/NTB/getAllRating");
const {
  getDashboardCounts,
} = require("../controllers/salePerson/NTB/getDashboardCount");
const {
  getAllRedemption,
} = require("../controllers/salePerson/Redemption/getAllRedemption");
const {
  getAllPendingRedemption,
} = require("../controllers/salePerson/Redemption/getAllPendingRedemption");
const {
  getUpcomingMaturity,
} = require("../controllers/salePerson/Redemption/getUpcomingMaturity");
const {
  redemptionViewCount,
} = require("../controllers/salePerson/Redemption/redemptionViewCount");
const {
  getSalesPersonPerformance,
} = require("../controllers/salePerson/business/getSalePersonPeformance");
const {
  getAllCollectionDetail,
} = require("../controllers/salePerson/collection/getAllCollectionDetail");
const {
  getOverdueUsers,
} = require("../controllers/salePerson/collection/getOverdueUsers");
const {
  getCurrentMonthUsers,
} = require("../controllers/salePerson/collection/getCurrentMonthUser");
const {
  getTotalTargetUsers,
} = require("../controllers/salePerson/collection/getTotaltargetUser");
const {
  getTotalCollectedUsers,
} = require("../controllers/salePerson/collection/getTotalCollectedUser");
const {
  getAllPlan,
} = require("../controllers/salePerson/reEnrollment/getAllPlan");
const {
  getRepeatPurchasePlans,
} = require("../controllers/salePerson/reEnrollment/getRepeatPurchasePlan");
const {
  getSinglePurchasePlans,
} = require("../controllers/salePerson/reEnrollment/getSinglePurchasePlan");
const {
  getAllServiceQury,
} = require("../controllers/salePerson/service/getAllServiceQury");
const {
  getAllGoldQuery,
} = require("../controllers/salePerson/oldGold/getAllGoldQuery");
const {
  getUsersBySalesperson,
} = require("../controllers/salePerson/user/getUsersBySaleperson");
const {
  getSpecialOccasions,
} = require("../controllers/salePerson/user/getSpecialOccassion");
const {
  getAllExhibitions,
} = require("../controllers/salePerson/exhibition/getAllExhibition");
const {
  getExhibitionById,
} = require("../controllers/salePerson/exhibition/getExhibition");
const {
  getAllSeasonal,
} = require("../controllers/salePerson/seasonal/getAllSeasonal");
const {
  getSeasonal,
} = require("../controllers/salePerson/seasonal/getSeasonal");
const {
  getLeaderboard,
} = require("../controllers/salePerson/leaderboard/getLeaderboard");
const {
  getAllServiceCount,
} = require("../controllers/salePerson/service/getAllServiceCount");
const {
  getAllGoldQueryCount,
} = require("../controllers/salePerson/oldGold/getAllGoldQueryCount");
const {
  getSpecialOccasionsCount,
} = require("../controllers/salePerson/user/getSpecialOcassionsCount");
const {
  getJoinAniversaryUsers,
} = require("../controllers/salePerson/user/getJoinAniversaryUsers");
const {
  getJoinAnniversaryCount,
} = require("../controllers/salePerson/user/getJoinAniversaryCount");
const {
  getAllPlanCount,
} = require("../controllers/salePerson/reEnrollment/getAllPlanCount");
const {
  getSinglePurchasePlansCount,
} = require("../controllers/salePerson/reEnrollment/getSinglePurchasePlanCount");
const {
  getRepeatPurchasePlansCount,
} = require("../controllers/salePerson/reEnrollment/getRepeatPurchasePlanCount");
const {
  getAchievedUserList,
} = require("../controllers/salePerson/leaderboard/getAchivedUserList");
const {
  getIncentiveList,
} = require("../controllers/salePerson/incentive/getIncentive");
const {
  getAllContest,
} = require("../controllers/salePerson/contest/getAllContest");
const { getContest } = require("../controllers/salePerson/contest/getContest");
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/signIn", signIn);
router.post("/verifyOtp", otpVerify);

router.use(salePersonAuthenticate);

//NTB
router.route("/share").post(createShare).get(getAllShare);
router.get("/downloadList", getAllDownloadList);
router.get("/activeUser", getAllActiveUser);
router.get("/enrollUser", getEnrollUsers);
router.get("/rating", getAllRating);
router.get("/dashboard", getDashboardCounts);

//Redemption
router.get("/redemption", getAllRedemption);
router.get("/pendingRedemption", getAllPendingRedemption);
router.get("/upcomingMaturity", getUpcomingMaturity);
router.get("/redemptionCount", redemptionViewCount);

//Bussiness
router.get("/bussiness", getSalesPersonPerformance);

//Collection
router.get("/collectionDetail", getAllCollectionDetail);
router.get("/overdueUsers", getOverdueUsers);
router.get("/currentMonthUser", getCurrentMonthUsers);
router.get("/totalTargetUser", getTotalTargetUsers);
router.get("/totalCollectedUser", getTotalCollectedUsers);

//Re-Enrollment
router.get("/totalPlan", getAllPlan);
router.get("/totalPlanCount", getAllPlanCount);
router.get("/repeatPurchase", getRepeatPurchasePlans);
router.get("/repeatPurchaseCount", getRepeatPurchasePlansCount);
router.get("/singlePurchase", getSinglePurchasePlans);
router.get("/singlePurchaseCount", getSinglePurchasePlansCount);

router.get("/service", getAllServiceQury);
router.get("/serviceCount", getAllServiceCount);
router.get("/gold", getAllGoldQuery);
router.get("/goldCount", getAllGoldQueryCount);

router.get("/salePersonUser", getUsersBySalesperson);
router.get("/occassion", getSpecialOccasions);
router.get("/occassionCount", getSpecialOccasionsCount);
router.get("/joinAniversary", getJoinAniversaryUsers);
router.get("/joinAniversaryCount", getJoinAnniversaryCount);

//Exhibition
router.route("/exhibition").get(getAllExhibitions);
router.route("/exhibition/:id").get(getExhibitionById);

//Seasonal
router.route("/seasonal").get(getAllSeasonal);
router.route("/seasonal/:id").get(getSeasonal);

//leaderboard
router.get("/leaderboard", getLeaderboard);
router.get("/achivedUser", getAchievedUserList);

//Incentive
router.get("/incentive", getIncentiveList);

//Seasonal
router.route("/seasonal").get(getAllContest);
router.route("/seasonal/:id").get(getContest);

module.exports = router;
