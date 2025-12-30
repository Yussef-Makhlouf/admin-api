const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');
const { protect } = require('../middleware/auth');

// @desc    Get all blogs
// @route   GET /api/blogs
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { status, category, featured, limit } = req.query;
        const query = {};

        if (status) {
            query.status = status;
        }
        if (category) {
            query.category = category;
        }
        if (featured === 'true') {
            query.featured = true;
        }

        let blogsQuery = Blog.find(query)
            .populate('categoryRef', 'name slug')
            .sort({ order: 1, publishedAt: -1, createdAt: -1 });

        if (limit) {
            blogsQuery = blogsQuery.limit(parseInt(limit));
        }

        const blogs = await blogsQuery;

        res.json({
            success: true,
            count: blogs.length,
            data: blogs
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'خطأ في الخادم' });
    }
});

// @desc    Get single blog by ID
// @route   GET /api/blogs/id/:id
// @access  Private
router.get('/id/:id', protect, async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id)
            .populate('categoryRef', 'name slug');

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: 'المقال غير موجود'
            });
        }

        res.json({
            success: true,
            data: blog
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'خطأ في الخادم' });
    }
});

// @desc    Get single blog
// @route   GET /api/blogs/:slug
// @access  Public
router.get('/:slug', async (req, res) => {
    try {
        const blog = await Blog.findOne({ slug: req.params.slug })
            .populate('categoryRef', 'name slug');

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: 'المقال غير موجود'
            });
        }

        res.json({
            success: true,
            data: blog
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'خطأ في الخادم' });
    }
});

// @desc    Get related blogs
// @route   GET /api/blogs/:slug/related
// @access  Public
router.get('/:slug/related', async (req, res) => {
    try {
        const blog = await Blog.findOne({ slug: req.params.slug });

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: 'المقال غير موجود'
            });
        }

        const relatedBlogs = await Blog.find({
            _id: { $ne: blog._id },
            status: 'published',
            $or: [
                { category: blog.category },
                { tags: { $in: blog.tags } }
            ]
        })
            .limit(3)
            .sort({ publishedAt: -1 });

        res.json({
            success: true,
            data: relatedBlogs
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'خطأ في الخادم' });
    }
});

// @desc    Create blog
// @route   POST /api/blogs
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const blog = await Blog.create(req.body);

        res.status(201).json({
            success: true,
            data: blog
        });
    } catch (error) {
        console.error(error);
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'هذا الرابط (slug) موجود مسبقاً'
            });
        }
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Update blog
// @route   PUT /api/blogs/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
    try {
        let blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: 'المقال غير موجود'
            });
        }

        blog = await Blog.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.json({
            success: true,
            data: blog
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Delete blog
// @route   DELETE /api/blogs/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: 'المقال غير موجود'
            });
        }

        await blog.deleteOne();

        res.json({
            success: true,
            message: 'تم حذف المقال بنجاح'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'خطأ في الخادم' });
    }
});

// @desc    Toggle blog featured
// @route   PATCH /api/blogs/:id/featured
// @access  Private
router.patch('/:id/featured', protect, async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: 'المقال غير موجود'
            });
        }

        blog.featured = !blog.featured;
        await blog.save();

        res.json({
            success: true,
            data: blog
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'خطأ في الخادم' });
    }
});

// @desc    Publish/Unpublish blog
// @route   PATCH /api/blogs/:id/publish
// @access  Private
router.patch('/:id/publish', protect, async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: 'المقال غير موجود'
            });
        }

        blog.status = blog.status === 'published' ? 'draft' : 'published';
        if (blog.status === 'published' && !blog.publishedAt) {
            blog.publishedAt = new Date();
        }
        await blog.save();

        res.json({
            success: true,
            data: blog
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'خطأ في الخادم' });
    }
});

// @desc    Get all categories (unique from blogs)
// @route   GET /api/blogs/categories/list
// @access  Public
router.get('/categories/list', async (req, res) => {
    try {
        const categories = await Blog.distinct('category');
        res.json({
            success: true,
            data: categories
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'خطأ في الخادم' });
    }
});

module.exports = router;
