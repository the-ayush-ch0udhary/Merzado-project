const { getIsConnected, memoryStore } = require('../db');
const User = require('../models/User');
const Rfq = require('../models/Rfq');
const Quotation = require('../models/Quotation');
const generateId = (prefix) => `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

// User data access
const userRepository = {
  findByEmail: async (email) => {
    if (getIsConnected()) {
      return await User.findOne({ email: email.toLowerCase().trim() });
    }
    return memoryStore.users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim()) || null;
  },

  findById: async (id) => {
    if (getIsConnected()) {
      return await User.findById(id).select('-password');
    }
    const user = memoryStore.users.find((u) => u._id === id || u.id === id);
    if (!user) return null;
    const { password, ...safeUser } = user;
    return safeUser;
  },

  findRawById: async (id) => {
    if (getIsConnected()) {
      return await User.findById(id);
    }
    return memoryStore.users.find((u) => u._id === id || u.id === id) || null;
  },

  findDemoUser: async (role) => {
    if (getIsConnected()) {
      return await User.findOne({ role }).sort({ createdAt: 1 });
    }
    return memoryStore.users.find((u) => u.role === role) || null;
  },

  create: async (userData) => {
    if (getIsConnected()) {
      return await User.create(userData);
    }
    const newUser = {
      _id: generateId('user'),
      id: generateId('user'),
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    memoryStore.users.push(newUser);
    return newUser;
  },
};

// RFQ data access
const rfqRepository = {
  create: async (rfqData) => {
    if (getIsConnected()) {
      return await Rfq.create(rfqData);
    }
    const newRfq = {
      _id: generateId('rfq'),
      id: generateId('rfq'),
      ...rfqData,
      status: 'OPEN',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    memoryStore.rfqs.unshift(newRfq);
    return newRfq;
  },

  findAll: async ({ search, category, status, sortBy }) => {
    if (getIsConnected()) {
      const query = {};
      if (status && status !== 'ALL') query.status = status;
      if (category && category !== 'ALL') query.category = category;
      if (search && search.trim()) {
        const regex = new RegExp(search.trim(), 'i');
        query.$or = [{ title: regex }, { description: regex }, { location: regex }, { category: regex }];
      }

      let sortOpts = { createdAt: -1 };
      if (sortBy === 'deadline_asc') sortOpts = { deadline: 1 };
      if (sortBy === 'deadline_desc') sortOpts = { deadline: -1 };
      if (sortBy === 'quantity_desc') sortOpts = { quantity: -1 };

      const rfqs = await Rfq.find(query).populate('buyer', 'name companyName location').sort(sortOpts);
      return rfqs.map((r) => r.toObject());
    }

    // In-memory query
    let filtered = [...memoryStore.rfqs];

    if (status && status !== 'ALL') {
      filtered = filtered.filter((r) => r.status === status);
    }

    if (category && category !== 'ALL') {
      filtered = filtered.filter((r) => r.category === category);
    }

    if (search && search.trim()) {
      const s = search.toLowerCase().trim();
      filtered = filtered.filter(
        (r) =>
          r.title?.toLowerCase().includes(s) ||
          r.description?.toLowerCase().includes(s) ||
          r.location?.toLowerCase().includes(s) ||
          r.category?.toLowerCase().includes(s)
      );
    }

    // Sort
    if (sortBy === 'deadline_asc') {
      filtered.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    } else if (sortBy === 'deadline_desc') {
      filtered.sort((a, b) => new Date(b.deadline) - new Date(a.deadline));
    } else if (sortBy === 'quantity_desc') {
      filtered.sort((a, b) => Number(b.quantity) - Number(a.quantity));
    } else {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    // Populate buyer
    return filtered.map((rfq) => {
      const buyerId = rfq.buyer?._id || rfq.buyer;
      const buyer = memoryStore.users.find((u) => u._id === buyerId || u.id === buyerId);
      return {
        ...rfq,
        buyer: buyer
          ? {
              _id: buyer._id,
              name: buyer.name,
              companyName: buyer.companyName,
              location: buyer.location,
            }
          : null,
      };
    });
  },

  findById: async (id) => {
    if (getIsConnected()) {
      return await Rfq.findById(id).populate('buyer', 'name email companyName location');
    }
    const rfq = memoryStore.rfqs.find((r) => r._id === id || r.id === id);
    if (!rfq) return null;
    const buyerId = rfq.buyer?._id || rfq.buyer;
    const buyer = memoryStore.users.find((u) => u._id === buyerId || u.id === buyerId);
    return {
      ...rfq,
      buyer: buyer
        ? {
            _id: buyer._id,
            name: buyer.name,
            email: buyer.email,
            companyName: buyer.companyName,
            location: buyer.location,
          }
        : null,
    };
  },

  findRawById: async (id) => {
    if (getIsConnected()) {
      return await Rfq.findById(id);
    }
    return memoryStore.rfqs.find((r) => r._id === id || r.id === id) || null;
  },

  findByBuyer: async (buyerId) => {
    if (getIsConnected()) {
      return await Rfq.find({ buyer: buyerId }).sort({ createdAt: -1 });
    }
    return memoryStore.rfqs
      .filter((r) => (r.buyer?._id || r.buyer) === buyerId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  updateById: async (id, updateData) => {
    if (getIsConnected()) {
      return await Rfq.findByIdAndUpdate(id, updateData, { new: true });
    }
    const index = memoryStore.rfqs.findIndex((r) => r._id === id || r.id === id);
    if (index === -1) return null;
    memoryStore.rfqs[index] = {
      ...memoryStore.rfqs[index],
      ...updateData,
      updatedAt: new Date(),
    };
    return memoryStore.rfqs[index];
  },

  deleteById: async (id) => {
    if (getIsConnected()) {
      await Quotation.deleteMany({ rfq: id });
      return await Rfq.findByIdAndDelete(id);
    }
    memoryStore.quotations = memoryStore.quotations.filter((q) => (q.rfq?._id || q.rfq) !== id);
    const index = memoryStore.rfqs.findIndex((r) => r._id === id || r.id === id);
    if (index !== -1) {
      memoryStore.rfqs.splice(index, 1);
      return true;
    }
    return false;
  },
};

// Quotation data access
const quotationRepository = {
  createOrUpdate: async ({ rfqId, supplierId, price, deliveryTime, notes }) => {
    if (getIsConnected()) {
      let quote = await Quotation.findOne({ rfq: rfqId, supplier: supplierId });
      if (quote) {
        quote.price = Number(price);
        quote.deliveryTime = deliveryTime.trim();
        quote.notes = notes ? notes.trim() : '';
        quote.status = 'PENDING';
        return await quote.save();
      }
      return await Quotation.create({
        rfq: rfqId,
        supplier: supplierId,
        price: Number(price),
        deliveryTime: deliveryTime.trim(),
        notes: notes ? notes.trim() : '',
        status: 'PENDING',
      });
    }

    let quote = memoryStore.quotations.find(
      (q) => (q.rfq?._id || q.rfq) === rfqId && (q.supplier?._id || q.supplier) === supplierId
    );

    if (quote) {
      quote.price = Number(price);
      quote.deliveryTime = deliveryTime.trim();
      quote.notes = notes ? notes.trim() : '';
      quote.status = 'PENDING';
      quote.updatedAt = new Date();
      return quote;
    }

    const newQuote = {
      _id: generateId('quote'),
      id: generateId('quote'),
      rfq: rfqId,
      supplier: supplierId,
      price: Number(price),
      deliveryTime: deliveryTime.trim(),
      notes: notes ? notes.trim() : '',
      status: 'PENDING',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    memoryStore.quotations.push(newQuote);
    return newQuote;
  },

  findByRfq: async (rfqId) => {
    if (getIsConnected()) {
      return await Quotation.find({ rfq: rfqId })
        .populate('supplier', 'name email companyName location')
        .sort({ price: 1 });
    }

    const quotes = memoryStore.quotations.filter((q) => (q.rfq?._id || q.rfq) === rfqId);
    quotes.sort((a, b) => Number(a.price) - Number(b.price));

    return quotes.map((q) => {
      const supplierId = q.supplier?._id || q.supplier;
      const supplier = memoryStore.users.find((u) => u._id === supplierId || u.id === supplierId);
      return {
        ...q,
        supplier: supplier
          ? {
              _id: supplier._id,
              name: supplier.name,
              email: supplier.email,
              companyName: supplier.companyName,
              location: supplier.location,
            }
          : null,
      };
    });
  },

  findBySupplier: async (supplierId) => {
    if (getIsConnected()) {
      return await Quotation.find({ supplier: supplierId })
        .populate({
          path: 'rfq',
          populate: { path: 'buyer', select: 'name companyName location' },
        })
        .sort({ createdAt: -1 });
    }

    const quotes = memoryStore.quotations.filter((q) => (q.supplier?._id || q.supplier) === supplierId);
    quotes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return quotes.map((q) => {
      const rfqId = q.rfq?._id || q.rfq;
      const rfq = memoryStore.rfqs.find((r) => r._id === rfqId || r.id === rfqId);
      let populatedRfq = null;
      if (rfq) {
        const buyerId = rfq.buyer?._id || rfq.buyer;
        const buyer = memoryStore.users.find((u) => u._id === buyerId || u.id === buyerId);
        populatedRfq = {
          ...rfq,
          buyer: buyer
            ? {
                _id: buyer._id,
                name: buyer.name,
                companyName: buyer.companyName,
                location: buyer.location,
              }
            : null,
        };
      }
      return {
        ...q,
        rfq: populatedRfq,
      };
    });
  },

  findByRfqAndSupplier: async (rfqId, supplierId) => {
    if (getIsConnected()) {
      return await Quotation.findOne({ rfq: rfqId, supplier: supplierId });
    }
    return (
      memoryStore.quotations.find(
        (q) => (q.rfq?._id || q.rfq) === rfqId && (q.supplier?._id || q.supplier) === supplierId
      ) || null
    );
  },

  findById: async (id) => {
    if (getIsConnected()) {
      return await Quotation.findById(id).populate('rfq');
    }
    const quote = memoryStore.quotations.find((q) => q._id === id || q.id === id);
    if (!quote) return null;
    const rfqId = quote.rfq?._id || quote.rfq;
    const rfq = memoryStore.rfqs.find((r) => r._id === rfqId || r.id === rfqId);
    return {
      ...quote,
      rfq,
    };
  },

  updateStatus: async (quoteId, status) => {
    if (getIsConnected()) {
      const quote = await Quotation.findById(quoteId).populate('rfq');
      if (!quote) return null;
      quote.status = status;
      await quote.save();
      if (status === 'ACCEPTED') {
        const rfqDocId = quote.rfq._id || quote.rfq;
        await Rfq.findByIdAndUpdate(rfqDocId, { status: 'AWARDED' });
        await Quotation.updateMany(
          { rfq: rfqDocId, _id: { $ne: quote._id }, status: 'PENDING' },
          { status: 'REJECTED' }
        );
      }
      return quote;
    }

    const quote = memoryStore.quotations.find((q) => q._id === quoteId || q.id === quoteId);
    if (!quote) return null;
    quote.status = status;
    quote.updatedAt = new Date();

    const rfqId = (quote.rfq?._id || quote.rfq).toString();
    const rfq = memoryStore.rfqs.find((r) => (r._id || r.id).toString() === rfqId);
    if (status === 'ACCEPTED' && rfq) {
      rfq.status = 'AWARDED';
      memoryStore.quotations.forEach((q) => {
        const qRfqId = (q.rfq?._id || q.rfq).toString();
        const qId = (q._id || q.id).toString();
        if (qRfqId === rfqId && qId !== quoteId.toString() && q.status === 'PENDING') {
          q.status = 'REJECTED';
          q.updatedAt = new Date();
        }
      });
    }

    return { ...quote, rfq };
  },

  getStatsForRfqs: async (rfqIds) => {
    if (getIsConnected()) {
      const stats = await Quotation.aggregate([
        { $match: { rfq: { $in: rfqIds } } },
        {
          $group: {
            _id: '$rfq',
            count: { $sum: 1 },
            minPrice: { $min: '$price' },
            acceptedCount: { $sum: { $cond: [{ $eq: ['$status', 'ACCEPTED'] }, 1, 0] } },
          },
        },
      ]);
      const map = {};
      stats.forEach((s) => {
        map[s._id.toString()] = s;
      });
      return map;
    }

    const map = {};
    rfqIds.forEach((id) => {
      const idStr = id.toString();
      const rfqQuotes = memoryStore.quotations.filter((q) => (q.rfq?._id || q.rfq).toString() === idStr);
      const prices = rfqQuotes.map((q) => q.price);
      map[idStr] = {
        count: rfqQuotes.length,
        minPrice: prices.length > 0 ? Math.min(...prices) : null,
        acceptedCount: rfqQuotes.filter((q) => q.status === 'ACCEPTED').length,
      };
    });
    return map;
  },
};

module.exports = {
  userRepository,
  rfqRepository,
  quotationRepository,
};
