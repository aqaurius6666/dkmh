const HttpAgent = require('./http-agent')

const main = async () => {
    const httpAgent = HttpAgent.getInstance()

    const result = await httpAgent.get('/dang-nhap', {})
    console.log(result)

    await httpAgent.get('http://localhost:3456/', {})
}


main().catch(err => console.log(err.message))