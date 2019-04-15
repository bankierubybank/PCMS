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
const VMPerfSchema = require('../db/models/VMPerfSchema.js');
const LdapClient = require('ldapjs-client');
const jwt = require('jsonwebtoken');

express().use(bodyParser.json());

const urlencodedParser = bodyParser.urlencoded({
    extended: false
});

/**
 * Create core and assign core to routes.
 */
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

    const core3 = new Core(config.vcenter_url, config.vcenter_username, config.vcenter_password);
    core3.addLogger(logger);
    core3.createPS(debugging)
        .then(await core3.connectVIServer())
        .then(await getVMPowerState(core3))
        .catch(err => logger.error(err));

    router.post('/login', urlencodedParser, async (req, res) => {
        if (req.header('Authorization') || req.headers["x-access-token"]) {
            res.status(400).send('Already logged in!');
        } else {
            let accountData = {
                type: '',
                username: '',
                displayName: '',
                mail: ''
            }
            if (req.body.username == 'admin' && req.body.password == 'admin') {
                accountData.type = 'Staff';
                accountData.username = 'admin';
                accountData.displayName = 'admin';
                accountData.mail = '58070020@kmitl.ac.th';
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

                let Lecturers = await client.search('OU=Lecturer,DC=it,DC=kmitl,DC=ac,DC=th', options);
                let Staffs = await client.search('OU=Staff,DC=it,DC=kmitl,DC=ac,DC=th', options);
                let Students = await client.search('OU=Student,DC=it,DC=kmitl,DC=ac,DC=th', options);

                if (Lecturers.length != 0) {
                    accountData.type = 'Lecturer';
                    accountData.username = Lecturers[0].sAMAccountName;
                    accountData.displayName = Lecturers[0].displayName;
                    accountData.mail = Lecturers[0].mail;
                } else if (Staffs.length != 0) {
                    accountData.type = 'Staff';
                    accountData.username = Staffs[0].sAMAccountName;
                    accountData.displayName = Staffs[0].displayName;
                    accountData.mail = Staffs[0].mail;
                } else if (Students.length != 0) {
                    accountData.type = 'Student';
                    accountData.username = Students[0].sAMAccountName;
                    accountData.displayName = Students[0].displayName;
                    accountData.mail = Students[0].mail;
                }

                await client.destroy().catch(err => logger.error(err));
            }

            let payload = {
                type: accountData.type,
                username: accountData.username,
                displayName: accountData.displayName,
                mail: accountData.mail
            }
            let token = jwt.sign(payload, config.appSecret, {
                expiresIn: '1h'
            });
            res.status(200).json({
                status: true,
                type: accountData.type,
                username: accountData.sAMAccountName,
                displayName: accountData.displayName,
                mail: accountData.mail,
                token: token
            });
        }
    });

    router.get('/content', verifyToken, async (req, res) => {
        res.status(200).json({
            status: true,
            content: 'Quality Content by: ' + (req.decoded.username)
        })
    })

    router.get('/logout', verifyToken, async (req, res) => {
        res.status(200).json({
            status: false,
            token: null
        })
    })

    await vmRoutes(core1);
    await vmOperation(core2, jobs);

    router.use((req, res) => {
        res.status(404).send('Not found.');
    });
}

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

/**
 * Reschdule all virtual machines to shutdown, backup and remove them when duration ended.
 * @param {Core} core Node-powershell PowerCLI Core.
 * @param {schedule} jobs Node-schedule jobs.
 */
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

/**
 * Get PowerState of all virtual machines from vCenter and save them to database every 1 hour.
 * @param {Core} core Node-powershell PowerCLI Core.
 */
