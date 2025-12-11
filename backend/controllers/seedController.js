const Seed = require('../models/seedModel');
const User = require('../models/userModel');

// Obtenir ou créer la graine d'un utilisateur
exports.getSeed = async (req, res) => {
  try {
    const userId = req.user.userId;

    let seed = await Seed.findOne({ user_id: userId });

    if (!seed) {
      // Récupérer les points de l'utilisateur
      const user = await User.findById(userId);
      seed = await Seed.create({
        user_id: userId,
        points: user.points || 0,
        current_stage: 'seed'
      });
      seed.updateStage(user.points || 0);
      await seed.save();
    } else {
      // Mettre à jour avec les points actuels
      const user = await User.findById(userId);
      const stageChanged = seed.updateStage(user.points || 0);
      await seed.save();
    }

    res.json({
      success: true,
      seed: {
        current_stage: seed.current_stage,
        points: seed.points,
        growth_history: seed.growth_history
      }
    });
  } catch (error) {
    console.error('Erreur getSeed:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la graine'
    });
  }
};

// Mettre à jour la graine (appelé automatiquement quand les points changent)
exports.updateSeed = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId);
    let seed = await Seed.findOne({ user_id: userId });

    if (!seed) {
      seed = await Seed.create({
        user_id: userId,
        points: user.points || 0
      });
    }

    const stageChanged = seed.updateStage(user.points || 0);
    await seed.save();

    res.json({
      success: true,
      seed: {
        current_stage: seed.current_stage,
        points: seed.points,
        stage_changed: stageChanged,
        growth_history: seed.growth_history
      }
    });
  } catch (error) {
    console.error('Erreur updateSeed:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de la graine'
    });
  }
};

