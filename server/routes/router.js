const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const schedule = require('node-schedule');
const Core = require('../controllers/core.js');
const config = require('../config/environments/test.json');
const logger = require('../controllers/logger.js');
const debugging = true;
const registeredVmSchema = require('../db/models/registerdVmSchema.js');
const vmTemplateSchema = require('../db/models/vmTemplateSchema.js');
const LdapClient = require('ldapjs-client');

express().use(bodyParser.json());

const urlencodedParser = bodyParser.urlencoded({
    extended: false
});

async function main() {
    const core1 = new Core(config.vcenter_url, config.vcenter_username, config.vcenter_password);
    core1.addLogger(logger);
    core1.createPS(debugging)
        .then(await core1.connectVIServer())
        .catch(err => logger.error(err));

    const jobs = schedule;
    const core2 = new Core(config.vcenter_url, config.vcenter_username, config.vcenter_password);
    core2.addLogger(logger);
    core2.createPS(debugging)
        .then(await core2.connectVIServer())
        .then(await reScheduleVM(core2, jobs))
        .catch(err => logger.error(err));

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

    // This middleware will check if user's cookie is still saved in browser and user is not set, then automatically log the user out.
    // This usually happens when you stop your express server after login, your cookie still remains saved in the browser.
    router.use((req, res, next) => {
        if (req.cookies.user_sid && !req.session.username) {
            res.clearCookie('user_sid');
        }
        next();
    });

    router.post('/login', urlencodedParser, ldapAuth, async (req, res) => {
        if (!req.session.username) {
            res.status(401).send('Auth failed, please log in.');
        }
    });

    router.get('/logout', async (req, res) => {
        if (req.session.username) {
            req.session.destroy((err) => {
                if (err) {
                    logger.error(err);
                }
                res.status(200).send('Logged out!')
            })
        } else {
            res.status(400).send('Not logged in.');
        }
    });

    router.get('/session', async (req, res) => {
        console.log(req.session)
        /*
        if (req.session.username && req.cookies.user_sid) {
            res.status(200).send(req.session)
        } else {
            res.status(401).send('Auth failed, please log in.');
        }
        */
       res.status(200).send(req.session)
    })

    router.get('/content', async (req, res) => {
        if (req.session.username && req.cookies.user_sid) {
            res.status(200).send("QUALITY CONTENT BY: " + req.session.username)
        } else {
            res.status(401).send('Auth failed, please log in.');
        }
    })

    await vmRoutes(core1);
    await vmOperation(core2, jobs);

    router.use((req, res) => {
        if (req.session.username) {
            res.status(404).send('Not found.');
        } else {
            res.status(401).send('Auth failed, please log in.');
        }
    });
}

async function reScheduleVM(core, jobs) {
    await registeredVmSchema.find({
            EndDate: {
                $gte: new Date()
            }
        })
        .then((vms) => {
            vms.forEach(async (vm) => {
                logger.info('Schedule VM: ' + vm.Name + ' to shut down at: ' + new Date(vm.EndDate));
                jobs.scheduleJob(vm.Name, vm.EndDate, async function () {
                    await core.shutdownVMGuest(vm.Name)
                        .then(async () => logger.info('VM: ' + vm.Name + ' was shuted down at: ' + new Date()))
                        .catch(err => logger.error(err));

                    let backupCore = new Core(config.vcenter_url, config.vcenter_username, config.vcenter_password);
                    backupCore.addLogger(logger);
                    backupCore.createPS(debugging)
                        .then(await backupCore.connectVIServer())
                        .catch(err => logger.error(err));
                    await backupCore.backUpVM(vm.Name)
                        .then(async () => {
                            await backupCore.disconnectVIServer(config.vcenter_url);
                            backupCore.disposePS();
                        }).catch(err => logger.error(err));
                })
            })
        }).catch(err => logger.error(err));
}

