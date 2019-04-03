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
            //attributes: ['sAMAccountName', 'displayName', 'cn'],
            //filter: '(&(cn=A*))',
            attributes: ['sAMAccountName', 'displayName'],
            filter: '(&(displayName=นายก*))'
        };

        //const entries = await client.search('OU=Lecturer,DC=it,DC=kmitl,DC=ac,DC=th', options);
        const entries = await client.search('OU=IT13,OU=Bachelor,OU=Student,DC=it,DC=kmitl,DC=ac,DC=th', options);
        await console.log(entries);
    } catch (e) {
        console.log(e);
    }
}

async function testSchedule() {

    const express = require('express');
    const bodyParser = require('body-parser');
    const morgan = require('morgan');
    const app = express();
    app.use(morgan('combined'));
    app.use(bodyParser.json());

    const urlencodedParser = bodyParser.urlencoded({
        extended: false
    });

    const schedule = require('node-schedule');
    const job = schedule;
    app.post('/newvm', urlencodedParser, (req, res) => {
        console.log('start   : ' + new Date())
        console.log('schedule: ' + req.body.EndDate);
        job.scheduleJob(req.body.Name, req.body.EndDate, async function () {
            await console.log('end     : ' + new Date());
        })
    })

    app.post('/reschedule', urlencodedParser, (req, res) => {
        console.log('start   : ' + new Date())
        console.log('schedule: ' + req.body.EndDate);
        job.rescheduleJob(req.body.Name, req.body.EndDate)
    })

    app.use((req, res) => res.status(404).send('Not found.'));

    app.listen(8081, () => console.log('App listen on port: ' + 8081));

    //let endDate = 'Tue Apr 02 2019 16:53:00 GMT+0700 (Indochina Time)';
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
                    console.log('INCORRECT USERNAME')
                    return done(null, false);
                }
                if (!user.verifyPassword(password)) {
                    console.log('INCORRECT PASSWORD')
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
        console.log(req);
        res.send('LOGIN OK');
    });

    app.listen(8081, () => console.log('App listen on port: ' + 8081));
}

async function testDB(mongodb_url) {
    let dbConnector = require('../db/dbConnector.js');
    await dbConnector.connect(mongodb_url);

    let registeredVmSchema = require('../db/models/registerdVmSchema.js');

    let newVM = new registeredVmSchema({
        Name: 'ubuntu-auto-test',
        Guest: 'Ubuntu',
        NumCpu: '1',
        MemoryGB: '1',
        ProvisionedSpaceGB: '16',
        Requestor: 'Chatchai',
        StartDate: new Date('2019-03-16'),
        EndDate: new Date('2019-03-17')
    })
    await newVM.save(console.log('Data Saved into Database')).catch(err => console.log(err));

    async function queryRegisteredVm() {
        let SearchDate = new Date('2019-03-11T07:25:00.000Z')
        await registeredVmSchema.find({
            //Name: 'PCMS'
            /*EndDate: {
                $lt: SearchDate
            }*/
        }).then(output => console.log(output)).catch(err => console.log(err));
    }

    let vmTemplateSchema = require('../db/models/vmTemplateSchema.js');
    let vmTemplate;
    await vmTemplateSchema.find({
        GuestVersion: 'Ubuntu Linux (64-bit)'
    }).then((templates) => {
        vmTemplate = templates;
    }).catch(err => console.error(err));
    console.log(vmTemplate[0]);

    //queryRegisteredVm();
}

