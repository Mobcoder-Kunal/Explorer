import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import Page from './models/Page.js';
import User from './models/User.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '50mb' }));

const protect = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ message: "Unauthorized: No token provided" });

        const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        console.error("JWT Verification Error:", err.message);
        res.status(401).json({ message: "Invalid or expired token" });
    }
};

const generateDynamicTitle = (blocks) => {
    if (!blocks || !Array.isArray(blocks)) return "Untitled Page";
    const firstTextBlock = blocks.find(b =>
        (b.type === 'text' || b.type.startsWith('heading')) &&
        b.content?.trim().length > 0
    );
    return firstTextBlock ? firstTextBlock.content.substring(0, 100) : "Untitled Page";
};

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/blog_app')
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.error("MongoDB connection error:", err));

app.post('/api/auth/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const normalizedEmail = email.toLowerCase();

        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) return res.status(400).json({ message: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email: normalizedEmail, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: "User created successfully!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.NEXTAUTH_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            token,
            user: { id: user._id, email: user.email, name: user.name }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/pages/public', async (req, res) => {
    try {
        const pages = await Page.find({ isPublic: true })
            .populate('userId', 'name email profilePic')
            .sort({ updatedAt: -1 })
            .limit(20);
        res.json(pages);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/pages', protect, async (req, res) => {
    try {
        const { blocks, isPublic } = req.body;
        const title = generateDynamicTitle(blocks);

        const newPage = new Page({
            userId: req.user.id,
            title,
            blocks,
            isPublic
        });

        await newPage.save();
        res.status(201).json(newPage);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.patch('/api/pages/:id', protect, async (req, res) => {
    try {
        const { blocks, isPublic } = req.body;
        const title = generateDynamicTitle(blocks);

        const page = await Page.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id }, // Ownership check
            { $set: { title, blocks, isPublic, updatedAt: Date.now() } },
            { new: true, runValidators: true }
        );

        if (!page) return res.status(404).json({ message: "Page not found or unauthorized" });
        res.json(page);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/pages/:id', async (req, res) => {
    try {
        const page = await Page.findById(req.params.id)
            .populate('userId', 'name email profilePic')
            .populate('comments.userId', 'name profilePic');

        if (!page) return res.status(404).json({ message: "Page not found" });
        res.json(page);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.patch('/api/pages/:id/views', async (req, res) => {
    try {
        await Page.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
        res.sendStatus(200);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.patch('/api/pages/:id/likes', protect, async (req, res) => {
    try {
        const page = await Page.findById(req.params.id);
        if (!page) return res.status(404).json({ message: "Page not found" });

        const userId = req.user.id;
        const index = page.likes.findIndex(id => id.toString() === userId);

        if (index > -1) {
            page.likes.splice(index, 1);
        } else {
            page.likes.push(userId);
        }

        await page.save();
        res.json({ likesCount: page.likes.length });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/pages/:id/comments', protect, async (req, res) => {
    try {
        const { text } = req.body;
        if (!text?.trim()) return res.status(400).json({ message: "Comment cannot be empty" });

        const page = await Page.findById(req.params.id);
        if (!page) return res.status(404).json({ message: "Page not found" });

        const newComment = {
            userId: req.user.id,
            text: text.trim(),
            createdAt: new Date()
        };

        page.comments.push(newComment);
        await page.save();
        
        const populatedPage = await page.populate('comments.userId', 'name profilePic');
        res.status(201).json({ comment: populatedPage.comments[populatedPage.comments.length - 1] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log("JWT Secret Configured:", !!process.env.NEXTAUTH_SECRET);
});