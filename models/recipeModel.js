const mongoose = require("mongoose")

const recipeSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        servings: {
            type: Number,
            required: true
        },
        preppingTime: {
            type: String,
            required: true
        },
        cookingTime: {
            type: String,
            required: true
        },
        ingredients: {
            type: Array,
            required: true
        },
        chef: {
            type: String,
            required: true
        },
        recipe: {
            type: String,
            required: true
        },
        rating: {
            type: Number,
            required: true
        },
        reviewsCount: {
            type: Number,
            required: true
        },
        calories: {
            type: Number,
            required: true
        },
        protein: {
            type: Number,
            required: true
        },
        fat: {
            type: Number,
            required: true
        },
        carbohydrates: {
            type: Number,
            required: true
        },
        fiber: {
            type: Number,
            required: true
        },
        sugars: {
            type: Number,
            required: true
        },
        category: {
            type: Array,
            required: true
        },
        image: {
            type: String,
            required: true
        }
    }
)

const Recipe = mongoose.model("Recipe", recipeSchema)

module.exports = Recipe