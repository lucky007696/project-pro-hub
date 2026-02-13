require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');

// Models
const User = require('./models/User');
const Session = require('./models/Session');
const Hire = require('./models/Hire');
const BulkQuote = require('./models/BulkQuote');
const Login = require('./models/Login');
const Project = require('./models/Project');
const Course = require('./models/Course');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Request logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

app.use(express.static(__dirname));
// Ensure uploads directory exists
if (!fs.existsSync('./uploads')) {
    fs.mkdirSync('./uploads');
}
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serve uploaded images

// Multer Storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'img-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB Connection Error:', err));

// Admin Middleware
function requireAdmin(req, res, next) {
    const pass = req.get('x-admin-password');
    if (!pass || pass !== ADMIN_PASSWORD) {
        return res.status(401).json({ error: 'Unauthorized (admin password required)' });
    }
    next();
}

// === UPLOAD API ===
app.post('/api/upload', requireAdmin, upload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    // Return relative path
    res.json({ url: `/uploads/${req.file.filename}` });
});

// Routes

// Register
app.post('/api/register', async (req, res) => {
    try {
        const { name, email, password, mobile } = req.body;
        if (!name || !email || !password || !mobile) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "Email already exists" });
        }

        const newUser = new User({ name, email, password, mobile }); // Hash password in prod
        await newUser.save();

        res.json({ message: "Registration successful", user: newUser });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Login
