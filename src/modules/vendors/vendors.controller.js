import * as vendorsService from './vendors.service.js';
import { createVendorSchema, updateVendorSchema } from './vendors.schema.js';

export const handleGetVendors = async (req, res, next) => {
  try {
    const { status, category, search } = req.query;
    const vendors = await vendorsService.getAllVendors({ status, category, search });
    return res.status(200).json(vendors);
  } catch (error) {
    next(error);
  }
};

export const handleGetVendorById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid vendor ID' });
    }

    // RBAC check: Vendor can only retrieve their own profile
    if (req.user.role === 'VENDOR' && req.user.vendorId !== id) {
      return res.status(403).json({ error: 'Forbidden: You can only view your own vendor profile' });
    }

    const vendor = await vendorsService.getVendorById(id);
    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    return res.status(200).json(vendor);
  } catch (error) {
    next(error);
  }
};

export const handleCreateVendor = async (req, res, next) => {
  try {
    const data = createVendorSchema.parse(req.body);
    const vendor = await vendorsService.createVendor(data);
    return res.status(201).json(vendor);
  } catch (error) {
    next(error);
  }
};

export const handleUpdateVendor = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid vendor ID' });
    }

    const data = updateVendorSchema.parse(req.body);
    const vendor = await vendorsService.updateVendor(id, data);
    return res.status(200).json(vendor);
  } catch (error) {
    next(error);
  }
};
