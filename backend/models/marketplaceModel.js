const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Le titre est requis'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'La description est requise'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Le prix est requis'],
    min: 0
  },
  images: [{
    type: String
  }],
  category: {
    type: String,
    enum: ['meubles', 'deco', 'bijoux', 'sacs', 'art', 'autre'],
    required: [true, 'La catégorie est requise']
  },
  material_source: {
    type: String, // Type de déchet utilisé pour créer le produit
    enum: ['medicaments', 'plastiques', 'piles', 'textiles', 'electronique', 'mixte'],
    default: 'mixte'
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'sold', 'archived'],
    default: 'draft'
  },
  stock: {
    type: Number,
    default: 1,
    min: 0
  },
  views: {
    type: Number,
    default: 0
  },
  sales_count: {
    type: Number,
    default: 0
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Index pour recherche
productSchema.index({ title: 'text', description: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ status: 1 });
productSchema.index({ user_id: 1 });
productSchema.index({ created_at: -1 });

const orderSchema = new mongoose.Schema({
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  buyer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  seller_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  quantity: {
    type: Number,
    default: 1,
    min: 1
  },
  price: {
    type: Number,
    required: true
  },
  commission: {
    type: Number, // 5% commission
    default: 0
  },
  total_amount: {
    type: Number,
    required: true
  },
  payment_status: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  payment_method: {
    type: String,
    enum: ['card', 'bank_transfer', 'mobile_payment']
  },
  shipping_address: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

orderSchema.index({ buyer_id: 1 });
orderSchema.index({ seller_id: 1 });
orderSchema.index({ product_id: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ created_at: -1 });

const Product = mongoose.model('Product', productSchema);
const Order = mongoose.model('Order', orderSchema);

module.exports = { Product, Order };

