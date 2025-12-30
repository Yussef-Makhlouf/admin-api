const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const { protect } = require('../middleware/auth');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { type, active } = req.query;
        const query = {};

        if (type) {
            query.type = type;
        }
        if (active === 'true') {
            query.isActive = true;
        }

        const categories = await Category.find(query).sort({ order: 1, createdAt: -1 });

        res.json({
            success: true,
            count: categories.length,
            data: categories
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'خطأ في الخادم' });
    }
});

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'القسم غير موجود'
            });
        }

        res.json({
            success: true,
            data: category
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'خطأ في الخادم' });
    }
});

// @desc    Create category
// @route   POST /api/categories
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const category = await Category.create(req.body);

        res.status(201).json({
            success: true,
            data: category
        });
    } catch (error) {
        console.error(error);
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'هذا القسم موجود مسبقاً'
            });
        }
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
    try {
        let category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'القسم غير موجود'
            });
        }

        category = await Category.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.json({
            success: true,
            data: category
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'القسم غير موجود'
            });
        }

        await category.deleteOne();

        res.json({
            success: true,
            message: 'تم حذف القسم بنجاح'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'خطأ في الخادم' });
    }
});

// @desc    Toggle category status
// @route   PATCH /api/categories/:id/toggle
// @access  Private
router.patch('/:id/toggle', protect, async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'القسم غير موجود'
            });
        }

        category.isActive = !category.isActive;
        await category.save();

        res.json({
            success: true,
            data: category
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'خطأ في الخادم' });
    }
});

// @desc    Reorder categories
// @route   PATCH /api/categories/reorder
// @access  Private
router.patch('/reorder', protect, async (req, res) => {
    try {
        const { orderedIds } = req.body;

        const updatePromises = orderedIds.map((id, index) =>
            Category.findByIdAndUpdate(id, { order: index })
        );

        await Promise.all(updatePromises);

        res.json({
            success: true,
            message: 'تم تحديث الترتيب بنجاح'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'خطأ في الخادم' });
    }
});

module.exports = router;
