async function testNPS() {
    const nodepwsh = require('node-powershell');

    let ps = new nodepwsh({
        verbose: false,
        pwsh: true,
        inputEncoding: 'utf8',
        outputEncoding: 'utf8',
        executionPolicy: 'RemoteSigned',
        noProfile: true
    });

    const winston = require('winston');
    const logger = winston.createLogger({
        transports: [
            new winston.transports.Console(),
            new winston.transports.File({
                filename: 'combine.log'
            })
        ]
    });

    ps.addCommand('for ($i=0; $i -le 3; $i++) { Write-Host (2,4,8,16)')
        .then(ps.addParameters([{
            Separator: ' * 2 = '
        }]))
        .then(ps.addArgument('}'));
    ps.invoke().then(output => {
        logger.info(output)
    }).catch(err => logger.error(err))
}

async function testLADPbind(ldap_url, username, password) {
    let LdapClient = require('ldapjs-client');
    let client = new LdapClient({
        url: ldap_url
    });

    try {
        await client.bind(username, password)
        await testLDAPsearch(client);
    } catch (e) {
        console.log('Bind failed');
    }

    try {
        await client.destroy();
    } catch (e) {
        console.log(e);
    }
}

async function testLDAPsearch(client) {
    try {
        const options = {
            scope: 'sub',
            //attributes: ['sAMAccountName', 'DisplayName', 'cn']
            //filter: '(&(cn=A*))',
            attributes: ['sAMAccountName', 'cn']
        };

        const entries = await client.search('OU=Lecturer,DC=it,DC=kmitl,DC=ac,DC=th', options);
        console.log(entries);
    } catch (e) {
        console.log(e);
    }
}

async function testSchedule() {
    let schedule = require('node-schedule');

    let moment = require('moment-timezone');
    let start = moment.tz(new Date().toISOString(), 'Asia/Bangkok').format();
    let endDate = moment.tz('2019-03-09T10:41:00.000Z', 'Asia/Bangkok').format();

    console.log('start: ' + start)
    let temp = schedule.scheduleJob(endDate, async function () {
        await console.log('end: ' + endDate);
    })
}

async function connectDB() {
    let mongoose = require('mongoose');
    let dbURL = 'mongodb://localhost/PCMS';

    mongoose.connect(dbURL, {
        useNewUrlParser: true
    });

    let db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function () {
        // we're connected!
    });
}

async function testInsertDB() {
    await connectDB();
    let accounts = require('../db/models/accountSchema.js');
    let account = new accounts({
        username: 'test',
        password: 'test'
    });
    account.save(console.log("SAVED!")).catch(err => console.log(err));
}

async function testLocalAuth() {
    let passport = require('passport');
    let LocalStrategy = require('passport-local').Strategy;
    let accounts = require('../db/models.js').accounts;
    passport.use(new LocalStrategy(
        function (username, password, done) {
            accounts.findOne({
                username: username
            }, function (err, user) {
                if (err) {
                    return done(err);
                }
                if (!user) {
                    console.log("INCORRECT USERNAME")
                    return done(null, false);
                }
                if (!user.verifyPassword(password)) {
                    console.log("INCORRECT PASSWORD")
                    return done(null, false);
                }
            })
        }
    ))
    const express = require('express');
    const bodyParser = require('body-parser');
    const morgan = require('morgan');
    const app = express();
    app.use(morgan('combined'));
    app.use(bodyParser.json());

    app.get('/', (req, res) => {
        res.send('ok')
    })

    app.post('/login', passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: true
    }));

    app.listen(8081, () => console.log('App listen on port: ' + 8081));

}

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
    }
    ))
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
        console.log(req);
        res.send('LOGIN OK');
    });

    app.listen(8081, () => console.log('App listen on port: ' + 8081));
}

async function test() {
    let config = require('../config/environments/test.json');
    //await testLADPbind(config.ldap_url, config.ldap_username, config.ldap_password);
    //await testLogger();
    //await test_winston_express();
    //await testSchedule();
    //await testNPS();
    //await testInsertDB();
    //await testLocalAuth();
    await testPassportLDAP(config.ldap_url, config.ldap_username, config.ldap_password);
}

test();