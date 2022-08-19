const cheerio = require("cheerio");

class Crawler {

    instance = null
    httpAgent = null

    constructor(httpAgent) {
        this.httpAgent = httpAgent
    }
    
    static getInstance() {
        if (this.instance) {
            return this.instance
        }
        this.instance = new Crawler();
        return this.instance
    }

    async crawlLogin(html) {
        const $ = cheerio.load(html)
        const requestVerificationToken = $('input[name="__RequestVerificationToken"]').val()
        return requestVerificationToken
    }
}

const _crawler = new Crawler();

module.exports = _crawler;