const fs = require('fs');
const Crawler = require('./crawler');
it.skip('test crawler', async () => {
    const crawler = new Crawler();
    const data = fs.readFileSync(`${__dirname}/mock-server/danh-sach-mon-hoc-1-2.html`)
    const courses = await crawler.crawlCourses("<table id=\"coursesData\">" + data.toString() + "</table>");
    console.log(courses);
})


it('test registered courses crawler', async () => {
    const crawler = new Crawler();
    const data = fs.readFileSync(`${__dirname}/.cache/danh-sach-mon-hoc-da-dang-ky-1.json`)
    const courses = await crawler.crawlRegisteredCourses(`<table>${data.toString()}</table>`);
    console.log(courses);
})

