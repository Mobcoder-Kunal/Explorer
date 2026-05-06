import 'dotenv/config';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import express from 'express';
import mongoose from 'mongoose';
import Page from './models/Page.js';
import User from './models/User.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type']
}));
app.use(express.json({ limit: '50mb' }));

// MongoDB Connection
mongoose.connect('mongodb://127.0.0.1:27017/blog_app')
    .then(() => console.log("Connected to mongoDB"))
    .catch(err => console.error("MongoDB connection error", err));


// --- Routes ---

// Get all public blogs for the homepage
app.get('/api/blogs/public', async (req, res) => {
    try {
        const publicPages = await Page.find({ isPublic: true }).sort({ updatedAt: -1 });
        res.json(publicPages);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/auth/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) return res.status(400).json({ message: "User already exists " })

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({ name, email: email.toLowerCase(), password: hashedPassword })
        await newUser.save()

        res.status(201).json({ message: "User created successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
})

// Create or Update a page
app.post('/api/pages', async (req, res) => {
    try {
        const { _id, blocks, isPublic } = req.body;

        const queryId = (_id && mongoose.Types.ObjectId.isValid(_id))
            ? _id
            : new mongoose.Types.ObjectId();

        const updatedPage = await Page.findOneAndUpdate(
            { _id: queryId },
            {
                $set: {
                    blocks,
                    isPublic,
                    updatedAt: new Date()
                }
            },
            {
                upsert: true,
                returnDocument: 'after',
                setDefaultsOnInsert: true
            }
        );

        return res.status(200).json(updatedPage);
    } catch (err) {
        console.error("Save Error:", err.message);
        return res.status(500).json({ error: err.message });
    }
});

// Update specifically by ID
app.patch('/api/pages/:id', async (req, res) => {
    try {
        const { blocks, isPublic } = req.body;
        const page = await Page.findByIdAndUpdate(
            req.params.id,
            { blocks, isPublic, updatedAt: Date.now() },
            { new: true }
        );
        res.json(page);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Fetch a single page by ID
app.get('/api/pages/:id', async (req, res) => {
    try {
        const page = await Page.findById(req.params.id);
        if (!page) {
            return res.status(404).json({ message: "Page not found" });
        }
        res.json(page);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

// { upsert: true, new: true }upsert: true: (A mix of Update + Insert). If no document is found with that ID, Mongoose will create a new one using the data provided.new: true: By default, Mongoose returns the document before it was updated. This option tells Mongoose to return the freshly updated version so you can send it back to your frontend.