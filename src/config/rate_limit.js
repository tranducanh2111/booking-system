// src/config/rate_limit.js
const rateLimit = require('express-rate-limit');

// General rate limiter
const generalLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 15, // limit each IP to 15 requests per windowMs
});

// Stricter rate limiter for sensitive routes
const apiLimiter = rateLimit({
    windowMs: 3 * 60 * 1000, // 3 minutes
    max: 10, // limit each IP to 10 requests per windowMs
});

module.exports = {
    generalLimiter,
    apiLimiter,
};
