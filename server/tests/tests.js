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

    let name = 'backuptest';

    VMPerfSchema.findOneAndUpdate({
        Name: name
    }, {
        $addToSet: {
            stats: { timestamp: new Date(), PoweredStatus: 'PoweredOff' }
        }
    }, {
        new: true
    }, (err, data) => {
        if (err) {
            logger.error(err)
        }
        if (!data) {
            let vmPerf = new VMPerfSchema({
                Name: 'backuptest',
                stats: [{
                    timestamp: new Date(),
                    PoweredStatus: 'PoweredOff'
                }]
            })
            vmPerf.save(logger.info('saved')).catch(err => logger.error(err));
        }
    })

    VMPerfSchema.findOne({
        Name: name
    }).then(output => logger.info(output.stats)).catch(err => logger.error(err));
}

async function testSession() {
    const express = require('express');
    const bodyParser = require('body-parser');
    const morgan = require('morgan');
    const cors = require('cors');
    const app = express();
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

    let User = require('../db/models/accountSchema.js');

    app.post('/register', urlencodedParser, async (req, res) => {
        let user = new User(req.body);
        await user.save(res.status(200).send('REGISTER COMPLETE!')).catch(err => logger.error(err));
    });

    app.get('/user', async (req, res) => {
        await User.find().then(user => res.json(user)).catch(err => logger.error(err));
    })

    app.post('/login', urlencodedParser, async (req, res) => {
        logger.info(req.session.cookie)
        if (req.session.username) {
            res.status(400).send('Already logged in!');
        } else {
            await User.findOne({
                username: req.body.username
            }, (err, user) => {
                if (err) {
                    logger.error(err);
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
                        let user_session = req.session
                        user_session.username = user.username;
                        user_session._id = user._id;
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
        logger.info(req.session)
        res.json(req.session);
    })

    app.get('/logout', async (req, res) => {
        if (req.session.username) {
            req.session.destroy((err) => {
                if (err) {
                    logger.info(err);
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
        logger.info(req.body.session);
        logger.info(req.session.example);
        if (req.body.session != req.session.example) {

            res.status(401).send('Auth failed, please log in.');
        } else {
            res.status(200).send('QUALITY CONTENT by: ' + req.session.username);
        } */
    })

    app.use((req, res) => res.status(404).send('Not found.'));

    app.listen(8081, () => logger.log('App listen on port: ' + 8081));
}

const config = require('../config/environments/test.json');
const logger = require('../controllers/logger.js');
async function test() {
    //await testPassportLDAP(config.ldap_url, config.ldap_username, config.ldap_password);
    //await testDB(config.mongodb_url);
    //await testSession();
    setInterval(() => console.log('Interval at: ' + new Date()), (1000 * 2))
}

test();