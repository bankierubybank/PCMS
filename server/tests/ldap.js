const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const config = require('../config/environments/test.json');
const logger = require('../controllers/logger.js');
const LdapClient = require('ldapjs-client');

express().use(bodyParser.json());

const urlencodedParser = bodyParser.urlencoded({
    extended: false
});

async function main() {

    async function ldapAuth(req, res, next) {
        if (req.session.username) {
            res.status(400).send('Already logged in!');
        } else {
            let client = new LdapClient({
                url: config.ldap_url
            });

            await client.bind(req.body.username + '@it.kmitl.ac.th', req.body.password)
                .catch(err => {
                    res.status(401).send('Auth failed, please check your username/password.');
                    logger.error(err);
                });

            //let filter_option = '(&(cn=' + 'A*' + '))';
            let filter_option = '(&(sAMAccountName=' + req.body.username + '))';

            const options = {
                scope: 'sub',
                filter: filter_option,
                attributes: ['sAMAccountName', 'displayName', 'mail'],
                //filter: '(&(displayName=นายก*))'
            };

            const Lecturers = await client.search('OU=Lecturer,DC=it,DC=kmitl,DC=ac,DC=th', options);
            const Staffs = await client.search('OU=Staff,DC=it,DC=kmitl,DC=ac,DC=th', options);
            const Students = await client.search('OU=IT13,OU=Bachelor,OU=Student,DC=it,DC=kmitl,DC=ac,DC=th', options);

            let accountData = {
                type: '',
                username: '',
                displayName: '',
                mail: ''
            }
            if (Lecturers.length != 0) {
                accountData.type = 'Lecturer';
                accountData.username = Lecturers[0].sAMAccountName,
                accountData.displayName = Lecturers[0].displayName,
                accountData.mail = Lecturers[0].mail
            } else if (Staffs.length != 0) {
                accountData.type = 'Staff',
                accountData.username = Staffs[0].sAMAccountName,
                accountData.displayName = Staffs[0].displayName,
                accountData.mail = Staffs[0].mail
            } else if (Students.length != 0) {
                accountData.type = 'Student',
                accountData.username = Students[0].sAMAccountName,
                accountData.displayName = Students[0].displayName,
                accountData.mail = Students[0].mail
            }

            let user_session = req.session;
            user_session.type = accountData.type;
            user_session.username = accountData.username;
            user_session.displayName = accountData.displayName;
            user_session.mail = accountData.mail;
            res.status(200).send('Authentiaction Completed!')

            await client.destroy().catch(err => logger.error(err));

            next();
        }
    }

    router.post('/login', urlencodedParser, ldapAuth, async (req, res) => {
        if (!req.session.username) {
            res.status(401).send('Auth failed, please log in.');
        }
    });

    router.get('/logout', (req, res) => {
        if (req.session.username) {
            req.session.destroy((err) => {
                if (err) {
                    logger.error(err);
                } else {
                    res.status(200).send('Logged out!');
                }
            });
        } else {
            res.status(400).send('Not logged in.')
        }
    });

    router.get('/session', async (req, res) => {
        if (req.session.username) {
            let user_session = req.session;
            res.json(user_session);
        } else {
            res.status(401).send('Auth failed, please log in.');
        }
    })

    router.get('/content', (req, res) => {
        if (req.session.username) {
            res.status(200).send('QUALITY CONTENT by: ' + req.session.displayName);
        } else {
            res.status(401).send('Auth failed, please log in.');
        }
    })

    router.use((req, res) => res.status(404).send('Not found.'));
}

main();

const compression = require('compression');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');

async function createServer() {
    const app = express();
    app.use(compression());
    app.use(morgan('combined'));
    app.use(bodyParser.json());
    app.use(cors());
    app.use(helmet());
    let session = require('express-session');
    app.use(session({
        secret: 'keyboard cat',
        resave: false,
        saveUninitialized: true
    }))

    app.use('/', router);



    let server = await app.listen(config.port, () => logger.info('App listen on port: ' + config.port));

    process.on('SIGINT', () => {
        logger.warn('Application Terminated!')
        server.close((err) => {
            logger.error(err)
            process.exit(1)
        })
    })
}

createServer();