const config = require('./config')

module.exports = {
    safeParseJson(str) {
        try {
            return JSON.parse(str)
        } catch (e) {
            return {}
        }
    },
    log(...args) {
        console.log(...args)
    },
    debug(...args) {
        if (config.IS_DEBUG) {
            console.debug(...args)
        }
    }
}