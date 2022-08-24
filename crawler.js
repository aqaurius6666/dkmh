const cheerio = require('cheerio');

class Crawler {
    static instance = null;

    constructor() {}

    static getInstance() {
        if (this.instance) {
            return this.instance;
        }
        this.instance = new Crawler();
        return this.instance;
    }

    async crawlLogin(html) {
        const $ = cheerio.load(html);
        const requestVerificationToken = $('input[name="__RequestVerificationToken"]').val();
        return requestVerificationToken;
    }

    crawlObjectMoved(html) {
        const $ = cheerio.load(html);
        const objectMoved = $('title').text();
        return objectMoved === 'Object moved';
    }

    async crawlRegisteredCourses(html) {
        const $ = cheerio.load(html);
        const courses = []
        $('tr.registered').each((i, row) => {
            const course = $(row).find('td')[3].children[0].data.trim()
            courses.push(course)
        })
        return courses

    }
    async crawlCourses(html) {
        const $ = cheerio.load(html);
        const courses = [];
        const optionCourses = {};
        $('tr')
            .not('.conflict')
            .each((i, e2) => {
                const input = $(e2).find('input.order');
                let rowIndex = undefined;
                let crdid = undefined;
                if (input || input.length > 0) {
                    rowIndex = input.attr('data-rowindex');
                    if (!rowIndex) {
                        return;
                    }
                    crdid = input.attr('data-crdid');
                }
                let course = $(e2)
                    .children('td')[4]
                    .children.map((e) => {
                        if (!e.data) {
                            return e.children[0].data.trim();
                        }
                        return e.data.trim();
                    })
                    .reduce((a, b) => a + b)
                    .replace(/\n/g, ' ')
                    .replace(/\s+/g, ' ');

                course = course.replace('(CLC)', '').trim();
                if (course.includes('TH') && !course.includes('PES')) {
                    if (!optionCourses[course]) {
                        optionCourses[course] = 1;
                    } else {
                        optionCourses[course] = 2;
                    }
                    courses.push({
                        course: course.replace('(TH)', '').trim(),
                        rowIndex: rowIndex,
                        option: optionCourses[course],
                        crdid: crdid,
                    });
                    return;
                }
                courses.push({
                    course: course.replace('(TH)', '').trim(),
                    rowIndex: rowIndex,
                    crdid: crdid,
                });
            });

        return courses.reduce((a, b) => {
            return {
                ...a,
                [b.course]: b,
            };
        });
    }
}

module.exports = Crawler;
