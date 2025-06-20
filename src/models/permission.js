const mongoose = require("mongoose");

const permissionSchema = new mongoose.Schema({
  dashboard: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Permission = mongoose.model("Permission", permissionSchema);
module.exports = Permission;
