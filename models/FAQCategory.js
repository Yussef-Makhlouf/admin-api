const mongoose = require('mongoose');

// FAQ Question Schema
const faqQuestionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: [true, 'السؤال مطلوب'],
        trim: true
    },
    answer: {
        type: String,
        required: [true, 'الإجابة مطلوبة']
    },
    order: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { _id: true });

// FAQ Category Schema
const faqCategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'اسم القسم مطلوب'],
        trim: true
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true
    },
    icon: {
        type: String,
        default: 'HelpCircle'
    },
    description: {
        type: String,
        default: ''
    },
    questions: [faqQuestionSchema],
    order: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Auto-generate slug from name
faqCategorySchema.pre('save', function (next) {
    if (this.isModified('name') || !this.slug) {
        this.slug = this.name
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^\w\-\u0600-\u06FF]/g, '')
            .replace(/\-\-+/g, '-')
            .replace(/^-+/, '')
            .replace(/-+$/, '');
    }
    next();
});

module.exports = mongoose.model('FAQCategory', faqCategorySchema);
