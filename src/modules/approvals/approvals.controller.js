import * as approvalsService from './approvals.service.js';
import { approvalActionSchema } from './approvals.schema.js';

export const handleGetPendingWorkflows = async (req, res, next) => {
  try {
    const workflows = await approvalsService.getPendingWorkflows(req.user.role);
    return res.status(200).json(workflows);
  } catch (error) {
    next(error);
  }
};

export const handleApprovalAction = async (req, res, next) => {
  try {
    const data = approvalActionSchema.parse(req.body);
    const result = await approvalsService.submitApprovalAction(data.workflowId, data.action, data.remarks, req.user);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
