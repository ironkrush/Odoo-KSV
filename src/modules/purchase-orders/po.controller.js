import * as poService from './po.service.js';

export const handleGetPos = async (req, res, next) => {
  try {
    const filterOptions = {};
    if (req.user.role === 'VENDOR') {
      filterOptions.vendorId = req.user.vendorId;
    }

    const pos = await poService.getAllPos(filterOptions);
    return res.status(200).json(pos);
  } catch (error) {
    next(error);
  }
};

export const handleGetPoById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid PO ID' });
    }

    const vendorIdFilter = req.user.role === 'VENDOR' ? req.user.vendorId : null;
    const po = await poService.getPoById(id, vendorIdFilter);

    if (!po) {
      return res.status(404).json({ error: 'PO not found' });
    }

    return res.status(200).json(po);
  } catch (error) {
    next(error);
  }
};
