const { Product, Order } = require('../models/marketplaceModel');
const User = require('../models/userModel');

// Créer un produit
exports.createProduct = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { title, description, price, category, material_source, stock } = req.body;

    // Gérer les images uploadées
    const images = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        images.push(`/uploads/${file.filename}`);
      });
    }

    const product = await Product.create({
      user_id: userId,
      title,
      description,
      price: parseFloat(price),
      category,
      material_source: material_source || 'mixte',
      stock: parseInt(stock) || 1,
      images: images,
      status: 'active'
    });

    res.status(201).json({
      success: true,
      message: 'Produit créé avec succès',
      product
    });
  } catch (error) {
    console.error('Erreur createProduct:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du produit'
    });
  }
};

// Obtenir tous les produits (avec filtres)
exports.getAllProducts = async (req, res) => {
  try {
    const { category, material_source, search, status = 'active', sort = 'created_at' } = req.query;

    let query = { status };

    if (category) {
      query.category = category;
    }

    if (material_source) {
      query.material_source = material_source;
    }

    if (search) {
      query.$text = { $search: search };
    }

    let sortOption = {};
    if (sort === 'price_asc') sortOption = { price: 1 };
    else if (sort === 'price_desc') sortOption = { price: -1 };
    else if (sort === 'popular') sortOption = { views: -1 };
    else sortOption = { created_at: -1 };

    const products = await Product.find(query)
      .populate('user_id', 'full_name')
      .sort(sortOption);

    res.json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    console.error('Erreur getAllProducts:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des produits'
    });
  }
};

// Obtenir un produit par ID
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id)
      .populate('user_id', 'full_name phone');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé'
      });
    }

    // Incrémenter les vues
    product.views += 1;
    await product.save();

    res.json({
      success: true,
      product
    });
  } catch (error) {
    console.error('Erreur getProductById:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du produit'
    });
  }
};

// Créer une commande
exports.createOrder = async (req, res) => {
  try {
    const buyerId = req.user.userId;
    const { product_id, quantity = 1, shipping_address, payment_method } = req.body;

    const product = await Product.findById(product_id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé'
      });
    }

    if (product.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Ce produit n\'est plus disponible'
      });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Stock insuffisant'
      });
    }

    const price = product.price;
    const commission = price * quantity * 0.05; // 5% commission
    const totalAmount = price * quantity;

    const order = await Order.create({
      product_id,
      buyer_id: buyerId,
      seller_id: product.user_id,
      quantity,
      price,
      commission,
      total_amount: totalAmount,
      payment_method: payment_method || 'card',
      shipping_address,
      payment_status: 'pending',
      status: 'pending'
    });

    // Réduire le stock
    product.stock -= quantity;
    if (product.stock === 0) {
      product.status = 'sold';
    }
    await product.save();

    res.status(201).json({
      success: true,
      message: 'Commande créée avec succès',
      order
    });
  } catch (error) {
    console.error('Erreur createOrder:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la commande'
    });
  }
};

// Confirmer le paiement
exports.confirmPayment = async (req, res) => {
  try {
    const { order_id } = req.params;

    const order = await Order.findById(order_id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Commande non trouvée'
      });
    }

    order.payment_status = 'paid';
    order.status = 'confirmed';
    await order.save();

    // Ajouter des points au vendeur
    await User.findByIdAndUpdate(order.seller_id, {
      $inc: { points: Math.floor(order.total_amount / 10) } // 1 point par 10 unités
    });

    res.json({
      success: true,
      message: 'Paiement confirmé avec succès',
      order
    });
  } catch (error) {
    console.error('Erreur confirmPayment:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la confirmation du paiement'
    });
  }
};

// Obtenir mes commandes
exports.getMyOrders = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { type = 'buyer' } = req.query; // 'buyer' ou 'seller'

    let query = {};
    if (type === 'buyer') {
      query.buyer_id = userId;
    } else {
      query.seller_id = userId;
    }

    const orders = await Order.find(query)
      .populate('product_id', 'title images price')
      .populate('buyer_id', 'full_name')
      .populate('seller_id', 'full_name')
      .sort({ created_at: -1 });

    res.json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    console.error('Erreur getMyOrders:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des commandes'
    });
  }
};

// Supprimer un produit
exports.deleteProduct = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const product = await Product.findOne({
      _id: id,
      user_id: userId
    });

    if (!product) {
      return res.status(403).json({
        success: false,
        message: 'Vous ne pouvez supprimer que vos propres produits'
      });
    }

    product.status = 'archived';
    await product.save();

    res.json({
      success: true,
      message: 'Produit archivé avec succès'
    });
  } catch (error) {
    console.error('Erreur deleteProduct:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression'
    });
  }
};