async function vmRoutes(core) {
    router.get('/vms', async (req, res) => {
        if (req.session.username) {
            await core.getVMs()
                .then(output => {
                    res.json(output);
                }).catch(err => logger.error(err));
        } else {
            res.status(401).send('Auth failed, please log in.');
        }
    })

    router.get('/vms/:vmhost', async (req, res) => {
        if (req.session.username) {
            await core.getVMsbyHostName(req.params.vmhost)
                .then(output => {
                    res.json(output);
                }).catch(err => logger.error(err));
        } else {
            res.status(401).send('Auth failed, please log in.');
        }
    })

    router.get('/vm/:vmName', async (req, res) => {
        if (req.session.username) {
            await core.getVMbyName(req.params.vmName)
                .then(output => {
                    res.json(output);
                }).catch(err => logger.error(err));
        } else {
            res.status(401).send('Auth failed, please log in.');
        }
    })

    router.get('/vmharddisk/:vmName', async (req, res) => {
        if (req.session.username) {
            await core.getVMHarddiskbyName(req.params.vmName)
                .then(output => {
                    res.json(output);
                }).catch(err => logger.error(err));
        } else {
            res.status(401).send('Auth failed, please log in.');
        }
    })

    router.get('/vmhosts', async (req, res) => {
        if (req.session.username) {
            await core.getVMHosts()
                .then(output => {
                    res.json(output);
                }).catch(err => logger.error(err));
        } else {
            res.status(401).send('Auth failed, please log in.');
        }
    })

    router.get('/datastores', async (req, res) => {
        if (req.session.username) {
            await core.getDatastores()
                .then(output => {
                    res.json(output);
                }).catch(err => logger.error(err));
        } else {
            res.status(401).send('Auth failed, please log in.');
        }
    })

    router.get('/datacenters', async (req, res) => {
        if (req.session.username) {
            await core.getDatacenters()
                .then(output => {
                    res.json(output);
                }).catch(err => logger.error(err));
        } else {
            res.status(401).send('Auth failed, please log in.');
        }
    })

    /*
     * All STAT TYPE
     * cpu.usage.average
     * cpu.usagemhz.average
     * cpu.ready.summation
     * mem.usage.average
     * mem.swapinRate.average
     * mem.swapoutRate.average
     * mem.vmmemctl.average
     * mem.consumed.average
     * mem.overhead.average
     * disk.usage.average
     * disk.maxTotalLatency.latest
     * net.usage.average
     * sys.uptime.latest
     * disk.used.latest
     * disk.provisioned.latest
     * disk.unshared.latest
     */
    router.get('/vmstat', urlencodedParser, async (req, res) => {
        if (req.session.username) {
            await core.getVMStat(req.body.vmName, req.body.intervalMins, req.body.stat)
                .then(output => {
                    res.json(output);
                }).catch(err => logger.error(err));
        } else {
            res.status(401).send('Auth failed, please log in.');
        }
    })

    router.get('/templates', async (req, res) => {
        if (req.session.username) {
            await vmTemplateSchema.find().then((templates) => {
                res.json(templates);
            }).catch(err => logger.error(err));
        } else {
            res.status(401).send('Auth failed, please log in.');
        }
    })
}

