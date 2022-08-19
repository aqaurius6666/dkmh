
module.exports = {
    safeParseJson(str) {
        try {
            return JSON.parse(str)
        } catch (e) {
            return {}
        }
    }
}