async function testSession() {
    const express = require('express');
    const bodyParser = require('body-parser');
    const morgan = require('morgan');
    const cors = require('cors');
    const app = express();
    const uuidv4 = require('uuid/v4');
    app.use(morgan('combined'));
    app.use(bodyParser.json());
    app.use(cors());

    let session = require('express-session');
    app.use(session({
        secret: 'keyboard cat',
        resave: false,
        saveUninitialized: true,
        cookie: {
            secure: true,
            maxAge: 60000
        }
    }))

    const urlencodedParser = bodyParser.urlencoded({
        extended: false
    });

    let dbConnector = require('../db/dbConnector.js');
    await dbConnector.connect(config.mongodb_url);

    let mongoose = require('mongoose');
    let Schema = mongoose.Schema;
    let User = require('../db/models/accountSchema.js');

    app.post('/register', urlencodedParser, async (req, res) => {
        let user = new User(req.body);
        await user.save(res.status(200).send('REGISTER COMPLETE!')).catch(err => console.log(err));
    });

    app.get('/user', async (req, res) => {
        await User.find().then(user => res.json(user)).catch(err => console.log(err));
    })

    app.post('/login', urlencodedParser, async (req, res) => {
        console.log(req.session.cookie)
        if (req.session.username) {
            res.status(400).send('Already logged in!');
        } else {
            await User.findOne({
                username: req.body.username
            }, (err, user) => {
                if (err) {
                    console.log(err);
                }
                if (!user) {
                    res.status(401).json({
                        message: 'Authentication failed.',
                        reason: 'User not found.'
                    });
                } else if (user) {
                    if (!user.password === req.body.password) {
                        res.status(401).json({
                            message: 'Authentication failed.',
                            reason: 'Wrong password.'
                        });
                    } else {
                        req.session.username = user.username;
                        req.session._id = user._id;
                        res.status(200).json({
                            username: user.username,
                            id: user._id
                        })
                    }
                }
            });
        }
    })

    app.get('/session', async (req, res) => {
        console.log(req.session)
        res.json(req.session);
    })

    app.get('/logout', async (req, res) => {
        if (req.session.username) {
            req.session.destroy((err) => {
                if (err) {
                    console.log(err);
                } else {
                    res.status(200).send('Logged out!');
                }
            });
        } else {
            res.status(400).send('Not logged in.')
        }

    })

    app.get('/content', async (req, res) => {
        if (req.session.username) {
            res.status(200).send('QUALITY CONTENT by: ' + req.session.username);
        } else {
            res.status(401).send('Auth failed, please log in.');
        }
        /* 
        console.log(req.body.session);
        console.log(req.session.example);
        if (req.body.session != req.session.example) {

            res.status(401).send('Auth failed, please log in.');
        } else {
            res.status(200).send('QUALITY CONTENT by: ' + req.session.username);
        } */
    })

    app.use((req, res) => res.status(404).send('Not found.'));

    app.listen(8081, () => console.log('App listen on port: ' + 8081));
}

async function testSessionLDAP() {
    const express = require('express');
    const bodyParser = require('body-parser');
    const morgan = require('morgan');
    const app = express();
    const cors = require('cors');
    app.use(morgan('combined'));
    app.use(bodyParser.json());
    app.use(cors());

    let session = require('express-session');
    app.use(session({
        secret: 'keyboard cat',
        resave: false,
        saveUninitialized: true
    }))

    const urlencodedParser = bodyParser.urlencoded({
        extended: false
    });

    app.post('/login', urlencodedParser, async (req, res) => {
        if (req.session.username) {
            res.status(400).send('Already logged in!');
        } else {
            let LdapClient = require('ldapjs-client');
            let client = new LdapClient({
                url: config.ldap_url
            });

            try {
                await client.bind(req.body.username + '@it.kmitl.ac.th', req.body.password)
                let user_session = req.session;
                user_session.username = req.body.username;
                res.status(200).json({
                    username: req.body.username
                })
            } catch (err) {
                res.status(401).send('Auth failed.');
                console.log(err);
            }

            try {
                await client.destroy();
            } catch (err) {
                console.log(err);
            }
        }
    })

    app.get('/session', async (req, res) => {
        let user_session = req.session;
        res.json(user_session);
    })

    app.get('/logout', async (req, res) => {
        if (req.session.username) {
            req.session.destroy((err) => {
                if (err) {
                    console.log(err);
                } else {
                    res.status(200).send('Logged out!');
                }
            });
        } else {
            res.status(400).send('Not logged in.')
        }

    })

    app.get('/content', async (req, res) => {
        if (req.session.username) {
            res.status(200).send('QUALITY CONTENT by: ' + req.session.username);
        } else {
            res.status(401).send('Auth failed, please log in.');
        }
    })

    app.use((req, res) => res.status(404).send('Not found.'));

    app.listen(8081, () => console.log('App listen on port: ' + 8081));
}

const config = require('../config/environments/test.json');
async function test() {
    //await testLADPbind(config.ldap_url, config.ldap_username, config.ldap_password);
    //await testSchedule();
    //await testNPS();
    //await testLocalAuth();
    //await testPassportLDAP(config.ldap_url, config.ldap_username, config.ldap_password);
    //await testDB(config.mongodb_url);
    //await testSessionLDAP();
    await testSession();
}

test();