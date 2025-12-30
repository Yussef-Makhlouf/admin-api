const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
    filename: {
        type: String,
        required: true
    },
    originalName: {
        type: String,
        required: true
    },
    path: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    },
    mimetype: {
        type: String,
        required: true
    },
    size: {
        type: Number,
        required: true
    },
    width: {
        type: Number
    },
    height: {
        type: Number
    },
    alt: {
        type: String,
        default: ''
    },
    relatedTo: {
        type: {
            type: String,
            enum: ['service', 'blog', 'general']
        },
        id: mongoose.Schema.Types.ObjectId
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Media', mediaSchema);
