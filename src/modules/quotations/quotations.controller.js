import * as quotationsService from './quotations.service.js';
import { submitQuotationSchema } from './quotations.schema.js';

export const handleGetQuotations = async (req, res, next) => {
  try {
    const { rfqId } = req.query;
    const filterOptions = {};

    if (rfqId) {
      filterOptions.rfqId = parseInt(rfqId);
    }

    // If role is VENDOR, they can only retrieve their own quotations
    if (req.user.role === 'VENDOR') {
      filterOptions.vendorId = req.user.vendorId;
    }

    const quotations = await quotationsService.getAllQuotations(filterOptions);
    return res.status(200).json(quotations);
  } catch (error) {
    next(error);
  }
};

export const handleGetQuotationById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid quotation ID' });
    }

    const vendorIdFilter = req.user.role === 'VENDOR' ? req.user.vendorId : null;
    const quotation = await quotationsService.getQuotationById(id, vendorIdFilter);

    if (!quotation) {
      return res.status(404).json({ error: 'Quotation not found' });
    }

    return res.status(200).json(quotation);
  } catch (error) {
    next(error);
  }
};

export const handleSubmitQuotation = async (req, res, next) => {
  try {
    if (req.user.role !== 'VENDOR') {
      return res.status(403).json({ error: 'Forbidden: Only vendor users can submit quotations' });
    }

    const data = submitQuotationSchema.parse(req.body);
    const quotation = await quotationsService.submitQuotation(data, req.user.vendorId, req.user.id);
    return res.status(201).json(quotation);
  } catch (error) {
    next(error);
  }
};

// --- Compare Quotations (Screen 7) ---
export const handleGetQuotationsComparison = async (req, res, next) => {
  try {
    const rfqId = parseInt(req.query.rfqId);
    if (isNaN(rfqId)) {
      return res.status(400).json({ error: 'Valid rfqId parameter required' });
    }

    const comparison = await quotationsService.getQuotationsComparison(rfqId);
    return res.status(200).json(comparison);
  } catch (error) {
    next(error);
  }
};

// --- Select Winning Quotation (Initiates Approval Workflow - Screen 7) ---
export const handleSelectQuotation = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid quotation ID' });
    }

    const workflow = await quotationsService.selectQuotationForApproval(id, req.user.id);
    return res.status(200).json({
      message: 'Quotation successfully selected. L1 approval workflow initiated.',
      workflow,
    });
  } catch (error) {
    next(error);
  }
};
