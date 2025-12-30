const express = require('express');
const router = express.Router();
const FAQCategory = require('../models/FAQCategory');
const { protect, adminOnly } = require('../middleware/auth');

// @route   GET /api/faq
// @desc    Get all FAQ categories with questions
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { active } = req.query;

        let query = {};
        if (active === 'true') {
            query.isActive = true;
        }

        const categories = await FAQCategory.find(query)
            .sort('order')
            .lean();

        // Filter inactive questions if active filter is on
        if (active === 'true') {
            categories.forEach(cat => {
                cat.questions = cat.questions.filter(q => q.isActive);
                cat.questions.sort((a, b) => a.order - b.order);
            });
        }

        res.json({
            success: true,
            count: categories.length,
            data: categories
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'خطأ في تحميل الأسئلة الشائعة',
            error: error.message
        });
    }
});

// @route   GET /api/faq/:id
// @desc    Get single FAQ category
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const category = await FAQCategory.findById(req.params.id);

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
        res.status(500).json({
            success: false,
            message: 'خطأ في تحميل القسم',
            error: error.message
        });
    }
});

// @route   POST /api/faq
// @desc    Create FAQ category
// @access  Private/Admin
router.post('/', protect, adminOnly, async (req, res) => {
    try {
        const category = await FAQCategory.create(req.body);

        res.status(201).json({
            success: true,
            data: category
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'فشل إنشاء القسم',
            error: error.message
        });
    }
});

// @route   PUT /api/faq/:id
// @desc    Update FAQ category
// @access  Private/Admin
router.put('/:id', protect, adminOnly, async (req, res) => {
    try {
        const category = await FAQCategory.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

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
        res.status(400).json({
            success: false,
            message: 'فشل تحديث القسم',
            error: error.message
        });
    }
});

// @route   DELETE /api/faq/:id
// @desc    Delete FAQ category
// @access  Private/Admin
router.delete('/:id', protect, adminOnly, async (req, res) => {
    try {
        const category = await FAQCategory.findByIdAndDelete(req.params.id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'القسم غير موجود'
            });
        }

        res.json({
            success: true,
            message: 'تم حذف القسم بنجاح'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'فشل حذف القسم',
            error: error.message
        });
    }
});

// @route   PATCH /api/faq/:id/toggle
// @desc    Toggle FAQ category active status
// @access  Private/Admin
router.patch('/:id/toggle', protect, adminOnly, async (req, res) => {
    try {
        const category = await FAQCategory.findById(req.params.id);

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
        res.status(500).json({
            success: false,
            message: 'فشل تحديث حالة القسم',
            error: error.message
        });
    }
});

// @route   POST /api/faq/:id/questions
// @desc    Add question to category
// @access  Private/Admin
router.post('/:id/questions', protect, adminOnly, async (req, res) => {
    try {
        const category = await FAQCategory.findById(req.params.id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'القسم غير موجود'
            });
        }

        category.questions.push(req.body);
        await category.save();

        res.status(201).json({
            success: true,
            data: category
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'فشل إضافة السؤال',
            error: error.message
        });
    }
});

// @route   PUT /api/faq/:id/questions/:questionId
// @desc    Update question in category
// @access  Private/Admin
router.put('/:id/questions/:questionId', protect, adminOnly, async (req, res) => {
    try {
        const category = await FAQCategory.findById(req.params.id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'القسم غير موجود'
            });
        }

        const question = category.questions.id(req.params.questionId);

        if (!question) {
            return res.status(404).json({
                success: false,
                message: 'السؤال غير موجود'
            });
        }

        Object.assign(question, req.body);
        await category.save();

        res.json({
            success: true,
            data: category
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'فشل تحديث السؤال',
            error: error.message
        });
    }
});

// @route   DELETE /api/faq/:id/questions/:questionId
// @desc    Delete question from category
// @access  Private/Admin
router.delete('/:id/questions/:questionId', protect, adminOnly, async (req, res) => {
    try {
        const category = await FAQCategory.findById(req.params.id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'القسم غير موجود'
            });
        }

        category.questions.pull(req.params.questionId);
        await category.save();

        res.json({
            success: true,
            data: category
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'فشل حذف السؤال',
            error: error.message
        });
    }
});

// @route   PATCH /api/faq/:id/questions/:questionId/toggle
// @desc    Toggle question active status
// @access  Private/Admin
router.patch('/:id/questions/:questionId/toggle', protect, adminOnly, async (req, res) => {
    try {
        const category = await FAQCategory.findById(req.params.id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'القسم غير موجود'
            });
        }

        const question = category.questions.id(req.params.questionId);

        if (!question) {
            return res.status(404).json({
                success: false,
                message: 'السؤال غير موجود'
            });
        }

        question.isActive = !question.isActive;
        await category.save();

        res.json({
            success: true,
            data: category
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'فشل تحديث حالة السؤال',
            error: error.message
        });
    }
});

// @route   PUT /api/faq/reorder
// @desc    Reorder FAQ categories
// @access  Private/Admin
router.put('/reorder', protect, adminOnly, async (req, res) => {
    try {
        const { orderedIds } = req.body;

        for (let i = 0; i < orderedIds.length; i++) {
            await FAQCategory.findByIdAndUpdate(orderedIds[i], { order: i });
        }

        res.json({
            success: true,
            message: 'تم إعادة ترتيب الأقسام'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'فشل إعادة الترتيب',
            error: error.message
        });
    }
});

module.exports = router;
