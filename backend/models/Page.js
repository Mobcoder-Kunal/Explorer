import mongoose from 'mongoose';

const blockSchema = new mongoose.Schema({
    id: String,
    type: { type: String, enum: ['text', 'heading', 'image'] },
    content: String,
})

const pageSchema = new mongoose.Schema({
    title: { type: String, default: "Untitled" },
    blocks: [
        {
            id: String,
            type: { type: String, enum: ['text', 'heading', 'image', 'todo'] },
            content: String
        }
    ],
    isPublic: { type: Boolean, default: false },
    authorId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'user', 
        required: true 
    },
    updatedAt: { type: Date, default: Date.now }
});

// The OverwriteModelError is a common issue when using Mongoose with Next.js. Because Next.js uses Hot Module Replacement (HMR), it re-compiles your code every time you save a file. Mongoose, however, stays "alive" in the background and gets confused when you try to define the same model ('user') more than once.
const Page = mongoose.models.Page || mongoose.model('Page', pageSchema);
export default Page;