require('dotenv').config();
const mongoose = require('mongoose');
const { Schema } = mongoose;

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log('Connection Error:', err));

// Project Schema
const ProjectSchema = new Schema({
    title: String,
    category: String,
    image: String,
    description: String,
    tags: [String],
    link: String,
    badge: String,
    featured: { type: Boolean, default: false },
    priority: { type: Number, default: 0 }
});
const Project = mongoose.model('Project', ProjectSchema);

// Course Schema
const CourseSchema = new Schema({
    title: String,
    level: String,
    duration: String,
    badge: String,
    description: String,
    features: [String],
    sessionType: String
});
const Course = mongoose.model('Course', CourseSchema);

const projects = [
    {
        title: "Dr. AIRA - Medical Brain",
        category: "ai",
        image: "https://placehold.co/600x400/0f0a2e/00f3ff?text=Dr.+AIRA+Medical+AI",
        description: "Advanced medical AI consultant acting as a 'Senior Doctor'. Provides real-time guidance, diagnosis assistance, and medical insights.",
        tags: ["Medical AI", "Healthcare", "Agentic AI"],
        link: "https://draira.com",
        badge: "⭐ Top Featured",
        featured: true,
        priority: 10
    },
    {
        title: "Smart Desktop Assistant",
        category: "web",
        image: "https://placehold.co/600x400/0f0a2e/ad52e6?text=Smart+Desktop+Assistant",
        description: "Intelligent Python-based system for automating complex desktop tasks. Features voice, automation scripts, and file management.",
        tags: ["Python", "Automation", "Voice Control"],
        link: "#contact",
        badge: "⭐ Best Seller",
        featured: true,
        priority: 9
    },
    {
        title: "Data Privacy in Agentic AI",
        category: "research",
        image: "https://placehold.co/600x400/0f0a2e/ebb3ff?text=Data+Privacy+AI",
        description: "Technical research on 'GDPR, HIPAA, and Best Practices' in Agentic AI systems.",
        tags: ["Research", "GDPR/HIPAA", "Security"],
        link: "#contact",
        badge: "Research",
        featured: false,
        priority: 0
    },
    {
        title: "YouTube Content Detection",
        category: "ai",
        image: "https://placehold.co/600x400/0f0a2e/00f3ff?text=Content+Detection",
        description: "Deep learning system for detecting and classifying inappropriate content in videos.",
        tags: ["Deep Learning", "CV", "Safety"],
        link: "#contact",
        badge: "Deep Learning",
        featured: false,
        priority: 0
    },
    {
        title: "Diabetes Prediction Model",
        category: "ai",
        image: "https://placehold.co/600x400/0f0a2e/ebb3ff?text=Diabetes+Prediction",
        description: "Advanced ML model for accurate assessment and prediction of diabetes risk.",
        tags: ["ML", "Analytics", "Python"],
        link: "#contact",
        badge: "AI Health",
        featured: false,
        priority: 0
    },
    {
        title: "AI-Based Stress Detection",
        category: "ai",
        image: "https://placehold.co/600x400/0f0a2e/ad52e6?text=Stress+Detection",
        description: "Real-time stress level analysis using facial expressions and voice data.",
        tags: ["Real-time", "Face & Voice", "Python"],
        link: "#contact",
        badge: "AI Analysis",
        featured: false,
        priority: 0
    },
    {
        title: "E-commerce Platform",
        category: "web",
        image: "https://placehold.co/600x400/0f0a2e/00f3ff?text=E-commerce+Platform",
        description: "Comprehensive platform built for secure online commercial transactions.",
        tags: ["Web Dev", "Full Stack", "Payment"],
        link: "#contact",
        badge: "Web App",
        featured: false,
        priority: 0
    },
    {
        title: "Cybersecurity Network Sniffer",
        category: "security",
        image: "https://placehold.co/600x400/0f0a2e/ad52e6?text=Network+Sniffer",
        description: "Advanced tool for real-time monitoring of network traffic and threat detection.",
        tags: ["Network Security", "Packet Analysis", "Monitoring"],
        link: "#contact",
        badge: "Security",
        featured: false,
        priority: 0
    }
];

const courses = [
    {
        title: "Wix Website Building",
        level: "beginner",
        duration: "3 weeks",
        badge: "Beginner Friendly",
        description: "Learn to build professional, stunning websites without coding using Wix. Perfect for portfolios and businesses.",
        features: ["Complete Portfolio Site", "E-commerce Store", "Business Landing Page"],
        sessionType: "training-demo"
    },
    {
        title: "Building AI/ML/DL Projects",
        level: "intermediate",
        duration: "8 weeks",
        badge: "Career Track",
        description: "Master Artificial Intelligence, Machine Learning, and Deep Learning by building real-world projects.",
        features: ["Prediction Models", "Image Recognition Systems", "NLP Chatbots"],
        sessionType: "training-demo"
    },
    {
        title: "Web Development Projects",
        level: "advanced",
        duration: "6 weeks",
        badge: "Core Skill",
        description: "Comprehensive training on building dynamic web applications using modern full-stack technologies.",
        features: ["Full-Stack Web Apps", "Interactive Dashboards", "API Integrations"],
        sessionType: "training-demo"
    }
];

async function seed() {
    try {
        await Project.deleteMany({});
        await Course.deleteMany({});

        await Project.insertMany(projects);
        await Course.insertMany(courses);

        console.log('Data Imported!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
}

seed();
