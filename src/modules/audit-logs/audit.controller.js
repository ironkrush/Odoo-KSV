import * as auditService from './audit.service.js';

export const handleGetAuditLogs = async (req, res, next) => {
  try {
    const logs = await auditService.getAllAuditLogs();
    return res.status(200).json(logs);
  } catch (error) {
    next(error);
  }
};

export const handleGetDashboardAnalytics = async (req, res, next) => {
  try {
    const analytics = await auditService.getDashboardAnalytics();
    return res.status(200).json(analytics);
  } catch (error) {
    next(error);
  }
};