async function getVMPowerState(core) {
    //Set Interval for 1 hour (1000 ms * 60 * 60)
    setInterval(async () => {
        await core.getVMs().then(output => {
            output.forEach(async (vm) => {
                VMPerfSchema.findOneAndUpdate({
                    Name: vm.Name
                }, {
                    $addToSet: {
                        stats: {
                            timestamp: new Date(),
                            PowerState: vm.PowerState
                        }
                    }
                }, {
                    new: true
                }, (err, data) => {
                    if (err) {
                        logger.error(err);
                    }
                    if (!data) {
                        let vmPerf = new VMPerfSchema({
                            Name: vm.Name,
                            stats: [{
                                timestamp: new Date(),
                                PowerState: vm.PowerState
                            }]
                        });
                        vmPerf.save(logger.info('Saved New VM PowerState')).catch(err => logger.error(err));
                    } else {
                        logger.info('Saved Existing VM PowerState');
                    }
                })
            })
        })
    }, (1000 * 60 * 60));
}

/**
 * Defined all get routes.
 * @param {Core} core Node-powershell PowerCLI Core.
 */
async function vmRoutes(core) {
    router.get('/vms', verifyToken, async (req, res) => {
        await core.getVMs()
            .then(output => {
                res.status(200).json(output);
            }).catch(err => logger.error(err));
    })

    router.get('/vms/:vmhost', verifyToken, async (req, res) => {
        await core.getVMsbyHostName(req.params.vmhost)
            .then(output => {
                res.status(200).json(output);
            }).catch(err => logger.error(err));
    })

    router.get('/vm/:vmName', verifyToken, async (req, res) => {
        await core.getVMbyName(req.params.vmName)
            .then(output => {
                res.status(200).json(output);
            }).catch(err => logger.error(err));
    })

    router.get('/vm/:vmName/registered', verifyToken, async (req, res) => {
        let vms;
        await registeredVmSchema.find({
            Name: req.params.vmName
        }).then((registeredVMs) => {
            vms = registeredVMs;
        }).catch(err => logger.error(err))
        if (vms[0]) {
            res.status(200).json(vms[0])
        } else {
            res.status(200).send('VM not registered!')
        }
    })

    router.get('/registeredvm', verifyToken, async (req, res) => {
        let vms;
        await registeredVmSchema.find({
            Requestor: req.decoded.username
        }).then((registeredVMs) => {
            vms = registeredVMs;
        }).catch(err => logger.error(err))
        if (vms[0]) {
            res.status(200).json(vms)
        } else {
            res.status(200).send('No registered VM!')
        }
    })

    router.get('/vmharddisk/:vmName', verifyToken, async (req, res) => {
        await core.getVMHarddiskbyName(req.params.vmName)
            .then(output => {
                res.status(200).json(output);
            }).catch(err => logger.error(err));
    })

    router.get('/vmhosts', verifyToken, async (req, res) => {
        await core.getVMHosts()
            .then(output => {
                res.status(200).json(output);
            }).catch(err => logger.error(err));
    })

    router.get('/datastores', verifyToken, async (req, res) => {
        await core.getDatastores()
            .then(output => {
                res.status(200).json(output);
            }).catch(err => logger.error(err));
    })

    router.get('/datacenters', verifyToken, async (req, res) => {
        await core.getDatacenters()
            .then(output => {
                res.status(200).json(output);
            }).catch(err => logger.error(err));
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
    router.get('/vmstat', urlencodedParser, verifyToken, async (req, res) => {
        await core.getVMStat(req.body.vmName, req.body.intervalMins, req.body.stat)
            .then(output => {
                res.status(200).json(output);
            }).catch(err => logger.error(err));
    })

    router.get('/templates', verifyToken, async (req, res) => {
        await vmTemplateSchema.find().then((templates) => {
            res.status(200).json(templates);
        }).catch(err => logger.error(err));
    })
}

/**
 * Defined all virtual machine operations routes.
 * @param {Core} core Node-powershell PowerCLI Core.
 * @param {schedule} jobs Node-schedule jobs.
 */
async function vmOperation(core, jobs) {
    router.post('/vm/:vmName/poweron', verifyToken, async (req, res) => {
        await core.powerOnVM(req.params.vmName)
            .then(res.status(200).send('VM powered on!')).catch(err => logger.error(err));
    })

    router.post('/vm/:vmName/shutdown', verifyToken, async (req, res) => {
        await core.shutdownVMGuest(req.params.vmName)
            .then(res.status(200).send('VM guest shutted down!')).catch(err => logger.error(err));

    })

    router.post('/vm/:vmName/poweroff', verifyToken, async (req, res) => {
        await core.powerOffVM(req.params.vmName)
            .then(res.status(200).send('VM powered off!')).catch(err => logger.error(err));

    })

    //Tempory for testing
    router.get('/vm/:vmName/backup', verifyToken, async (req, res) => {
        let backupCore = new Core(config.vcenter_url, config.vcenter_username, config.vcenter_password);
        backupCore.addLogger(logger);
        backupCore.createPS(debugging)
            .then(await backupCore.connectVIServer())
            .catch(err => logger.error(err));
        res.status(200).send('VM backup queued!');
        await backupCore.backUpVM(req.params.vmName)
            .then(async () => {
                backupCore.disconnectVIServer(config.vcenter_url);
                backupCore.disposePS();
            }).catch(err => logger.error(err));
    })

    //Tempory for testing
    router.get('/vm/:vmName/testCom', verifyToken, async (req, res) => {
        let testComCore = new Core(config.vcenter_url, config.vcenter_username, config.vcenter_password);
        testComCore.addLogger(logger);
        testComCore.createPS(debugging)
            .then(await testComCore.connectVIServer())
            .catch(err => logger.error(err));
        res.status(200).send('VM backup queued!');
        await testComCore.testCompress(req.params.vmName)
            .then(async () => {
                await testComCore.disconnectVIServer(config.vcenter_url);
                testComCore.disposePS();
            }).catch(err => logger.error(err));
    })

    router.post('/newvm', urlencodedParser, verifyToken, async (req, res) => {
        let vmTemplate;
        await vmTemplateSchema.find({
            Name: req.body.OS
        }).then((templates) => {
            vmTemplate = templates;
        }).catch(err => logger.error(err));
        await core.newVMfromTemplate(req.body, vmTemplate[0], '10.30.22.9', 'datastore1')
            .then(() => {
                res.status(200).send('VM creation in progress!');
                let newVM = new registeredVmSchema({
                    Name: req.body.Name,
                    NumCpu: req.body.NumCpu,
                    MemoryGB: req.body.MemoryGB,
                    ProvisionedSpaceGB: req.body.DiskGB,
                    OS: req.body.OS,
                    Requestor: req.decoded.username,
                    StartDate: new Date(req.body.StartDate),
                    EndDate: new Date(req.body.EndDate)
                })
                newVM.save(logger.info('Registered New VM!')).catch(err => logger.error(err));

                logger.info('Schedule VM: ' + req.body.Name + ' to shut down at: ' + new Date(req.body.EndDate));
                jobs.scheduleJob(req.body.Name, req.body.EndDate, async function () {
                    await core.shutdownVMGuest(req.body.Name)
                        .then(async () => logger.info('VM: ' + req.body.Name + ' was shuted down at: ' + new Date())).catch(err => logger.error(err));

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
    })

    router.post('/extendvm', urlencodedParser, verifyToken, async (req, res) => {
        await registeredVmSchema.findOneAndUpdate({
            Name: req.body.Name
        }, {
            $set: {
                EndDate: new Date(req.body.EndDate)
            }
        }, {
            new: true
        }, (err) => {
            if (err) {
                logger.error(err)
            }
        })
        logger.info('Reschedule VM: ' + req.body.Name + ' to shut down at: ' + new Date(req.body.EndDate));
        jobs.rescheduleJob(req.body.Name, req.body.EndDate)
        res.status(200).send('Extended VM Duration')
    })

    router.delete('/vm/:vmName', verifyToken, async (req, res) => {
        await core.removeVM(req.params.vmName)
            .then(() => {
                res.status(200).send('VM deleted!');
            }).catch(err => logger.error(err));
    })
}

main();

module.exports = router;