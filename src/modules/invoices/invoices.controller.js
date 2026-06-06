import * as invoicesService from './invoices.service.js';
import { createInvoiceSchema, updateInvoiceStatusSchema } from './invoices.schema.js';

export const handleGetInvoices = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filterOptions = { status };

    if (req.user.role === 'VENDOR') {
      filterOptions.vendorId = req.user.vendorId;
    }

    const invoices = await invoicesService.getAllInvoices(filterOptions);
    return res.status(200).json(invoices);
  } catch (error) {
    next(error);
  }
};

export const handleGetInvoiceById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid invoice ID' });
    }

    const vendorIdFilter = req.user.role === 'VENDOR' ? req.user.vendorId : null;
    const invoice = await invoicesService.getInvoiceById(id, vendorIdFilter);

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    return res.status(200).json(invoice);
  } catch (error) {
    next(error);
  }
};

export const handleCreateInvoice = async (req, res, next) => {
  try {
    if (req.user.role !== 'VENDOR') {
      return res.status(403).json({ error: 'Forbidden: Only vendor users can submit invoices' });
    }

    const data = createInvoiceSchema.parse(req.body);
    const invoice = await invoicesService.createInvoice(data, req.user.vendorId, req.user.id);
    return res.status(201).json(invoice);
  } catch (error) {
    next(error);
  }
};

export const handleUpdateInvoiceStatus = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid invoice ID' });
    }

    const data = updateInvoiceStatusSchema.parse(req.body);
    const invoice = await invoicesService.updateInvoiceStatus(id, data.status, req.user.id);
    return res.status(200).json(invoice);
  } catch (error) {
    next(error);
  }
};
