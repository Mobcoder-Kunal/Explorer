import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
})

// The OverwriteModelError is a common issue when using Mongoose with Next.js. Because Next.js uses Hot Module Replacement (HMR), it re-compiles your code every time you save a file. Mongoose, however, stays "alive" in the background and gets confused when you try to define the same model ('user') more than once.
const User = mongoose.models.user || mongoose.model('user', userSchema);
export default User;