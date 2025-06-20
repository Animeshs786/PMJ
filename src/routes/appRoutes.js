const express = require("express");

const userRoutes = require("./userRoutes");
const adminRoutes = require("./adminRoutes");
const salePersonRoutes = require("./salePersonRoutes");
const collectionAgentRoutes = require("./collectionAgentRoutes");
const cashierRoutes = require("./cashierRoutes");

exports.appRoutes = (app) => {
  app.use("/public", express.static("public"));
  app.use("/api/user", userRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/salePerson", salePersonRoutes);
  app.use("/api/collectionAgent", collectionAgentRoutes);
  app.use("/api/cashier", cashierRoutes);
};
