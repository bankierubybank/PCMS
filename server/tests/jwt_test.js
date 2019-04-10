const compression = require('compression');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const config = require('../config/environments/test.json');
const logger = require('../controllers/logger.js');
const dbConnector = require('../db/dbConnector.js');
const jwt = require('jsonwebtoken');
const LdapClient = require('ldapjs-client');

async function createServer() {
    const app = express();
    app.use(compression());
    app.use(morgan('combined'));
    app.use(bodyParser.json());
    app.use(cors());
    app.use(helmet());
    app.set('appSecret', 'secretforinvoicingapp');

    express().use(bodyParser.json());

    const urlencodedParser = bodyParser.urlencoded({
        extended: false
    });

    await dbConnector.connect(config.mongodb_url);

    /*
    async function ldapAuth(req, res, next) {
        let token = await req.header('Authorization') || req.headers["x-access-token"];
        if (token) {
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

            let filter_option = '(&(sAMAccountName=' + req.body.username + '))';

            let options = {
                scope: 'sub',
                filter: filter_option,
                attributes: ['sAMAccountName', 'displayName', 'mail'],
                //filter: '(&(displayName=นายก*))'
            };

            //const entries = await client.search('OU=Lecturer,DC=it,DC=kmitl,DC=ac,DC=th', options);
            let entries = await client.search('OU=IT13,OU=Bachelor,OU=Student,DC=it,DC=kmitl,DC=ac,DC=th', options);

            let payload = {
                username: entries[0].sAMAccountName,
                displayName: entries[0].displayName,
                mail: entries[0].mail
            }
            let token = jwt.sign(payload, app.get('appSecret'), {
                expiresIn: '1h'
            });
            res.status(200).json({
                status: true,
                username: entries[0].sAMAccountName,
                displayName: entries[0].displayName,
                mail: entries[0].mail,
                token: token
            });

            await client.destroy().catch(err => logger.error(err));

            next();
        }
    }*/

    app.post('/login', urlencodedParser, async (req, res) => {
        if (req.header('Authorization') || req.headers["x-access-token"]) {
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

            let filter_option = '(&(sAMAccountName=' + req.body.username + '))';

            let options = {
                scope: 'sub',
                filter: filter_option,
                attributes: ['sAMAccountName', 'displayName', 'mail'],
                //filter: '(&(displayName=นายก*))'
            };

            //const entries = await client.search('OU=Lecturer,DC=it,DC=kmitl,DC=ac,DC=th', options);
            let entries = await client.search('OU=IT13,OU=Bachelor,OU=Student,DC=it,DC=kmitl,DC=ac,DC=th', options);

            let payload = {
                username: entries[0].sAMAccountName,
                displayName: entries[0].displayName,
                mail: entries[0].mail
            }
            let token = jwt.sign(payload, config.appSecret, {
                expiresIn: '1h'
            });
            res.status(200).json({
                status: true,
                username: entries[0].sAMAccountName,
                displayName: entries[0].displayName,
                mail: entries[0].mail,
                token: token
            });

            await client.destroy().catch(err => logger.error(err));
        }
    });

    async function verifyToken(req, res, next) {
        let token = await req.header('Authorization') || req.headers["x-access-token"];
        jwt.verify(token, config.appSecret, (err, decoded) => {
            if (err) {
                res.status(403).send('No token')
                logger.error('No token')
            } else {
                req.decoded = decoded;
                next();
            }
        });
    }

    app.get('/content', verifyToken, async (req, res) => {
        res.status(200).json({
            status: true,
            content: 'Quality Content by: ' + (req.decoded.username)
        })
    })

    app.get('/logout', verifyToken, async (req, res) => {
        res.status(200).json({
            status: false,
            token: null
        })
    })

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