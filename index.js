const config = require('./config');
const Crawler = require('./crawler');
const HttpAgent = require('./http-agent');
const CookieManager = require('./cookie-manager');
const fs = require('fs');
const { safeParseJson, debug, log } = require('./utils');
const crawller = Crawler.getInstance();
const httpAgent = HttpAgent.getInstance();
const cookieManager = CookieManager.getInstance();

const init = async () => {
    fs.mkdirSync(`${__dirname}/.cache`, { recursive: true });
    fs.mkdirSync(`${__dirname}/.debug`, { recursive: true });
    debug('Init');
    await cookieManager.restore();
};

const clear = async () => {
    debug('Clear');
    await cookieManager.dump();
};

const needLogin = async () => {
    debug('Check login');
    const homePage = await httpAgent.get('/', '', {});
    const isObjectMoved = crawller.crawlObjectMoved(homePage);
    debug('In login: ', !isObjectMoved);
    return !isObjectMoved;
};

const login = async () => {
    debug('Get login page');
    const loginPage = await httpAgent.get('/dang-nhap', {});

    const requestVerificationToken = await crawller.crawlLogin(loginPage);
    debug('Token:', requestVerificationToken);
    const data = new URLSearchParams();
    data.append('__RequestVerificationToken', requestVerificationToken);
    data.append('LoginName', config.MSSV);
    data.append('Password', config.PASSWORD);
    debug('Login');
    await httpAgent.post('/dang-nhap', data, {});
}

const getRegisteredCourses = async () => {
    let registeredCourses = null
    if (fs.existsSync(`${__dirname}/.cache/danh-sach-mon-hoc-da-dang-ky-1.json`)) {
        debug('Load registered courses from cache');
        registeredCourses = safeParseJson(fs.readFileSync(`${__dirname}/.cache/danh-sach-mon-hoc-da-dang-ky-1.json`));
    } else {
        debug('Crawl registered courses from page');
        let data = await httpAgent.post('/danh-sach-mon-hoc-da-dang-ky/1', '', {});
        registeredCourses = await crawller.crawlRegisteredCourses(
            '<table>' + data + '</table>'
        );
        fs.writeFileSync(`${__dirname}/.cache/danh-sach-mon-hoc-da-dang-ky-1.json`, JSON.stringify(registeredCourses));
    }
    return registeredCourses
}
const courseUrl = '/danh-sach-mon-hoc/1/1'
const getCourses = async () => {
    let courses = null;
    const coursesPage = await httpAgent.post(courseUrl, '', {});

    if (fs.existsSync(`${__dirname}/.cache/danh-sach-mon-hoc-1-2.json`)) {
        debug('Crawl courses from cache');
        courses = safeParseJson(fs.readFileSync(`${__dirname}/.cache/danh-sach-mon-hoc-1-2.json`));
    } else {
        debug('Crawl courses from page');
        courses = await crawller.crawlCourses(
            '<table id="coursesData">' + coursesPage + '</table>'
        );
        fs.writeFileSync(`${__dirname}/.cache/danh-sach-mon-hoc-1-2.json`, JSON.stringify(courses));
    }
    return courses;
}

const register = async (courses, registeredCourses, targetCourse) => {
    if (!courses[targetCourse]) {
        debug('Course', targetCourse, 'invalid');
        return false;
    }
    if (registeredCourses.includes(targetCourse)) {
        debug(`${targetCourse} is registered`);
        return true
    }

    try {
        debug('Find course', targetCourse);
        debug('Target courses', courses[targetCourse]);
        await httpAgent.post(`/kiem-tra-tien-quyet/${courses[targetCourse].crdid}/1`, '', {});
        let data = await httpAgent.post(
            `/chon-mon-hoc/${courses[targetCourse].rowIndex}/1/2`,
            '',
            {}
        );
        debug('Chon mon hoc response', data);
        if (!data.success) {
            debug('Register failed', data);
            return false
        }
        data = await httpAgent.post(`xac-nhan-dang-ky/1`, '', {});
        debug('Xac nhan dang ky', data);
        if (data.success) {
            if (data.message === 'Ngoài thời hạn đăng ký') {
                log('Ngoài thời hạn đăng ký');
                return false
            }
            log('Register success');
            registeredCourses.push(targetCourse)
            fs.writeFileSync(`${__dirname}/.cache/danh-sach-mon-hoc-da-dang-ky-1.json`, JSON.stringify(registeredCourses));
        } else {
            log('Register failed');
            return false
        }
    } catch (err) {
        debug('Register error:', err.message);
        return false
    }
    

}
const test = async () => {
    while (!(await needLogin())) {
        await login()
    }
    log('Get home page');
    await httpAgent.get('/', '', {});
};

const tool = async () => {
    while (!(await needLogin())) {
        await login()
    }
    log('Get home page');
    await httpAgent.get('/', '', {});

    let registeredCourses = await getRegisteredCourses();
    log('Registered courses', registeredCourses);
    let courses = await getCourses();

    log('Get courses page');
    // Loop
    
    targetCourses = config.TARGET_COURSES;
    let shouldLoop = true
    while (shouldLoop) {
        shouldLoop = (await Promise.all(targetCourses.map(async (each) => {
            return register(courses, registeredCourses, each);
        }))).includes(false)
        await sleep(3000);
    }
};
const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}
const logout = async () => {
    debug('Logout');
    await httpAgent.get('/Account/Logout', null, {});
    await cookieManager.clear();
};

const main = async (args) => {
    await init();
    switch (args[2]) {
        case 'test':
            await test();
            break;
        case 'tool':
            await test()
            await clear();
            await tool();
            break;
        case 'logout':
            await logout();
            break;
        default:
            await test();
            break;
    }
    await clear();
};
main(process.argv).catch((err) => log(err.message));
