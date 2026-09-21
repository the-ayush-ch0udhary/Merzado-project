const mongoose = require('mongoose');

const quotationSchema = new mongoose.Schema(
  {
    rfq: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Rfq',
      required: true,
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    price: {
      type: Number,
      required: [true, 'Quoted price is required'],
      min: [0.01, 'Quoted price must be greater than zero'],
    },
    deliveryTime: {
      type: String,
      required: [true, 'Estimated delivery time is required'],
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: '',
    },
    status: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'REJECTED'],
      default: 'PENDING',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent a supplier from creating multiple duplicate bids for the same RFQ (revisions allowed via PUT)
quotationSchema.index({ rfq: 1, supplier: 1 }, { unique: true });

module.exports = mongoose.model('Quotation', quotationSchema);
