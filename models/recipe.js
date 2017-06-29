const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    prepTime: Number,
    cookTime: Number,
    ingredients: [{
        amount: { type: Number, required: true, default: 1 },
        measure: { type: String, lowercase: true, trim: true },
        ingredient: { type: String, required: true }
    }],
    steps: [String],
    source: {type: String}
})

const Recipe = mongoose.model('Recipe', recipeSchema);

module.exports = Recipe;