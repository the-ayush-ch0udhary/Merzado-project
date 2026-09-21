const mongoose = require('mongoose');

const rfqSchema = new mongoose.Schema(
  {
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Product or service title is required'],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: [true, 'Requirement description is required'],
      trim: true,
      maxlength: 3000,
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
    },
    unit: {
      type: String,
      required: [true, 'Unit of measurement is required'],
      trim: true,
      default: 'Units',
    },
    location: {
      type: String,
      required: [true, 'Delivery location is required'],
      trim: true,
    },
    deadline: {
      type: Date,
      required: [true, 'RFQ deadline date is required'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      default: 'General Procurement',
    },
    targetBudget: {
      type: Number,
      default: null,
    },
    status: {
      type: String,
      enum: ['OPEN', 'CLOSED', 'AWARDED'],
      default: 'OPEN',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual to populate quotations count
rfqSchema.virtual('quotations', {
  ref: 'Quotation',
  localField: '_id',
  foreignField: 'rfq',
});

// Check if deadline passed and auto-mark or evaluate
rfqSchema.virtual('isExpired').get(function () {
  return this.deadline && new Date(this.deadline) < new Date();
});

module.exports = mongoose.model('Rfq', rfqSchema);
