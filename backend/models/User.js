import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
}, { timestamps: true })

const User = mongoose.models.user || mongoose.model('user', userSchema);
export default User;