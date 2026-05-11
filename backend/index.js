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

// Middlewares
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '50mb' }));

const protect = async (req, res, next) => {
    try {
        let token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ message: "Unauthorized" });

        const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        console.error("JWT Verification Error:", err.message);
        res.status(401).json({ message: "Invalid Token" });
    }
};

// MongoDB Connection
mongoose.connect('mongodb://127.0.0.1:27017/blog_app')
    .then(() => console.log("Connected to mongoDB"))
    .catch(err => console.error("MongoDB connection error", err));

// Auth Routes

app.post('/api/auth/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists with this email" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
        });

        await newUser.save();

        res.status(201).json({ message: "User created successfully!" });
    } catch (err) {
        console.error("Signup Error:", err);
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            console.log("Login failed: User not found");
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            console.log("Login failed: Wrong password");
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.NEXTAUTH_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            token,
            user: {
                id: user._id.toString(),
                email: user.email,
                name: user.name
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Fetch Routes

app.get('/api/blogs/public', async (req, res) => {
    try {
        const publicPages = await Page.find({ isPublic: true })
            .sort({ updatedAt: -1 })
            .populate('userId', 'name profilePic'); // <--- DO YOU HAVE THIS?
        res.json(publicPages);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


app.post('/api/pages', async (req, res) => {
    try {
        const { _id, blocks, isPublic } = req.body;

        const firstTextBlock = blocks.find(b =>
            (b.type === 'text' || b.type.startsWith('heading')) &&
            b.content.trim().length > 0
        );

        const dynamicTitle = firstTextBlock
            ? firstTextBlock.content.substring(0, 100)
            : "Untitled Page";

        const queryId = (_id && mongoose.Types.ObjectId.isValid(_id))
            ? _id
            : new mongoose.Types.ObjectId();

        const updatedPage = await Page.findOneAndUpdate(
            { _id: queryId },
            {
                $set: {
                    title: dynamicTitle,
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

app.patch('/api/pages/:id', async (req, res) => {
    try {
        const { blocks, isPublic } = req.body;

        let dynamicTitle = "Untitled Page";
        if (blocks && blocks.length > 0) {
            const firstTextBlock = blocks.find(b =>
                (b.type === 'text' || b.type.startsWith('heading')) &&
                b.content?.trim().length > 0
            );

            if (firstTextBlock) {
                dynamicTitle = firstTextBlock.content.substring(0, 100);
            }
        }

        const page = await Page.findByIdAndUpdate(
            req.params.id,
            {
                $set: {
                    title: dynamicTitle,
                    blocks,
                    isPublic,
                    updatedAt: Date.now()
                }
            },
            { new: true, runValidators: true }
        );

        if (!page) {
            return res.status(404).json({ message: "Page not found" });
        }

        res.json(page);
    } catch (err) {
        console.error("Update Error:", err.message);
        res.status(500).json({ error: err.message });
    }
});


// 1. UPDATE THIS ROUTE to populate user info
app.get('/api/pages/:id', async (req, res) => {
    try {
        const page = await Page.findById(req.params.id)
            .populate('userId', 'name email profilePic') // Links the author
            .populate('comments.userId', 'name profilePic'); // Links comment authors

        if (!page) return res.status(404).json({ message: "Page not found" });
        res.json(page);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.patch('/api/pages/:id/views', async (req, res) => {
    try {
        await Page.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
        res.status(200).send();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. FIX THE LIKE LOGIC
app.patch('/api/pages/:id/likes', protect, async (req, res) => {
    try {
        const page = await Page.findById(req.params.id);
        if (!page) return res.status(404).json({ message: "Page not found" });

        const userId = req.user.id; // From the protect middleware

        // Check if user already liked (Convert to string for comparison)
        const index = page.likes.findIndex(id => id.toString() === userId.toString());

        if (index > -1) {
            page.likes.splice(index, 1); // Unlike
        } else {
            page.likes.push(userId); // Like
        }

        await page.save();
        res.json({ likesCount: page.likes.length });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

console.log("Checking Environment Variables...");
console.log("PORT:", process.env.PORT);
console.log("NEXTAUTH_SECRET Loaded:", !!process.env.NEXTAUTH_SECRET);

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

// { upsert: true, new: true }upsert: true: (A mix of Update + Insert). If no document is found with that ID, Mongoose will create a new one using the data provided.new: true: By default, Mongoose returns the document before it was updated. This option tells Mongoose to return the freshly updated version so you can send it back to your frontend.