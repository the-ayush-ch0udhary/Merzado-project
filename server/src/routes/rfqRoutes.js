const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const {
  rfqRepository,
  quotationRepository,
  userRepository,
} = require('../repositories/dataRepository');
const { requireAuth, JWT_SECRET } = require('../middleware/authMiddleware');
const { requireBuyer } = require('../middleware/roleMiddleware');

// Optional auth helper to check if request has a valid token
const optionalAuth = async (req, res, next) => {
  try {
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = await userRepository.findById(decoded.id);
    }
  } catch (err) {
    // continue unauthenticated
  }
  next();
};

// @route   POST /api/rfqs
// @desc    Create a new RFQ (Buyer only)
router.post('/', requireAuth, requireBuyer, async (req, res) => {
  try {
    const {
      title,
      description,
      quantity,
      unit,
      location,
      deadline,
      category,
      targetBudget,
    } = req.body;

    if (!title || !description || !quantity || !location || !deadline) {
      return res.status(400).json({
        success: false,
        message:
          'Title, description, quantity, delivery location, and deadline are required.',
      });
    }

    if (Number(quantity) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be greater than 0.',
      });
    }

    const deadlineDate = new Date(deadline);
    if (isNaN(deadlineDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid deadline date provided.',
      });
    }

    if (deadlineDate <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'RFQ deadline must be a future date and time.',
      });
    }

    const buyerId = req.user._id || req.user.id;
    const rfq = await rfqRepository.create({
      buyer: buyerId,
      title: title.trim(),
      description: description.trim(),
      quantity: Number(quantity),
      unit: unit ? unit.trim() : 'Units',
      location: location.trim(),
      deadline: deadlineDate,
      category: category ? category.trim() : 'General Procurement',
      targetBudget: targetBudget ? Number(targetBudget) : null,
      status: 'OPEN',
    });

    return res.status(201).json({
      success: true,
      message: 'RFQ created successfully.',
      rfq,
    });
  } catch (error) {
    console.error('Create RFQ error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create RFQ.',
      error: error.message,
    });
  }
});

// @route   GET /api/rfqs
// @desc    Browse & search available RFQs (Marketplace feed)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { search, category, status, sortBy } = req.query;

    const rfqs = await rfqRepository.findAll({
      search,
      category,
      status,
      sortBy,
    });

    const rfqIds = rfqs.map((r) => r._id || r.id);
    const statsMap = await quotationRepository.getStatsForRfqs(rfqIds);

    // Check if supplier has submitted a quote
    let userQuotesMap = {};
    if (req.user && req.user.role === 'SUPPLIER') {
      const supplierId = req.user._id || req.user.id;
      for (const rfqId of rfqIds) {
        const q = await quotationRepository.findByRfqAndSupplier(rfqId, supplierId);
        if (q) userQuotesMap[rfqId.toString()] = q;
      }
    }

    const formattedRfqs = rfqs.map((rfq) => {
      const idStr = (rfq._id || rfq.id).toString();
      const stats = statsMap[idStr] || { count: 0, minPrice: null };
      return {
        ...rfq,
        quotationCount: stats.count,
        lowestQuotePrice: stats.minPrice,
        myQuotation: userQuotesMap[idStr] || null,
        isExpired: new Date(rfq.deadline) < new Date(),
      };
    });

    return res.status(200).json({
      success: true,
      count: formattedRfqs.length,
      rfqs: formattedRfqs,
    });
  } catch (error) {
    console.error('Get RFQs error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch RFQs.',
      error: error.message,
    });
  }
});

// @route   GET /api/rfqs/buyer/my-rfqs
// @desc    View all RFQs submitted by the logged-in Buyer
router.get('/buyer/my-rfqs', requireAuth, requireBuyer, async (req, res) => {
  try {
    const buyerId = req.user._id || req.user.id;
    const rfqs = await rfqRepository.findByBuyer(buyerId);

    const rfqIds = rfqs.map((r) => r._id || r.id);
    const statsMap = await quotationRepository.getStatsForRfqs(rfqIds);

    const enrichedRfqs = rfqs.map((rfq) => {
      const idStr = (rfq._id || rfq.id).toString();
      const stat = statsMap[idStr] || {
        count: 0,
        minPrice: null,
        acceptedCount: 0,
      };
      return {
        ...rfq,
        quotationCount: stat.count,
        lowestQuotePrice: stat.minPrice,
        hasAcceptedQuote: stat.acceptedCount > 0,
        isExpired: new Date(rfq.deadline) < new Date(),
      };
    });

    return res.status(200).json({
      success: true,
      rfqs: enrichedRfqs,
    });
  } catch (error) {
    console.error('Get buyer RFQs error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch your RFQs.',
      error: error.message,
    });
  }
});

