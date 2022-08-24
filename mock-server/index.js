const express = require('express')
const app = express()
const cookieParser = require('cookie-parser')
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }))
app.get('/', async (req, res) => {
    console.log({cookies : req.cookies, headers : req.headers})
    res.send(req.cookies)
})

app.post('/dang-nhap', async (req, res) => {
    console.log(req.headers)
    console.log(req.body)
    res.send('login success')
})

app.get('/dang-nhap', async (req, res) => {
    console.log(req.headers)
    res.send('login success')
})

app.get('/dang-ky-mon-hoc-nganh-1', async (req, res) => {
    res.send('success')
})

app.post('/chon-mon-hoc/:code/1/2', async (req, res) => {
    res.send('success')
})

app.post('/danh-sach-mon-hoc-da-dang-ky/1', async (req, res) => {
    res.send('success')
})
app.post('/xac-nhan-dang-ky/1', async (req, res) => {
    res.send('success')

})

app.post('/danh-sach-mon-hoc/1/2', async (req, res) => {
    res.sendFile(`${__dirname}/danh-sach-mon-hoc-1-2.html`)
})

app.get('/Account/Logout', async (req, res) => {
    res.send('logout')
})
app.listen(3456, () => {
    console.log('listening on port 3456')
})