require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');
const servicesRoutes = require('./routes/services');
const blogsRoutes = require('./routes/blogs');
const categoriesRoutes = require('./routes/categories');
const mediaRoutes = require('./routes/media');
const faqRoutes = require('./routes/faq');

// Import models for seeding
const User = require('./models/User');

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// CORS
app.use(cors({
    origin: [
        process.env.FRONTEND_URL || 'http://localhost:3001',
        process.env.MAIN_SITE_URL || 'http://localhost:3000',
        'http://localhost:3000',
        'http://localhost:3001'
    ],
    credentials: true
}));

// Static uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/blogs', blogsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/faq', faqRoutes);

// Root route
app.get('/', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Admin API is running',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

// API root route
app.get('/api', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Admin API',
        version: '1.0.0',
        endpoints: {
            health: '/api/health',
            auth: '/api/auth',
            services: '/api/services',
            blogs: '/api/blogs',
            categories: '/api/categories',
            media: '/api/media',
            faq: '/api/faq',
            stats: '/api/stats'
        },
        timestamp: new Date().toISOString()
    });
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'API is running',
        timestamp: new Date().toISOString()
    });
});

// Dashboard stats
app.get('/api/stats', async (req, res) => {
    try {
        const Service = require('./models/Service');
        const Blog = require('./models/Blog');
        const Category = require('./models/Category');
        const Media = require('./models/Media');

        const [servicesCount, blogsCount, categoriesCount, mediaCount] = await Promise.all([
            Service.countDocuments(),
            Blog.countDocuments(),
            Category.countDocuments(),
            Media.countDocuments()
        ]);

        const publishedBlogs = await Blog.countDocuments({ status: 'published' });
        const draftBlogs = await Blog.countDocuments({ status: 'draft' });
        const activeServices = await Service.countDocuments({ isActive: true });

        res.json({
            success: true,
            data: {
                services: {
                    total: servicesCount,
                    active: activeServices
                },
                blogs: {
                    total: blogsCount,
                    published: publishedBlogs,
                    drafts: draftBlogs
                },
                categories: categoriesCount,
                media: mediaCount
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'خطأ في الخادم' });
    }
});

// Error handler
app.use(errorHandler);

// Create default admin user if not exists
const createDefaultAdmin = async () => {
    try {
        const adminExists = await User.findOne({ email: process.env.ADMIN_EMAIL });
        if (!adminExists) {
            await User.create({
                email: process.env.ADMIN_EMAIL || 'admin@tebaservices.com',
                password: process.env.ADMIN_PASSWORD || 'admin123',
                name: 'مدير النظام',
                role: 'admin'
            });
            console.log('Default admin user created');
        }
    } catch (error) {
        console.error('Error creating default admin:', error);
    }
};

const PORT = process.env.PORT || 5000;

// Only start the server when not in Vercel
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        createDefaultAdmin();
    });
} else {
    // In Vercel, just create admin without listening
    createDefaultAdmin();
}

// Export for Vercel serverless functions
module.exports = app;
