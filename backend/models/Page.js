import mongoose from 'mongoose';

const BlockSchema = new mongoose.Schema({
    id: { type: String, required: true },
    type: {
        type: String,
        enum: ['text', 'heading1', 'heading2', 'heading3', 'image'],
        required: true
    },
    content: { type: String, default: '' }
});

const PageSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: false
    },
    title: {
        type: String,
        default: 'Untitled Page'
    },
    blocks: [BlockSchema],
    isPublic: {
        type: Boolean,
        default: false
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    views: { type: Number, default: 0 },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }], 
    comments: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
        text: String,
        createdAt: { type: Date, default: Date.now }
    }],
    isPublic: { type: Boolean, default: false }
}, { timestamps: true });

const Page = mongoose.models.Page || mongoose.model('page', PageSchema);
export default Page;