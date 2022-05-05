const mongoose = require('mongoose')

const favoriteSchema = new mongoose.Schema(
  {
    coinGeckId: {
      type: String,
      required: true
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

module.exports = mongoose.model('Favorite', favoriteSchema)