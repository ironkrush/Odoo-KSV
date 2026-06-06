import * as rfqsService from './rfqs.service.js';
import { createRfqSchema } from './rfqs.schema.js';

export const handleGetRfqs = async (req, res, next) => {
  try {
    const { status, category } = req.query;
    const filterOptions = { status, category };

    // Vendors can only see RFQs they were invited to
    if (req.user.role === 'VENDOR') {
      filterOptions.vendorId = req.user.vendorId;
    }

    const rfqs = await rfqsService.getAllRfqs(filterOptions);
    return res.status(200).json(rfqs);
  } catch (error) {
    next(error);
  }
};

export const handleGetRfqById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid RFQ ID' });
    }

    const vendorIdFilter = req.user.role === 'VENDOR' ? req.user.vendorId : null;
    const rfq = await rfqsService.getRfqById(id, vendorIdFilter);

    if (!rfq) {
      return res.status(404).json({ error: 'RFQ not found' });
    }

    return res.status(200).json(rfq);
  } catch (error) {
    next(error);
  }
};

export const handleCreateRfq = async (req, res, next) => {
  try {
    const data = createRfqSchema.parse(req.body);
    const rfq = await rfqsService.createRfq(data, req.user.id);
    return res.status(201).json(rfq);
  } catch (error) {
    next(error);
  }
};
