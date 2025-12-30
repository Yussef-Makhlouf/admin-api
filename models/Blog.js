const mongoose = require('mongoose');
const slugify = require('slugify');

const blogSchema = new mongoose.Schema({
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    title: {
        type: String,
        required: [true, 'عنوان المقال مطلوب'],
        trim: true
    },
    excerpt: {
        type: String,
        required: [true, 'الوصف المختصر مطلوب'],
        maxlength: 500
    },
    content: {
        type: String,
        required: [true, 'محتوى المقال مطلوب']
    },
    image: {
        type: String,
        required: [true, 'صورة المقال مطلوبة']
    },
    imageQuery: {
        type: String,
        default: ''
    },
    category: {
        type: String,
        required: [true, 'قسم المقال مطلوب']
    },
    categoryRef: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    },
    tags: [{
        type: String,
        trim: true
    }],
    readTime: {
        type: String,
        default: '5 دقائق'
    },
    featured: {
        type: Boolean,
        default: false
    },
    relatedServices: [{
        type: String
    }],

    // SEO Fields
    metaTitle: {
        type: String,
        maxlength: 70
    },
    metaDescription: {
        type: String,
        maxlength: 160
    },

    // Publishing
    status: {
        type: String,
        enum: ['draft', 'published'],
        default: 'draft'
    },
    publishedAt: {
        type: Date
    },

    // Author
    author: {
        type: String,
        default: 'شركة عزل الأسطح'
    },

    // Order
    order: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Auto-generate slug from title
blogSchema.pre('save', function (next) {
    if (this.isModified('title') && !this.isModified('slug')) {
        this.slug = slugify(this.title, {
            lower: true,
            strict: true,
            locale: 'ar'
        });
    }

    // Auto-calculate read time
    if (this.isModified('content')) {
        const wordCount = this.content.split(/\s+/).length;
        const minutes = Math.ceil(wordCount / 200);
        this.readTime = `${minutes} دقائق`;
    }

    // Set publishedAt when status changes to published
    if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
        this.publishedAt = new Date();
    }

    next();
});

// Virtual for formatted date
blogSchema.virtual('formattedDate').get(function () {
    const date = this.publishedAt || this.createdAt;
    return date.toLocaleDateString('ar-SA', { dateStyle: 'long' });
});

// Ensure virtuals are included in JSON
blogSchema.set('toJSON', { virtuals: true });
blogSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Blog', blogSchema);
