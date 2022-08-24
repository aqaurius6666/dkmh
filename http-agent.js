const axios = require('axios');
const config = require('./config');
const CookieManager = require('./cookie-manager');
const fs = require('fs');
class HttpAgent {
    static instance = null;
    _axios = null;

    static getInstance() {
        if (this.instance) {
            return this.instance;
        }
        this.instance = new HttpAgent();
        return this.instance;
    }
    constructor() {
        this._axios = axios.create({
            withCredentials: true,
            timeout: config.TIMEOUT,
            baseURL: config.BASE_URL,
            maxRedirects: 0,
            validateStatus: function (code) {
                if (code === 302) {
                    return true;
                }
                if (code >= 400) return false;

                return true;
            },
        });

        this._axios.interceptors.response.use(async (response) => {
            let setCookie = response.headers['set-cookie'];
            if (setCookie) {
                await CookieManager.getInstance().setCookie(
                    response.config.baseURL,
                    setCookie
                );
            }
            if (response.status >= 500) {
                throw new Error('Server error');
            }
            let data = response.data
            if (data instanceof Object) {
                data = JSON.stringify(data)
            }
            if (config.IS_DEBUG) {
                fs.writeFileSync(`${__dirname}/.debug/${response.config.url.replaceAll('/','-')}`, data);
            }
            return response;
        });
        this._axios.interceptors.request.use(async (req) => {
            const cookie = await CookieManager.getInstance().getCookies(req.baseURL);
            if (cookie) {
                req.headers['Cookie'] = cookie;
            }
            req.headers['User-Agent'] = config.USER_AGENT;
            if (req.method == 'post') {
                req.headers['Content-Type'] = 'application/x-www-form-urlencoded';
                req.headers['Accept'] =
                    'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8';
                req.headers['Connection'] = 'keep-alive';
            }
            // req.headers["Origin"] = config.BASE_URL
            // console.debug(req.headers);
            return req;
        });
    }

    async get(url, options) {
        try {
            const res = await this._axios.get(url, options);
            return res.data;
        } catch (err) {
            throw err;
        }
    }
    async post(url, data, options) {
        try {
            const res = await this._axios.post(url, data, options);
            return res.data;
        } catch (err) {
            throw err;
        }
    }

    async login(username, password, token) {
        try {
            const res = await this._axios.post('/dang-nhap', data, {
                headers: {
                    // Origin: config.BASE_URL,
                    // Referer: config.BASE_URL + '/dang-nhap',
                    'User-Agent': config.USER_AGENT,
                    // 'Upgrade-Insecure-Requests': 1,
                },
                maxRedirects: 0,
                validateStatus: null,
            });
            return res.data;
        } catch (err) {
            throw err;
        }
    }
}

module.exports = HttpAgent;