async function vmOperation(core, jobs) {
    router.post('/vm/:vmName/poweron', async (req, res) => {
        if (req.session.username) {
            await core.powerOnVM(req.params.vmName)
                .then(res.status(200).send('POWERED ON')).catch(err => logger.error(err));
        } else {
            res.status(401).send('Auth failed, please log in.');
        }
    })

    router.post('/vm/:vmName/shutdown', async (req, res) => {
        if (req.session.username) {
            await core.shutdownVMGuest(req.params.vmName)
                .then(res.status(200).send('VM GUEST SHUT DOWN')).catch(err => logger.error(err));
        } else {
            res.status(401).send('Auth failed, please log in.');
        }
    })

    router.post('/vm/:vmName/poweroff', async (req, res) => {
        if (req.session.username) {
            await core.powerOffVM(req.params.vmName)
                .then(res.status(200).send('POWERED OFF')).catch(err => logger.error(err));
        } else {
            res.status(401).send('Auth failed, please log in.');
        }
    })

    //Tempory for testing
    router.get('/vm/:vmName/backup', async (req, res) => {
        if (req.session.username) {
            let backupCore = new Core(config.vcenter_url, config.vcenter_username, config.vcenter_password);
            backupCore.addLogger(logger);
            backupCore.createPS(debugging)
                .then(await backupCore.connectVIServer())
                .catch(err => logger.error(err));
            res.status(200).send('BACKUP QUQUED!');
            await backupCore.backUpVM(req.params.vmName)
                .then(async () => {
                    backupCore.disconnectVIServer(config.vcenter_url);
                    backupCore.disposePS();
                }).catch(err => logger.error(err));
        } else {
            res.status(401).send('Auth failed, please log in.');
        }
    })

    //Tempory for testing
    router.get('/vm/:vmName/testCom', async (req, res) => {
        if (req.session.username) {
            let testComCore = new Core(config.vcenter_url, config.vcenter_username, config.vcenter_password);
            testComCore.addLogger(logger);
            testComCore.createPS(debugging)
                .then(await testComCore.connectVIServer())
                .catch(err => logger.error(err));
            res.status(200).send('BACKUP QUQUED!');
            await testComCore.testCompress(req.params.vmName)
                .then(async () => {
                    await testComCore.disconnectVIServer(config.vcenter_url);
                    testComCore.disposePS();
                }).catch(err => logger.error(err));
        } else {
            res.status(401).send('Auth failed, please log in.');
        }
    })

    router.post('/newvm', urlencodedParser, async (req, res) => {
        if (req.session.username) {
            let vmTemplate;
            await vmTemplateSchema.find({
                GuestVersion: req.body.OS
            }).then((templates) => {
                vmTemplate = templates;
            }).catch(err => logger.error(err));
            await core.newVMfromTemplate(req.body, vmTemplate[0])
                .then(() => {
                    res.status(200).send('VM CREATING IN PROGRESS!');
                    let newVM = new registeredVmSchema({
                        Name: req.body.Name,
                        Guest: req.body.Guest,
                        NumCpu: req.body.NumCpu,
                        MemoryGB: req.body.MemoryGB,
                        ProvisionedSpaceGB: req.body.ProvisionedSpaceGB,
                        OS: req.body.OS,
                        Requestor: req.body.Requestor,
                        StartDate: new Date(req.body.StartDate),
                        EndDate: new Date(req.body.EndDate)
                    })
                    newVM.save(logger.info('Registered New VM!')).catch(err => logger.error(err));

                    let timezoneParser = require('../utils/timezoneParser.js');
                    logger.info('Schedule VM: ' + req.body.Name + ' to shut down at: ' + new Date(req.body.EndDate));
                    jobs.scheduleJob(req.body.Name, req.body.EndDate, async function () {
                        await core.shutdownVMGuest(req.body.Name)
                            .then(async () => logger.info('VM: ' + req.body.Name + ' was shuted down at: ' + timezoneParser.toDay())).catch(err => logger.error(err));

                        let backupCore = new Core(config.vcenter_url, config.vcenter_username, config.vcenter_password);
                        backupCore.addLogger(logger);
                        backupCore.createPS(debugging)
                            .then(await backupCore.connectVIServer())
                            .catch(err => logger.error(err));
                        await backupCore.backUpVM(req.params.vmName)
                            .then(async () => {
                                await backupCore.disconnectVIServer(config.vcenter_url);
                                backupCore.disposePS();
                            }).catch(err => logger.error(err));
                    })
                }).catch(err => logger.error(err));
        } else {
            res.status(401).send('Auth failed, please log in.');
        }
    })

    router.post('/extendvm', urlencodedParser, async (req, res) => {

    })

    router.delete('/vm/:vmName', async (req, res) => {
        if (req.session.username) {
            await core.removeVM(req.params.vmName)
                .then(() => {
                    res.status(200).send('VM DELETED');
                }).catch(err => logger.error(err));
        } else {
            res.status(401).send('Auth failed, please log in.');
        }
    })
}

main();

module.exports = router;