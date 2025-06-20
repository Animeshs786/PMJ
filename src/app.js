const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const morgan = require("morgan");
const cron = require("node-cron");

const { appRoutes } = require("./routes/appRoutes");
const AppError = require("./utils/AppError");
const globalErrorHandler = require("./controllers/errorController");
const { schedulePlan } = require("./controllers/user/plan/schedulePlan");
const {
  sendPlanNotifications,
} = require("./controllers/admin/notification/sendPlanNotification");

const app = express();

//body parser middleware
app.use(express.json());

//cors middleware
app.use(cors());
app.use(morgan("dev"));

cron.schedule(
  "0 11 * * *",
  async () => {
    console.log("Running status update job...");
    try {
      await schedulePlan();
      await sendPlanNotifications();
      console.log("Plan statuses updated successfully.");
    } catch (error) {
      console.error("Error updating plan statuses:", error);
    }
  },
  {
    timezone: "Asia/Kolkata", // Setting time zone to IST
  }
);
//cookie parser middleware
app.use(cookieParser());

// testing middleware
app.use("/", (req, res, next) => {
  // console.log(req.body);
  next();
});

//routes
appRoutes(app);

// unhandle route middleware
app.all("*", (req, res, next) => {
  return next(
    new AppError(`The route ${req.originalUrl} not run on this server.`, 404)
  );
});

// global error middleware
app.use(globalErrorHandler);

module.exports = app;
