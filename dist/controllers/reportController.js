"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportReport =
  exports.getYearlyReport =
  exports.getMonthlyReport =
  exports.getCategoryReport =
  exports.getBudgetReport =
  exports.getExpenseReport =
    void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Get expense report
const getExpenseReport = async (req, res) => {
  try {
    res.json({
      success: true,
      data: [],
      message: "Reports coming soon",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to fetch expense report",
      },
    });
  }
};
exports.getExpenseReport = getExpenseReport;
// Get budget report
const getBudgetReport = async (req, res) => {
  try {
    res.json({
      success: true,
      data: [],
      message: "Reports coming soon",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to fetch budget report",
      },
    });
  }
};
exports.getBudgetReport = getBudgetReport;
// Get category report
const getCategoryReport = async (req, res) => {
  try {
    res.json({
      success: true,
      data: [],
      message: "Reports coming soon",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to fetch category report",
      },
    });
  }
};
exports.getCategoryReport = getCategoryReport;
// Get monthly report
const getMonthlyReport = async (req, res) => {
  try {
    res.json({
      success: true,
      data: [],
      message: "Reports coming soon",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to fetch monthly report",
      },
    });
  }
};
exports.getMonthlyReport = getMonthlyReport;
// Get yearly report
const getYearlyReport = async (req, res) => {
  try {
    res.json({
      success: true,
      data: [],
      message: "Reports coming soon",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to fetch yearly report",
      },
    });
  }
};
exports.getYearlyReport = getYearlyReport;
// Export report
const exportReport = async (req, res) => {
  try {
    res.json({
      success: true,
      data: [],
      message: "Export feature coming soon",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to export report",
      },
    });
  }
};
exports.exportReport = exportReport;
//# sourceMappingURL=reportController.js.map
