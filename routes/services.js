const express = require('express');
const router = express.Router();
const Service = require('../models/Service');
const { protect } = require('../middleware/auth');

// @desc    Get all services
// @route   GET /api/services
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { active, category } = req.query;
        const query = {};

        if (active === 'true') {
            query.isActive = true;
        }
        if (category) {
            query.category = category;
        }

        const services = await Service.find(query)
            .populate('category', 'name slug')
            .sort({ order: 1, createdAt: -1 });

        res.json({
            success: true,
            count: services.length,
            data: services
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'خطأ في الخادم' });
    }
});

// @desc    Get single service by ID
// @route   GET /api/services/id/:id
// @access  Private
router.get('/id/:id', protect, async (req, res) => {
    try {
        const service = await Service.findById(req.params.id)
            .populate('category', 'name slug');

        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'الخدمة غير موجودة'
            });
        }

        res.json({
            success: true,
            data: service
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'خطأ في الخادم' });
    }
});

// @desc    Get single service
// @route   GET /api/services/:slug
// @access  Public
router.get('/:slug', async (req, res) => {
    try {
        const service = await Service.findOne({ slug: req.params.slug })
            .populate('category', 'name slug');

        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'الخدمة غير موجودة'
            });
        }

        res.json({
            success: true,
            data: service
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'خطأ في الخادم' });
    }
});

// @desc    Create service
// @route   POST /api/services
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const service = await Service.create(req.body);

        res.status(201).json({
            success: true,
            data: service
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

// @desc    Update service
// @route   PUT /api/services/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
    try {
        let service = await Service.findById(req.params.id);

        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'الخدمة غير موجودة'
            });
        }

        service = await Service.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.json({
            success: true,
            data: service
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Delete service
// @route   DELETE /api/services/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);

        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'الخدمة غير موجودة'
            });
        }

        await service.deleteOne();

        res.json({
            success: true,
            message: 'تم حذف الخدمة بنجاح'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'خطأ في الخادم' });
    }
});

// @desc    Toggle service status
// @route   PATCH /api/services/:id/toggle
// @access  Private
router.patch('/:id/toggle', protect, async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);

        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'الخدمة غير موجودة'
            });
        }

        service.isActive = !service.isActive;
        await service.save();

        res.json({
            success: true,
            data: service
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'خطأ في الخادم' });
    }
});

// @desc    Reorder services
// @route   PATCH /api/services/reorder
// @access  Private
router.patch('/reorder', protect, async (req, res) => {
    try {
        const { orderedIds } = req.body;

        const updatePromises = orderedIds.map((id, index) =>
            Service.findByIdAndUpdate(id, { order: index })
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
