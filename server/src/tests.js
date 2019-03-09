async function testNode() {
    const nodepwsh = require('node-powershell');

    ps = new nodepwsh({
        verbose: true,
        pwsh: true,
        inputEncoding: 'utf8',
        outputEncoding: 'utf8',
        executionPolicy: 'RemoteSigned',
        noProfile: true
    });

    ps.addCommand('for ($i=0; $i -le 10; $i++) { Write-Host (2,4,8,16)')
        .then(ps.addParameters([{
            Separator: ' * 2 = '
        }]))
        .then(ps.addArgument('}'));
    ps.invoke().then(output => {
        console.log(output)
    }).catch(err => console.log(err))
}

async function testLADPbind(ldap_url, username, password) {
    var LdapClient = require('ldapjs-client');
    var client = new LdapClient({
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

function testLogger() {
    const winston = require('winston');
    const logger = winston.createLogger({
        transports: [
            new winston.transports.Console(),
            new winston.transports.File({
                filename: 'combine.log'
            })
        ]
    });
    logger.info("127.0.0.1 - there's no place like home");
    logger.warn("127.0.0.1 - there's no place like home");
    logger.error("127.0.0.1 - there's no place like home");
}

async function test_winston_express() {
    const express = require('express');
    const morgan = require('morgan');
    const app = express();
    app.use(morgan('combined'));

    const winston = require('winston');
    const logger = winston.createLogger({
        transports: [
            new winston.transports.Console(),
            new winston.transports.File({
                filename: 'combine.log'
            })
        ]
    });

    app.get('/', async (req, res) => {
        res.status(200).send('OK JA')
    });

    var server = app.listen(8081).then(process.send('ready'));

    process.on('SIGINT', () => {
        logger.warn("SIGINT signal received.")
        server.close((err) => {
            logger.error(err)
            process.exit(1)
        })
    })
}

async function test() {
    var config = require('../config/environments/test.json');
    //await testLADPbind(config.ldap_url, config.ldap_username, config.ldap_password);
    //testLogger();
    test_winston_express();
}

test();