// @route   GET /api/rfqs/:id
// @desc    Open and view complete RFQ details
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const rfq = await rfqRepository.findById(req.params.id);

    if (!rfq) {
      return res.status(404).json({
        success: false,
        message: 'RFQ not found.',
      });
    }

    const rfqId = rfq._id || rfq.id;
    const quotes = await quotationRepository.findByRfq(rfqId);
    rfq.quotationCount = quotes.length;
    rfq.isExpired = new Date(rfq.deadline) < new Date();

    if (req.user && req.user.role === 'SUPPLIER') {
      const supplierId = req.user._id || req.user.id;
      rfq.myQuotation = await quotationRepository.findByRfqAndSupplier(
        rfqId,
        supplierId
      );
    }

    return res.status(200).json({
      success: true,
      rfq,
    });
  } catch (error) {
    console.error('Get RFQ by ID error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve RFQ details.',
      error: error.message,
    });
  }
});

// @route   PUT /api/rfqs/:id
// @desc    Edit/manage RFQ details (Buyer only, must own RFQ)
router.put('/:id', requireAuth, requireBuyer, async (req, res) => {
  try {
    const rfq = await rfqRepository.findRawById(req.params.id);

    if (!rfq) {
      return res.status(404).json({
        success: false,
        message: 'RFQ not found.',
      });
    }

    const buyerId = (rfq.buyer?._id || rfq.buyer).toString();
    const userId = (req.user._id || req.user.id).toString();

    if (buyerId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized. You can only edit RFQs you created.',
      });
    }

    const {
      title,
      description,
      quantity,
      unit,
      location,
      deadline,
      category,
      targetBudget,
      status,
    } = req.body;

    const updateData = {};
    if (quantity && Number(quantity) > 0) updateData.quantity = Number(quantity);
    if (deadline) updateData.deadline = new Date(deadline);
    if (title) updateData.title = title.trim();
    if (description) updateData.description = description.trim();
    if (unit) updateData.unit = unit.trim();
    if (location) updateData.location = location.trim();
    if (category) updateData.category = category.trim();
    if (targetBudget !== undefined)
      updateData.targetBudget = targetBudget ? Number(targetBudget) : null;
    if (status && ['OPEN', 'CLOSED', 'AWARDED'].includes(status))
      updateData.status = status;

    const updated = await rfqRepository.updateById(req.params.id, updateData);

    return res.status(200).json({
      success: true,
      message: 'RFQ updated successfully.',
      rfq: updated,
    });
  } catch (error) {
    console.error('Update RFQ error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update RFQ.',
      error: error.message,
    });
  }
});

// @route   PATCH /api/rfqs/:id/status
// @desc    Change RFQ status (OPEN / CLOSED)
router.patch('/:id/status', requireAuth, requireBuyer, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['OPEN', 'CLOSED', 'AWARDED'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be OPEN, CLOSED, or AWARDED.',
      });
    }

    const rfq = await rfqRepository.findRawById(req.params.id);
    if (!rfq) {
      return res.status(404).json({
        success: false,
        message: 'RFQ not found.',
      });
    }

    const buyerId = (rfq.buyer?._id || rfq.buyer).toString();
    const userId = (req.user._id || req.user.id).toString();

    if (buyerId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized. You can only manage your own RFQs.',
      });
    }

    const updated = await rfqRepository.updateById(req.params.id, { status });

    return res.status(200).json({
      success: true,
      message: `RFQ marked as ${status}.`,
      rfq: updated,
    });
  } catch (error) {
    console.error('Change RFQ status error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update RFQ status.',
      error: error.message,
    });
  }
});

// @route   DELETE /api/rfqs/:id
// @desc    Delete RFQ and associated quotations (Buyer only)
router.delete('/:id', requireAuth, requireBuyer, async (req, res) => {
  try {
    const rfq = await rfqRepository.findRawById(req.params.id);
    if (!rfq) {
      return res.status(404).json({
        success: false,
        message: 'RFQ not found.',
      });
    }

    const buyerId = (rfq.buyer?._id || rfq.buyer).toString();
    const userId = (req.user._id || req.user.id).toString();

    if (buyerId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized. You can only delete your own RFQs.',
      });
    }

    await rfqRepository.deleteById(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'RFQ and associated quotations deleted successfully.',
    });
  } catch (error) {
    console.error('Delete RFQ error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete RFQ.',
      error: error.message,
    });
  }
});

module.exports = router;
