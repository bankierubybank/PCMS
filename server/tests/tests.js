async function testPassportLDAP(ldap_url, ldap_username, ldap_password) {
    let passport = require('passport');
    let LdapStrategy = require('passport-ldapauth').Strategy;
    passport.use(new LdapStrategy({
        server: {
            url: ldap_url,
            bindDN: ('cn=' + ldap_username),
            bindCredentials: ldap_password,
            searchBase: 'OU=Lecturer,DC=it,DC=kmitl,DC=ac,DC=th',
            searchAttributes: ['sAMAccountName', 'cn']
        }
    }))
    const express = require('express');
    const bodyParser = require('body-parser');
    const morgan = require('morgan');
    const app = express();
    app.use(morgan('combined'));
    app.use(bodyParser.json());

    app.use(passport.initialize());
    app.use(passport.session());

    /*
    passport.serializeUser(function(user, done) {
        done(null, user);
    })

    passport.deserializeUser(function(user, done){
        done(null, user);
    })*/

    app.get('/', (req, res) => {
        res.send('ROOT OK')
    })

    app.post('/login', passport.authenticate('ldapauth'), (req, res) => {
        logger.info(req);
        res.send('LOGIN OK');
    });

    app.listen(8081, () => logger.info('App listen on port: ' + 8081));
}

async function testDB(mongodb_url) {
    let dbConnector = require('../db/dbConnector.js');
    await dbConnector.connect(mongodb_url);

    let VMPerfSchema = require('../db/models/VMPerfSchema.js');

    let name = 'uranium';

    VMPerfSchema.findOne({
        Name: name
    }).then(output => {
        let length = output.stats.length;
        let falseCount = 0;
        output.stats.map(x => {
            if (!x.PowerState) {
                falseCount++;
            }
        })
        let trueCount = length - falseCount;
        logger.info(`Length: ${length}, True: ${trueCount}, False: ${falseCount}`)
    }).catch(err => logger.error(err));
}

async function testSchedule() {
    const schedule = require('node-schedule');
    let job = schedule;


    job.scheduleJob('test', 'Sun Apr 14 2019 10:13:00 GMT+0700 (Indochina Time)', async () => {
        logger.info('complete at: ' + new Date())
    })
}

const config = require('../config/environments/test.json');
const logger = require('../controllers/logger.js');
async function test() {
    //await testPassportLDAP(config.ldap_url, config.ldap_username, config.ldap_password);
    //await testDB(config.mongodb_url);
    //setInterval(() => logger.info('Interval at: ' + new Date()), (1000 * 2))
    //await testSchedule();
    let uploadToGoogleDrive = require('../controllers/googleDrive.js');
    uploadToGoogleDrive('log.zip');
}

test();