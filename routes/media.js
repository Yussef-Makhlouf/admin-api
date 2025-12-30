const express = require('express');
const router = express.Router();
const Media = require('../models/Media');
const upload = require('../middleware/upload');
const { protect } = require('../middleware/auth');
const cloudinary = require('../config/cloudinary');

// @desc    Get all media
// @route   GET /api/media
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { type, relatedType, relatedId } = req.query;
        const query = {};

        if (type) {
            query.mimetype = new RegExp(type, 'i');
        }
        if (relatedType) {
            query['relatedTo.type'] = relatedType;
        }
        if (relatedId) {
            query['relatedTo.id'] = relatedId;
        }

        const media = await Media.find(query).sort({ createdAt: -1 });

        res.json({
            success: true,
            count: media.length,
            data: media
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'خطأ في الخادم' });
    }
});

// @desc    Upload single file
// @route   POST /api/media/upload
// @access  Private
router.post('/upload', protect, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'لم يتم رفع أي ملف'
            });
        }

        const file = req.file;

        // Cloudinary returns the URL in file.path
        const media = await Media.create({
            filename: file.filename, // Cloudinary Public ID
            originalName: file.originalname,
            path: file.path, // Full Cloudinary URL
            url: file.path, // Map URL same as path for frontend compatibility
            mimetype: file.mimetype,
            size: file.size,
            // Width and height might strictly require a breakdown or manual fetch if not provided by storage engine perfectly
            // but usually cloudinary storage puts it in metadata if configured, or we accept it might be missing
            // For now, allow them to be undefined or 0 as Cloudinary handles resizing on the fly via URL
            width: 0,
            height: 0,
            alt: req.body.alt || '',
            relatedTo: req.body.relatedTo ? JSON.parse(req.body.relatedTo) : undefined
        });

        res.status(201).json({
            success: true,
            data: media
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Upload multiple files
// @route   POST /api/media/upload-multiple
// @access  Private
router.post('/upload-multiple', protect, upload.array('files', 10), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'لم يتم رفع أي ملفات'
            });
        }

        const mediaItems = [];

        for (const file of req.files) {
            const media = await Media.create({
                filename: file.filename,
                originalName: file.originalname,
                path: file.path,
                url: file.path,
                mimetype: file.mimetype,
                size: file.size,
                width: 0,
                height: 0,
                relatedTo: req.body.relatedTo ? JSON.parse(req.body.relatedTo) : undefined
            });

            mediaItems.push(media);
        }

        res.status(201).json({
            success: true,
            count: mediaItems.length,
            data: mediaItems
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Update media alt text
// @route   PATCH /api/media/:id
// @access  Private
router.patch('/:id', protect, async (req, res) => {
    try {
        const media = await Media.findByIdAndUpdate(
            req.params.id,
            { alt: req.body.alt },
            { new: true }
        );

        if (!media) {
            return res.status(404).json({
                success: false,
                message: 'الملف غير موجود'
            });
        }

        res.json({
            success: true,
            data: media
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'خطأ في الخادم' });
    }
});

// @desc    Delete media
// @route   DELETE /api/media/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const media = await Media.findById(req.params.id);

        if (!media) {
            return res.status(404).json({
                success: false,
                message: 'الملف غير موجود'
            });
        }

        // Delete from Cloudinary
        // filename in DB is usually the public_id for Cloudinary if using multer-storage-cloudinary
        if (media.filename) {
            try {
                await cloudinary.uploader.destroy(media.filename);
            } catch (err) {
                console.error('Cloudinary delete error:', err);
                // Continue to delete from DB even if Cloudinary fails
            }
        }

        await media.deleteOne();

        res.json({
            success: true,
            message: 'تم حذف الملف بنجاح'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'خطأ في الخادم' });
    }
});

module.exports = router;
