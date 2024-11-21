const mongoose = require("mongoose")

const reviewSchema = mongoose.Schema(
    {
        text: {
            type: String,
            required: true
        },
        rating: {
            type: Number,
            required: true
        },
        userId: {
            type: String,
            required: true
        },
        recipeId: {
            type: String,
            required: true
        }
    }
)

const Review = mongoose.model("Review", reviewSchema)

module.exports = Review