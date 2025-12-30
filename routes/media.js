const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const Media = require('../models/Media');
const upload = require('../middleware/upload');
const { protect } = require('../middleware/auth');

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
        let optimizedPath = file.path;
        let width, height;

        // Optimize image with sharp
        if (file.mimetype.startsWith('image/') && !file.mimetype.includes('svg')) {
            const optimizedFilename = `optimized-${file.filename}`;
            optimizedPath = path.join(path.dirname(file.path), optimizedFilename);

            const metadata = await sharp(file.path)
                .resize(1920, 1080, {
                    fit: 'inside',
                    withoutEnlargement: true
                })
                .webp({ quality: 85 })
                .toFile(optimizedPath.replace(/\.[^.]+$/, '.webp'));

            width = metadata.width;
            height = metadata.height;

            // Delete original file
            fs.unlinkSync(file.path);

            optimizedPath = optimizedPath.replace(/\.[^.]+$/, '.webp');
        }

        const media = await Media.create({
            filename: path.basename(optimizedPath),
            originalName: file.originalname,
            path: optimizedPath,
            url: `/uploads/${path.basename(optimizedPath)}`,
            mimetype: file.mimetype.includes('svg') ? file.mimetype : 'image/webp',
            size: fs.statSync(optimizedPath).size,
            width,
            height,
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
            let optimizedPath = file.path;
            let width, height;

            // Optimize image with sharp
            if (file.mimetype.startsWith('image/') && !file.mimetype.includes('svg')) {
                const optimizedFilename = `optimized-${file.filename}`;
                optimizedPath = path.join(path.dirname(file.path), optimizedFilename);

                const metadata = await sharp(file.path)
                    .resize(1920, 1080, {
                        fit: 'inside',
                        withoutEnlargement: true
                    })
                    .webp({ quality: 85 })
                    .toFile(optimizedPath.replace(/\.[^.]+$/, '.webp'));

                width = metadata.width;
                height = metadata.height;

                // Delete original file
                fs.unlinkSync(file.path);

                optimizedPath = optimizedPath.replace(/\.[^.]+$/, '.webp');
            }

            const media = await Media.create({
                filename: path.basename(optimizedPath),
                originalName: file.originalname,
                path: optimizedPath,
                url: `/uploads/${path.basename(optimizedPath)}`,
                mimetype: file.mimetype.includes('svg') ? file.mimetype : 'image/webp',
                size: fs.statSync(optimizedPath).size,
                width,
                height,
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

        // Delete file from disk
        if (fs.existsSync(media.path)) {
            fs.unlinkSync(media.path);
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
