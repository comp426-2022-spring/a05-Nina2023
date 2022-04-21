// require things
const express = require('express')
const app = express()

const fs = require('fs')
const morgan = require('morgan')
const coin = require('./modules/coin')
const db = require('./src/services/database.js')
const mid = require('./src/middleware/mymiddleware.js')

const args = require('minimist')(process.argv.slice(2), {
    default: {port: 5000, debug: false, log: true},
    alias: {p: 'port', d: 'debug', l: 'log', h: 'help'}
})
// initialize the args
const help = args.help
const port = args.port
const debug = args.debug
const log = args.log

if (help) {
    console.log(`
    node server.js [options]
    --port, -p	Set the port number for the server to listen on. Must be an integer
                between 1 and 65535. Defaults to 5000.
    --debug, -d If set to true, creates endlpoints /app/log/access/ which returns
                a JSON access log from the database and /app/error which throws 
                an error with the message "Error test successful." Defaults to 
                false.
    --log, -l   If set to false, no log files are written. Defaults to true.
                Logs are always written to database.
    --help, -h	Return this message and exit.
    `)
    process.exit(0)
}

// create app server
const server = app.listen(port, () => {
    console.log('App listening on port %PORT%'.replace("%PORT%", port))
})

// middleware adds data to table
app.use( (req, res, next) => {
    mid.addData(req, res, next)
    res.status(200)
})

// if debug is true
if (debug) {
    // endpoint /app/log/access
    app.get('/app/log/access', (req, res) => {
        // return stuff in db
        const prep = db.prepare(`SELECT * FROM accesslog`).all()
        res.status(200).json(prep)
    })

    // endpoint /app/error
    app.get('/app/log/error', (req, res) => {
        // error out
        throw new Error("Error test successful.")
    })
}

// if log is true
if (log == true) {
    // Use morgan for logging to files
    // Create a write stream to append (flags: 'a') to a file
    const accessLog = fs.createWriteStream('./data/log/access.log', { flags: 'a' })
    // Set up the access logging middleware
    app.use(morgan('combined', { stream: accessLog }))
}

// Make Express use its own built-in body parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static HTML files
app.use(express.static('./public'));

// define get endpoints

app.get('/app/flips/:number', (req, res) => {
    const flips = coin.coinFlips(req.params.number)
    res.status(200).json({"raw": flips, "summary": coin.countFlips(flips)})
})

app.get('/app/flip/', (req, res) => {
    res.status(200).json({"flip": coin.coinFlip()})
})


app.get('/app/flip/call/:guess(heads|tails)/', (req, res) => {
    const result = coin.flipACoin(req.params.guess)
    res.status(200).json(result)
})

app.get('/app/', (req, res) => {
    res.json({"message":"Your API works! (200)"})
    res.status(200)
})

// define post endpoints
app.post('/app/flip/coins/', (req, res, next) => {
    const flips = coin.coinFlips(req.body.number)
    const count = coin.countFlips(flips)
    res.status(200).json({"raw":flips, "summary":count})
})

app.post('/app/flip/call/', (req, res, next) => {
    const g= coin.flipACoin(req.body.guess)
    res.status(200).json(g)
})

// default response for any other request
app.use(function(req, res){
    res.status(404).end('404 NOT FOUND')
})
