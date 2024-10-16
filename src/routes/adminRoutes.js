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

const router = express.Router();

//Authentication
router.post(
  "/register",
  fileUploader([{ name: "profileImage", maxCount: 1 }], "admin"),
  register
);
router.post("/login", login);
router.use(adminAuthenticate);

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
  .get(getGoldExchange)
  .delete(deleteGoldExchange);

//Gold Store
router
  .route("/store")
  .get(getAllStores)
  .post(fileUploader([{ name: "image", maxCount: 5 }], "store"), createStore);
router
  .route("/store/:id")
  .patch(fileUploader([{ name: "image", maxCount: 5 }], "store"), updateStore)
  .get(getStore)
  .delete(deleteStore);

//Visit
router.route("/visit").get(getAllVisit);
router.route("/visit/:id").patch(updateVisit).get(getVisit).delete(deleteVisit);

//Service
router.route("/service").get(getAllService);
router
  .route("/service/:id")
  .patch(updateService)
  .get(getService)
  .delete(deleteService);

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

module.exports = router;
