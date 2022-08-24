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

const getCourses = async () => {
    let courses = null;
    const coursesPage = await httpAgent.post('/danh-sach-mon-hoc/1/2', '', {});

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
    if (courses[targetCourse] != undefined) {
        if (registeredCourses.includes(targetCourse)) {
            debug(`${targetCourse} is registered`);
            return
        }
        debug('Find course ', targetCourse);
        debug(courses[targetCourse]);
        await httpAgent.post(`/kiem-tra-tien-quyet/${courses[targetCourse].crdid}/1`, '', {});
        let data = await httpAgent.post(
            `/chon-mon-hoc/${courses[targetCourse].rowIndex}/1/2`,
            '',
            {}
        );
        debug(data);
        data = await httpAgent.post(`xac-nhan-dang-ky/1`, '', {});
        debug(data);
        if (data.success) {
            log('Register success');
            registeredCourses.push(targetCourse)
            fs.writeFileSync(`${__dirname}/.cache/danh-sach-mon-hoc-da-dang-ky-1.json`, JSON.stringify(registeredCourses));
        } else {
            log('Register failed');
        }
    } else {
        debug('Course', targetCourse, 'invalid');
    }
}
const test = async () => {
    while (!(await needLogin())) {
        await login()
    }
    log('Get home page');
    await httpAgent.get('/', '', {});

    let registeredCourses = await getRegisteredCourses();

    let courses = await getCourses();

    log('Get courses page');
    // Loop
    targetCourses = config.TARGET_COURSES;
    await Promise.all(targetCourses.map(async (targetCourse) => {
        return register(courses, registeredCourses, targetCourse);
    }));
};

const tool = async () => {
    while (!(await needLogin())) {
        await login()
    }
    log('Get home page');
    await httpAgent.get('/', '', {});

    let registeredCourses = await getRegisteredCourses();

    let courses = await getCourses();

    log('Get courses page');
    // Loop
    targetCourses = config.TARGET_COURSES;
    await Promise.all(targetCourses.map(async (targetCourse) => {
        return register(courses, registeredCourses, targetCourse);
    }));
};

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
