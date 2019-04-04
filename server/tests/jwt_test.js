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
const accountSchema = require('../db/models/accountSchema');
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

            let filter_option = '(&(sAMAccountName=' + req.body.username + '))';

            let options = {
                scope: 'sub',
                filter: filter_option,
                attributes: ['sAMAccountName', 'displayName', 'mail'],
                //filter: '(&(displayName=นายก*))'
            };

            //const entries = await client.search('OU=Lecturer,DC=it,DC=kmitl,DC=ac,DC=th', options);
            let entries = await client.search('OU=IT13,OU=Bachelor,OU=Student,DC=it,DC=kmitl,DC=ac,DC=th', options);

            let user_session = req.session;
            user_session.username = entries[0].sAMAccountName;
            user_session.displayName = entries[0].displayName;
            user_session.mail = entries[0].mail;
            res.status(200).json({
                username: user_session.username,
                displayName: user_session.displayName,
                mail: user_session.mail
            });

            await client.destroy().catch(err => logger.error(err));

            next();
        }
    }

    app.post('/login', urlencodedParser, async (req, res) => {
        await accountSchema.find({
            username: req.body.username
        }).then((account) => {
            if (account[0].password == req.body.password) {
                let payload = {
                    username: account[0].username
                }
                let token = jwt.sign(payload, app.get('appSecret'), {
                    expiresIn: '1h'
                });
                res.status(200).json({
                    status: true,
                    username: account[0].username,
                    token: token
                });
            } else {
                res.status(401).json({
                    status: false,
                    message: 'Auth failed'
                })
                
            }
        }).catch(err => {
            logger.error(err);
            res.status(401).json({
                status: false,
                message: 'Auth failed'
            })
        });
    });
    
    app.get('/content', async (req, res) => {
        let token = await req.header('Authorization');
        logger.info(token)
        if (token) {
            jwt.verify(token, app.get('appSecret'), (err, decoded) => {
                if (err) {
                    res.status(401).send('error');
                    logger.error(err);
                }
                req.decoded = decoded;
                res.status(200).json({
                    status: true,
                    content: 'Quality Content by: ' + (req.decoded.username)
                })
                logger.info("Logged in by: " + decoded.username)
            });
        } else {
            res.status(403).send('No token')
            logger.error('No token')
        }
    })

    app.get('logout', async (req, res) => {
        let token = await req.header('Authorization');
        logger.info(token)
        if (token) {
            res.status(200).json({
                status: false,
                token: null
            })
            logger.info("Logged out")
        } else {
            res.status(403).send('No token')
            logger.error('No token')
        }
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