app.post('/api/login', async (req, res) => {
    try {
        const { identifier, password } = req.body;
        if (!identifier || !password) {
            return res.status(400).json({ error: "Email/Mobile and password required" });
        }

        // Generic search for email OR mobile
        const user = await User.findOne({
            $or: [{ email: identifier }, { mobile: identifier }],
            password: password
        });

        if (user) {
            // Audit Log
            await Login.create({
                userId: user._id,
                name: user.name,
                email: user.email,
                ip: req.ip
            });
            res.json({ message: "Login successful", user });
        } else {
            res.status(401).json({ error: "Invalid credentials" });
        }
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Update Profile
app.post('/api/update-profile', async (req, res) => {
    try {
        const { id, name, email, mobile, password } = req.body;
        if (!id) return res.status(400).json({ error: "User ID required" });

        const user = await User.findById(id);
        if (!user) return res.status(404).json({ error: "User not found" });

        if (email && email !== user.email) {
            const exists = await User.findOne({ email });
            if (exists) return res.status(400).json({ error: "Email already exists" });
        }

        if (name) user.name = name;
        if (email) user.email = email;
        if (mobile) user.mobile = mobile;
        if (password) user.password = password;

        await user.save();
        res.json({ message: "Profile updated successfully", user });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Book Session
app.post('/api/sessions', async (req, res) => {
    try {
        const { name, email, phone, sessionType, sessionMessage } = req.body;
        if (!name || !email || !phone || !sessionType || !sessionMessage) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const newSession = await Session.create({
            name, email, phone, sessionType, sessionMessage
        });

        res.json({ message: "Session booked successfully", session: newSession });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Get Sessions (Admin)
app.get('/api/sessions', requireAdmin, async (req, res) => {
    try {
        const sessions = await Session.find().sort({ bookedAt: -1 });
        res.json({ sessions });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Get Session by ID
app.get('/api/sessions/:id', async (req, res) => {
    try {
        const session = await Session.findById(req.params.id);
        if (!session) return res.status(404).json({ error: "Session not found" });
        res.json({ session });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Update Session Status
app.put('/api/sessions/:id', async (req, res) => {
    try {
        const { status } = req.body;
        if (!status) return res.status(400).json({ error: "Status required" });

        const session = await Session.findByIdAndUpdate(
            req.params.id,
            { status, updatedAt: Date.now() },
            { new: true }
        );

        if (!session) return res.status(404).json({ error: "Session not found" });
        res.json({ message: "Session updated", session });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Delete Session (Admin)
app.delete('/api/sessions/:id', requireAdmin, async (req, res) => {
    try {
        const session = await Session.findByIdAndDelete(req.params.id);
        if (!session) return res.status(404).json({ error: "Session not found" });
        res.json({ message: "Session deleted", session });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Hire Requests
app.post('/api/hires', async (req, res) => {
    try {
        const { name, email, phone, message } = req.body;
        if (!name || !email || !phone || !message) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const hire = await Hire.create({ name, email, phone, message });
        res.json({ message: "Hire request submitted", hire });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Get Hires (Admin)
app.get('/api/hires', requireAdmin, async (req, res) => {
    try {
        const hires = await Hire.find().sort({ createdAt: -1 });
        res.json({ hires });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Bulk Quotes
app.post('/api/bulk-quotes', async (req, res) => {
    try {
        const { name, email, phone, organization, count, requirements } = req.body;
        if (!name || !email || !phone || !count || !requirements) {
            return res.status(400).json({ error: "All required fields are missing" });
        }

        const quote = await BulkQuote.create({
            name, email, phone, organization, count, requirements
        });
        res.json({ message: "Bulk quote submitted", quote });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Get Bulk Quotes (Admin)
app.get('/api/bulk-quotes', requireAdmin, async (req, res) => {
    try {
        const quotes = await BulkQuote.find().sort({ requestedAt: -1 });
        res.json({ bulkQuotes: quotes });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});


// Admin List Users
app.get('/api/users', requireAdmin, async (req, res) => {
    try {
        const users = await User.find().sort({ createdAt: -1 });
        res.json({ users });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Admin List Logins
app.get('/api/logins', requireAdmin, async (req, res) => {
    try {
        const logins = await Login.find().sort({ loggedAt: -1 });
        res.json({ logins });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Admin Delete User
app.delete('/api/users/:id', requireAdmin, async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json({ message: 'User deleted', user });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Admin Delete Hire
app.delete('/api/hires/:id', requireAdmin, async (req, res) => {
    try {
        const hire = await Hire.findByIdAndDelete(req.params.id);
        if (!hire) return res.status(404).json({ error: 'Hire not found' });
        res.json({ message: 'Hire deleted', hire });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Admin Delete Bulk Quote
app.delete('/api/bulk-quotes/:id', requireAdmin, async (req, res) => {
    try {
        const quote = await BulkQuote.findByIdAndDelete(req.params.id);
        if (!quote) return res.status(404).json({ error: 'Bulk quote not found' });
        res.json({ message: 'Bulk quote deleted', quote });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Admin Delete Login
app.delete('/api/logins/:id', requireAdmin, async (req, res) => {
    try {
        const login = await Login.findByIdAndDelete(req.params.id);
        if (!login) return res.status(404).json({ error: 'Login record not found' });
        res.json({ message: 'Login record deleted', login });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// === PROJECTS API ===

// Get All Projects
app.get('/api/projects', async (req, res) => {
    try {
        const projects = await Project.find().sort({ priority: -1, createdAt: -1 });
        res.json({ projects });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Add Project (Admin)
app.post('/api/projects', requireAdmin, async (req, res) => {
    try {
        const project = new Project(req.body);
        await project.save();
        res.json({ message: "Project added", project });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Update Project (Admin)
app.put('/api/projects/:id', requireAdmin, async (req, res) => {
    try {
        const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!project) return res.status(404).json({ error: "Project not found" });
        res.json({ message: "Project updated", project });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Delete Project (Admin)
app.delete('/api/projects/:id', requireAdmin, async (req, res) => {
    try {
        const project = await Project.findByIdAndDelete(req.params.id);
        if (!project) return res.status(404).json({ error: "Project not found" });
        res.json({ message: "Project deleted", project });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// === COURSES API ===

// Get All Courses
app.get('/api/courses', async (req, res) => {
    try {
        const courses = await Course.find().sort({ createdAt: -1 });
        res.json({ courses });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Add Course (Admin)
app.post('/api/courses', requireAdmin, async (req, res) => {
    try {
        const course = new Course(req.body);
        await course.save();
        res.json({ message: "Course added", course });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Update Course (Admin)
app.put('/api/courses/:id', requireAdmin, async (req, res) => {
    try {
        const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!course) return res.status(404).json({ error: "Course not found" });
        res.json({ message: "Course updated", course });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Delete Course (Admin)
app.delete('/api/courses/:id', requireAdmin, async (req, res) => {
    try {
        const course = await Course.findByIdAndDelete(req.params.id);
        if (!course) return res.status(404).json({ error: "Course not found" });
        res.json({ message: "Course deleted", course });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Start Server
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
        if (!process.env.MONGO_URI || process.env.MONGO_URI.includes('<username>')) {
            console.warn('WARNING: MongoDB URI is not set correctly in .env file!');
        }
    });
}

module.exports = app;
