const axios = require('axios');
const config = require('./config');
const CookieManager = require('./cookie-manager');

class HttpAgent {

    instance = null
    _axios = null

    static getInstance() {
        if (this.instance) {
            return this.instance
        }
        this.instance = new HttpAgent();
        return this.instance
    }
    constructor() {
        this._axios = axios.create({
            withCredentials: true,
            timeout: config.TIMEOUT,
            baseURL: config.BASE_URL
        })

        this._axios.interceptors.response.use(async (response) => {
            let setCookie = response.headers['set-cookie']
            if (setCookie) {
                await CookieManager.getInstance().setCookie(setCookie)
            }
            return response
        })
        this._axios.interceptors.request.use(async (req) => {
            const cookie = await CookieManager.getInstance().getCookies()
            if (cookie) {
                req.headers["Cookie"] = cookie
            }
            req.headers["User-Agent"] = config.USER_AGENT
            return req
        })
    }

    async get(url, options) {
        try {
            const res = await this._axios.get(url, options)
            return res.data
        } catch (err) {
            console.log(err.message)
            throw err
        }
    }
    async post(url, options) {
        try {
            const res = await this._axios.post(url, options)
            return res.data
        } catch (err) {
            console.log(err.message)
            throw err
        }
    }
}

module.exports = HttpAgent;