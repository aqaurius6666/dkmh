require('dotenv').config({
    path: '.env'
})

const config = {
    BASE_URL: 'http://dangkyhoc.vnu.edu.vn' || process.env.BASE_URL,
    USER_AGENT: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.36' || process.env.USER_AGENT,
    COOKIE_DIR: '.cookies' || process.env.COOKIE_DIR,
    COOKIE_FILE: 'cookies.json' || process.env.COOKIE_FILE,
    TIMEOUT: 5000 || process.env.TIMEOUT,
}

module.exports = config