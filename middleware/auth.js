const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes
const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from the token
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                return res.status(401).json({ message: 'غير مصرح - المستخدم غير موجود' });
            }

            if (!req.user.isActive) {
                return res.status(401).json({ message: 'الحساب معطل' });
            }

            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'غير مصرح - التوكن غير صالح' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'غير مصرح - لا يوجد توكن' });
    }
};

// Admin only
const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'غير مصرح - صلاحيات المدير مطلوبة' });
    }
};

module.exports = { protect, adminOnly };
