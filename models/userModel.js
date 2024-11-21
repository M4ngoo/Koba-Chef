const mongoose = require("mongoose")

const userSchema = mongoose.Schema(
    {
        username: {
            type: String,
            required: true
        },
        password: {
            type: String,
            required: true
        },
        gender: {
            type: String,
            required: true 
        },
        age: {
            type: Number,
            required: true
        },
        location: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        image: {
            type: String,
            required: true
        },
        bio: {
            type: String,
            required: true
        },
        favorites: {
            type: Array,
            required: true
        },
        cart: {
            type: Array,
            required: true
        },
        program: {
            type: Array,
            required: true
        },
        userType: {
            type: String,
            required: true
        }
    }
)

const User = mongoose.model("User", userSchema)

module.exports = User