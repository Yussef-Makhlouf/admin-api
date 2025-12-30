const mongoose = require('mongoose');

// Section Item Schema (for FAQs, benefits, features)
const sectionItemSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true }
}, { _id: false });

// Section Schema
const sectionSchema = new mongoose.Schema({
    id: { type: String, required: true },
    type: {
        type: String,
        enum: ['text-image', 'features-grid', 'process-timeline', 'faq-accordion', 'benefits-grid'],
        default: 'text-image'
    },
    title: { type: String, required: true },
    content: { type: String },
    image: { type: String },
    imageAlt: { type: String },
    items: [sectionItemSchema]
}, { _id: false });

// SEO Schema
const seoSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    keywords: [String],
    ogImage: { type: String }
}, { _id: false });

// Hero Schema
const heroSchema = new mongoose.Schema({
    image: { type: String, required: true },
    imageAlt: { type: String },
    description: { type: String, required: true },
    features: [String],
    stats: [{
        label: String,
        value: String
    }]
}, { _id: false });

// CTA Schema
const ctaSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    benefits: [String]
}, { _id: false });

// Testimonial Schema
const testimonialSchema = new mongoose.Schema({
    name: { type: String, required: true },
    location: { type: String },
    rating: { type: Number, min: 1, max: 5, default: 5 },
    comment: { type: String, required: true },
    service: { type: String },
    date: { type: String }
}, { _id: false });

// Main Service Schema
const serviceSchema = new mongoose.Schema({
    slug: {
        type: String,
        required: [true, 'Slug مطلوب'],
        unique: true,
        lowercase: true
    },
    icon: {
        type: String,
        default: 'Wind'
    },
    title: {
        type: String,
        required: [true, 'عنوان الخدمة مطلوب']
    },
    subtitle: {
        type: String,
        required: [true, 'الوصف المختصر مطلوب']
    },
    breadcrumb: {
        type: String,
        default: ''
    },

    // SEO
    seo: seoSchema,

    // Hero Section
    hero: heroSchema,

    // Content Sections
    sections: [sectionSchema],

    // CTA Section
    cta: ctaSchema,

    // Schema.org data (stored as JSON string)
    schemaOrg: {
        type: mongoose.Schema.Types.Mixed
    },
    breadcrumbSchema: {
        type: mongoose.Schema.Types.Mixed
    },
    productSchema: {
        type: mongoose.Schema.Types.Mixed
    },

    // Testimonials
    testimonials: [testimonialSchema],

    // Status
    isActive: {
        type: Boolean,
        default: true
    },
    order: {
        type: Number,
        default: 0
    },

    // Category
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    }
}, {
    timestamps: true
});

// Generate slug from title if not provided
serviceSchema.pre('save', function (next) {
    if (this.isModified('title') && !this.slug) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^\u0621-\u064A\w\s-]/g, '')
            .replace(/\s+/g, '-');
    }
    next();
});

module.exports = mongoose.model('Service', serviceSchema);
