const fs = require('fs');
const config = require('./config');
const CM = require('cookie-manager');
const { safeParseJson } = require('./utils');
const { clear } = require('console');

class CookieManager {
    static instance = null;
    configFilePath = null;
    cm = null;
    logs = [];

    constructor() {
        this.cm = new CM();
        this.configFilePath = config.COOKIE_DIR + '/' + config.COOKIE_FILE;
        fs.mkdirSync(config.COOKIE_DIR, { recursive: true });
        fs.existsSync(this.configFilePath) || fs.writeFileSync(this.configFilePath, '{}');
    }

    static getInstance() {
        if (this.instance) {
            return this.instance;
        }
        this.instance = new CookieManager();
        return this.instance;
    }

    async setCookie(url, cookies) {
       this.logs.push({
        url,
        cookies
       })
        return this.cm.store(url, cookies);
    }
    async getCookies(url) {
        return this.cm.prepare(url);
    }
    async dump() {
        fs.writeFileSync(this.configFilePath, JSON.stringify(this.logs));
    }
    async clear() {
        this.cm = new CM();
        this.listUrl = []
    }
    async restore() {
        const data = safeParseJson(fs.readFileSync(this.configFilePath));
        if (!data || !(data instanceof Array)) {
            return;
        }
        this.logs.push(...data);
        for (const log of this.logs) {
            await this.cm.store(log.url, log.cookies);
        }
    }
}
module.exports = CookieManager;
