const app = require('express')()
const cookieParser = require('cookie-parser')
app.use(cookieParser())
app.get('/', async (req, res) => {
    console.log({cookies : req.cookies, headers : req.headers})
    res.send(req.cookies)
})

app.post('/login', async (req, res) => {
    res.setHeader('Set-Cookie', 'foo=bar; baz=qux')
    res.send('login success')
   
})

app.get('/get-cookie', async (req, res) => {
    res.setHeader('Set-Cookie', 'foo=bar; baz=qux')
    res.send('set cookie success')
})
app.listen(3456, () => {
    console.log('listening on port 3456')
})