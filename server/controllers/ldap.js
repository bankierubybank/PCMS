const LdapClient = require('ldapjs-client');
const config = require('../config/environments/config.json');
const logger = require('./logger.js');

/**
 * Bind account into Active Directory.
 * @param {String} username A string of username.
 * @param {String} password A string of password.
 */
async function authen(username, password) {
    let client = new LdapClient({
        url: config.ldap_url
    });

    await client.bind(`${username}@it.kmitl.ac.th`, password).catch(err => logger.error(err));

    let options = {
        scope: 'sub',
        filter: `(&(sAMAccountName=${username}))`,
        attributes: ['sAMAccountName', 'displayName', 'mail'],
    };

    let lecturers = await client.search('OU=Lecturer,DC=it,DC=kmitl,DC=ac,DC=th', options);
    let students = await client.search('OU=Student,DC=it,DC=kmitl,DC=ac,DC=th', options);

    let accountData = {
        type: '',
        username: '',
        displayName: '',
        mail: ''
    }

    if (lecturers.length != 0) {
        accountData.type = 'Lecturer';
        accountData.username = lecturers[0].sAMAccountName;
        accountData.displayName = lecturers[0].displayName;
        accountData.mail = lecturers[0].mail;
    } else if (students.length != 0) {
        accountData.type = 'Student';
        accountData.username = students[0].sAMAccountName;
        accountData.displayName = students[0].displayName;
        accountData.mail = students[0].mail;
    }

    await client.destroy().catch(err => logger.error(err));

    return accountData;
}

/**
 * Return data searched from Active Directory.
 * @param {JSON} options A JSON object of AD search options.
 * @param {String} OU A string of OU.
 * @returns {JSON} Data searched from Active Directory.
 */
async function searchAD(options, OU) {
    let client = new LdapClient({
        url: config.ldap_url
    });

    await client.bind(config.ldap_username, config.ldap_password)
        .catch(err => {
            logger.error(err);
        });

    return await client.search(OU, options)
}

module.exports = {
    authen,
    searchAD
};