
const fs = require('fs');
const config = require('./config');
const { safeParseJson } = require('./utils')

class CookieManager {

    instance = null;
    configFilePath = null;

    constructor() {
        this.configFilePath = config.COOKIE_DIR + '/' + config.COOKIE_FILE
        fs.mkdirSync(config.COOKIE_DIR, {recursive: true})
        try {
            const result = fs.statSync(this.configFilePath)
            if (result.isFile()) {
                return
            } else {
                throw new Error('file not found')
            }
        } catch (err) {
            fs.writeFileSync(this.configFilePath, '{}')
        }
    }

    static getInstance() {
        if (this.instance) {
            return this.instance
        }
        this.instance = new CookieManager();
        return this.instance
    }

    async setCookie(cookies) {
        let cookieJson = {}
        if (cookies instanceof Array) {
            cookies = cookies.join('; ')
        } 
        let _tmp = cookies.split('; ').map(cookie => {
            let _cookie = cookie.split('=')
            return {[_cookie[0]] : _cookie[1]}
        }).reduce((acc, cur) => {return {...acc, ...cur}})
        cookieJson = {
            ...cookieJson,
            ..._tmp
        }
        const existedCookie = await this.getAll()
        cookieJson = {
            ...existedCookie,
            ...cookieJson,
        }
        return new Promise((res, rej) => {
            fs.writeFile(this.configFilePath, JSON.stringify(cookieJson), (err) => {
                if (err) {
                    console.log(err)
                    rej(err)
                }
                res()
            })
        })

    }
    async getCookies() {
        return new Promise(async (res, rej) => {
            const cookieJson = await this.getAll()
            const cookies = Object.keys(cookieJson).map(key => {
                return key + '=' + cookieJson[key]
            }).join('; ')
            return res(cookies)
        })
    }
    async getAll() {
        return new Promise((res, rej) => {
            fs.stat(this.configFilePath, (err, stats) => {
                if (err) {
                    console.log(err)
                    res({})
                }
            })

            fs.readFile(this.configFilePath, (err, data) => {
                if (err) {
                    console.log(err)
                    res({})
                }
                let cookies = safeParseJson(data)
                res(cookies)
            })
        })
    }
}
module.exports = CookieManager;