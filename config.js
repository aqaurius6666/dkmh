require('dotenv').config({
    path: '.env'
})

const config = {
    BASE_URL: process.env.BASE_URL || 'http://dangkyhoc.vnu.edu.vn',
    USER_AGENT: process.env.USER_AGENT || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.36',
    COOKIE_DIR: process.env.COOKIE_DIR || '.cache',
    COOKIE_FILE: process.env.COOKIE_FILE || 'cookies-logs.json',
    TIMEOUT: process.env.TIMEOUT || 5000,
    MSSV: process.env.MSSV || '',
    PASSWORD: process.env.PASSWORD || '',
    IS_DEBUG: process.env.IS_DEBUG === "true",
    TARGET_COURSES: process.env.TARGET_COURSES.split('.') || [],
    REDIS_URL: process.env.REDIS_URL || '',
}

module.exports = config