const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // Log for dev
    console.error(err);

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        const message = 'المورد غير موجود';
        error = { message, statusCode: 404 };
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        const message = `هذا ${field === 'slug' ? 'الرابط' : field === 'email' ? 'البريد الإلكتروني' : 'القيمة'} موجود مسبقاً`;
        error = { message, statusCode: 400 };
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message).join(', ');
        error = { message, statusCode: 400 };
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        const message = 'التوكن غير صالح';
        error = { message, statusCode: 401 };
    }

    if (err.name === 'TokenExpiredError') {
        const message = 'انتهت صلاحية التوكن';
        error = { message, statusCode: 401 };
    }

    // Multer errors
    if (err.name === 'MulterError') {
        let message = 'خطأ في رفع الملف';
        if (err.code === 'LIMIT_FILE_SIZE') {
            message = 'حجم الملف كبير جداً (الحد الأقصى 10MB)';
        }
        error = { message, statusCode: 400 };
    }

    res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'خطأ في الخادم'
    });
};

module.exports = errorHandler;
