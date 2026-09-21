const express = require('express');
const router = express.Router();
const {
  quotationRepository,
  rfqRepository,
} = require('../repositories/dataRepository');
const { requireAuth } = require('../middleware/authMiddleware');
const { requireSupplier, requireBuyer } = require('../middleware/roleMiddleware');

// @route   POST /api/quotations/rfq/:rfqId
// @desc    Submit or revise a quotation for an RFQ (Supplier only)
router.post('/rfq/:rfqId', requireAuth, requireSupplier, async (req, res) => {
  try {
    const { rfqId } = req.params;
    const { price, deliveryTime, notes } = req.body;

    if (!price || !deliveryTime) {
      return res.status(400).json({
        success: false,
        message: 'Quoted price and estimated delivery time are required.',
      });
    }

    if (Number(price) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quoted price must be greater than 0.',
      });
    }

    const rfq = await rfqRepository.findRawById(rfqId);
    if (!rfq) {
      return res.status(404).json({
        success: false,
        message: 'RFQ not found.',
      });
    }

    if (rfq.status !== 'OPEN') {
      return res.status(400).json({
        success: false,
        message: `Cannot submit quotation. This RFQ is currently ${rfq.status}.`,
      });
    }

    if (new Date(rfq.deadline) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot submit quotation. The deadline for this RFQ has expired.',
      });
    }

    const supplierId = req.user._id || req.user.id;
    const quotation = await quotationRepository.createOrUpdate({
      rfqId,
      supplierId,
      price: Number(price),
      deliveryTime: deliveryTime.trim(),
      notes: notes ? notes.trim() : '',
    });

    return res.status(201).json({
      success: true,
      message: 'Quotation submitted successfully.',
      quotation,
    });
  } catch (error) {
    console.error('Submit quotation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit quotation.',
      error: error.message,
    });
  }
});

// @route   GET /api/quotations/rfq/:rfqId
// @desc    View quotations received for a specific RFQ (Buyer only, must own RFQ)
router.get('/rfq/:rfqId', requireAuth, requireBuyer, async (req, res) => {
  try {
    const { rfqId } = req.params;

    const rfq = await rfqRepository.findRawById(rfqId);
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
        message: 'Unauthorized. You can only view quotations for your own RFQs.',
      });
    }

    const quotations = await quotationRepository.findByRfq(rfqId);

    return res.status(200).json({
      success: true,
      count: quotations.length,
      rfq: {
        id: rfq._id || rfq.id,
        title: rfq.title,
        quantity: rfq.quantity,
        unit: rfq.unit,
        status: rfq.status,
        deadline: rfq.deadline,
        targetBudget: rfq.targetBudget,
      },
      quotations,
    });
  } catch (error) {
    console.error('Get RFQ quotations error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch quotations for this RFQ.',
      error: error.message,
    });
  }
});

// @route   GET /api/quotations/my-quotations
// @desc    View quotations previously submitted by the logged-in Supplier
router.get('/my-quotations', requireAuth, requireSupplier, async (req, res) => {
  try {
    const supplierId = req.user._id || req.user.id;
    const quotations = await quotationRepository.findBySupplier(supplierId);

    return res.status(200).json({
      success: true,
      count: quotations.length,
      quotations,
    });
  } catch (error) {
    console.error('Get supplier quotations error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch your quotations.',
      error: error.message,
    });
  }
});

// @route   PATCH /api/quotations/:id/status
// @desc    Accept or Reject a quotation (Buyer only, must own the RFQ)
router.patch('/:id/status', requireAuth, requireBuyer, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['ACCEPTED', 'REJECTED', 'PENDING'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid quotation status. Must be ACCEPTED, REJECTED, or PENDING.',
      });
    }

    const quotation = await quotationRepository.findById(req.params.id);
    if (!quotation) {
      return res.status(404).json({
        success: false,
        message: 'Quotation not found.',
      });
    }

    const buyerId = (quotation.rfq?.buyer?._id || quotation.rfq?.buyer).toString();
    const userId = (req.user._id || req.user.id).toString();

    if (buyerId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized. You can only evaluate quotations for your own RFQs.',
      });
    }

    const updated = await quotationRepository.updateStatus(req.params.id, status);

    return res.status(200).json({
      success: true,
      message: `Quotation marked as ${status}.`,
      quotation: updated,
    });
  } catch (error) {
    console.error('Update quotation status error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update quotation status.',
      error: error.message,
    });
  }
});

module.exports = router;
