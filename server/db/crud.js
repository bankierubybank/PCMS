let mongoose = require('mongoose');
let config = require('../config/environments/test.json');
let logger = require('../controllers/logger.js');
let registeredVmSchema = require('../db/models/registerdVmSchema.js');

mongoose.connect(config.mongodb_url, {
    useNewUrlParser: true
});

let db = mongoose.connection;
db.on('error', (err) => logger.error(err));
db.once('open', () => {
    logger.info("Mongoose connection is open to ", config.mongodb_url);
});

let vmdata = {
    Name: 'ubuntu_server',
    Guest: '',
    NumCpu: 2,
    MemoryGB: 1,
    ProvisionedSpaceGB: 32,
    Requestor: 'Chatchai',
    StartDate: new Date('2019-01-17T07:25:00.000Z'),
    EndDate: new Date('2019-03-15T07:25:00.000Z')
}

function registerVm(jsondata) {
    let newVM = new registeredVmSchema({
        Name: jsondata.Name,
        Guest: jsondata.Guest,
        NumCpu: jsondata.NumCpu,
        MemoryGB: jsondata.MemoryGB,
        ProvisionedSpaceGB: jsondata.ProvisionedSpaceGB,
        Requestor: jsondata.Requestor,
        StartDate: jsondata.StartDate,
        EndDate: jsondata.EndDate
    });
    newVM.save(logger.info("Data Saved into Database")).catch(err => logger.error(err))
}

function queryRegisteredVm() {
    let SearchDate = new Date('2019-03-11T07:25:00.000Z')
    registeredVmSchema.find({
        //Name: 'PCMS'
        EndDate: {
            $lt: SearchDate
        }
    }, (err, registeredVm) => {
        if (err) {
            logger.error(err);
        } else {
            logger.info(registeredVm);
        }
    })
}

process.on('SIGINT', () => {
    mongoose.connection.close(() => logger.warn('Mongoose connection is disconnected due to application termination!'));
    process.exit(0);
})

queryRegisteredVm();