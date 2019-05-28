import addContract from './services/Contract/addContract';
import removeContract from './services/Contract/removeContract';
import getAllStocksByRenter from './services/Contract/getAllStocksByRenter';
import getAllRentersByStock from "./services/Contract/getAllRentersByStock";
import getNContracts from './services/Contract/getNContracts';
import createReport from './services/createReport';
import express = require("express");
import getCurrentDate from "../task1/services/getCurrentDate";

const swagger = require("swagger-node-express");
const bodyParser = require( 'body-parser' );

const app: express = express();
const PORT: number = 8080;
let launchDate: Date;
let launchDateString: string;

const subpath = express();
app.use(bodyParser());
app.use("/api-docs", subpath);
swagger.setAppHandler(subpath);

app.use(express.static('dist'));
swagger.setApiInfo({
    title: "Contracts API",
    description: "API to create, delete and get contracts between Renter and Stock",
    termsOfServiceUrl: "",
    contact: "v.dolgoshey@gmail.com",
    license: "",
    licenseUrl: ""
});
subpath.get('/', function (req, res) {
    res.sendFile(__dirname + '/dist/index.html');
});
swagger.configureSwaggerPaths('', 'api-docs', '');
var applicationUrl = 'http://localhost';
swagger.configure(applicationUrl, '1.0.0');

app.use(express.json());

app.use('/api/*', (req, res, next) => {
    res.type('json');
    next();
});

app.get('/api/healthcheck', (req, res) => {
    const now : Date = new Date();
    const serverRunningTime : number = now.valueOf() - launchDate.valueOf();
    res.send({
        'message': 'Server is running',
        'serverStartedRunningAt': launchDateString,
        'serverAlreadyRuns (ms)': serverRunningTime
    });
});

app.route('/api/contract/:renterId/:stockId')
//post a new contract between a renter and a stock
    .post((req, res) => {
        const renterId = +req.params.renterId;
        const stockId = +req.params.stockId;
        const rentalCost = req.body.rentalCost;

        addContract({
            renterId,
            stockId,
            rentalCost
        })
            .then(result => {
                res.json({
                    data: result
                });
            });
    })
    //delete a contract between a renter and a stock
    .delete((req, res) => {
        const renterId = +req.params.renterId;
        const stockId = +req.params.stockId;
        removeContract({
            renterId,
            stockId
        })
            .then(result => {
                res.json({
                    data: result
                });
            });
    })

//get all contracts with stocks for a renter
app.get('/api/stocks/:renterId', (req, res) => {
    const renterId = +req.params.renterId;
    getAllStocksByRenter({
        renterId
    })
        .then(result => {
            res.json({
                data: result
            });
        });
});

//get all contracts with renters for a stock
app.get('/api/renters/:stockId', (req, res) => {
    const stockId = +req.params.stockId;
    getAllRentersByStock({
        stockId
    })
        .then(result => {
            res.json({
                data: result
            });
        })
});


//get a report on average request time
app.get('/api/time-report', (req, res) => {
    createReport()
        .then(result => {
            res.json({
                data: result
            });
        });
});

//get first N contracts in database
app.get('/api/contracts/:number', (req, res) => {
    const number = +req.params.number;

    getNContracts(number)
        .then(result => {
            res.json({
                data: result
            });
        });
});

app.listen(PORT, () => {
    launchDate = new Date();
    launchDateString = getCurrentDate();
    console.log('Server is listening...');
});
