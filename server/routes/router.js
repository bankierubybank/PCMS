const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const schedule = require('node-schedule');
const Core = require('../controllers/core.js');
const config = require('../config/environments/test.json');
const logger = require('../controllers/logger.js');
const debugging = true;
const requestedVmSchema = require('../db/models/requestedVmSchema.js');
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

            let lecturers = await client.search('OU=Lecturer,DC=it,DC=kmitl,DC=ac,DC=th', options);
            let staffs = await client.search('OU=Staff,DC=it,DC=kmitl,DC=ac,DC=th', options);
            let students = await client.search('OU=Student,DC=it,DC=kmitl,DC=ac,DC=th', options);

            if (lecturers.length != 0) {
                accountData.type = 'Lecturer';
                accountData.username = lecturers[0].sAMAccountName;
                accountData.displayName = lecturers[0].displayName;
                accountData.mail = lecturers[0].mail;
            } else if (staffs.length != 0) {
                accountData.type = 'Staff';
                accountData.username = staffs[0].sAMAccountName;
                accountData.displayName = staffs[0].displayName;
                accountData.mail = staffs[0].mail;
            } else if (students.length != 0) {
                accountData.type = 'Student';
                accountData.username = students[0].sAMAccountName;
                accountData.displayName = students[0].displayName;
                accountData.mail = students[0].mail;
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
            username: accountData.username,
            displayName: accountData.displayName,
            mail: accountData.mail,
            token: token
        });
    });

    router.get('/checktoken', verifyToken, async (req, res) => {
        res.status(200).json({
            status: true
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
    await requestedVmSchema.find({
            Status: {
                $eq: 'Approved'
            },
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
                            await backupCore.removeVM(vm.Name);
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
        let vms = await core.getVMs().catch(err => logger.error(err));
        for (let vm of vms) {
            let cpu; //Percentage
            let mem; //Percentage
            let disk; //KBps
            if (vm.PowerState) {
                cpu = await core.getLatestVMStat(vm.Name, 'cpu.usage.average').catch(err => logger.error(err));
                mem = await core.getLatestVMStat(vm.Name, 'mem.usage.average').catch(err => logger.error(err));
                disk = await core.getLatestVMStat(vm.Name, 'disk.usage.average').catch(err => logger.error(err));
                cpu = cpu[0].Value;
                mem = mem[0].Value;
                disk = disk[0].Value;
            } else {
                cpu = 0;
                mem = 0;
                disk = 0;
            }
            VMPerfSchema.findOneAndUpdate({
                Name: vm.Name
            }, {
                $addToSet: {
                    stats: {
                        timestamp: new Date(),
                        PowerState: vm.PowerState,
                        CPU: cpu,
                        Memory: mem,
                        Disk: disk
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
                            PowerState: vm.PowerState,
                            CPU: cpu,
                            Memory: mem,
                            Disk: disk
                        }]
                    });
                    vmPerf.save(logger.info('Saved New VM PowerState')).catch(err => logger.error(err));
                } else {
                    logger.info('Saved Existing VM PowerState');
                }
            })
        }
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

    router.get('/registeredvm', verifyToken, async (req, res) => {
        let vms;
        if (req.decoded.type == 'Staff') {
            await requestedVmSchema.find().then((registeredVMs) => {
                vms = registeredVMs;
            }).catch(err => logger.error(err))
            if (vms[0]) {
                res.status(200).json(vms)
            } else {
                res.status(200).json([])
            }
        } else {
            await requestedVmSchema.find({
                Requestor: req.decoded.username
            }).then((registeredVMs) => {
                vms = registeredVMs;
            }).catch(err => logger.error(err))
            if (vms[0]) {
                res.status(200).json(vms)
            } else {
                logger.info(vms)
                res.status(200).json([])
            }
        }
    })

    router.get('/powerstate', verifyToken, async (req, res) => {
        await VMPerfSchema.find().then((data) => {
            res.status(200).json(data);
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
    router.post('/vmstat', urlencodedParser, verifyToken, async (req, res) => {
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
    router.post('/newvm', urlencodedParser, verifyToken, async (req, res) => {
        let newVM = new requestedVmSchema({
            Name: req.body.Name,
            NumCpu: req.body.NumCpu,
            MemoryGB: req.body.MemoryGB,
            ProvisionedSpaceGB: req.body.DiskGB,
            OS: req.body.OS,
            Requestor: req.decoded.username,
            Status: 'Pending',
            StartDate: new Date(req.body.StartDate),
            EndDate: new Date(req.body.EndDate)
        })
        newVM.save(res.status(200).send('VM Requested!')).catch(err => logger.error(err));
    })

    router.post('/vm/:vmName/approve', verifyToken, async (req, res) => {
        await requestedVmSchema.findOneAndUpdate({
            Name: req.params.vmName
        }, {
            $set: {
                Status: 'Approved'
            }
        }, {
            new: true
        }, (err) => {
            if (err) {
                logger.error(err)
            }
        });
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
                    await backupCore.removeVM(req.body.Name);
                    await backupCore.disconnectVIServer(config.vcenter_url);
                    backupCore.disposePS();
                }).catch(err => logger.error(err));
        })
        res.status(200).send('VM Approved!');
    })

    router.post('/vm/:vmName/autocreate', verifyToken, async (req, res) => {
        let vmSpec = await requestedVmSchema.findOneAndUpdate({
            Name: req.params.vmName
        }, {
            $set: {
                Status: 'Approved'
            }
        }, {
            new: true
        }, (err) => {
            if (err) {
                logger.error(err)
            }
        });
        let vmTemplate;
        await vmTemplateSchema.find({
            Name: 'UbuntuTemplate'
        }).then((templates) => {
            vmTemplate = templates;
        }).catch(err => logger.error(err));
        await core.newVMfromTemplate(vmSpec, vmTemplate[0], 'Requested VM', 'datastore1').catch(err => logger.error(err));
        logger.info('Schedule VM: ' + vmSpec.Name + ' to shut down at: ' + new Date(vmSpec.EndDate));
        jobs.scheduleJob(vmSpec.Name, vmSpec.EndDate, async function () {
            await core.shutdownVMGuest(vmSpec.Name)
                .then(async () => logger.info('VM: ' + vmSpec.Name + ' was shuted down at: ' + new Date())).catch(err => logger.error(err));
            let backupCore = new Core(config.vcenter_url, config.vcenter_username, config.vcenter_password);
            backupCore.addLogger(logger);
            backupCore.createPS(debugging)
                .then(await backupCore.connectVIServer())
                .catch(err => logger.error(err));
            await backupCore.backUpVM(vmSpec.vmName)
                .then(async () => {
                    await backupCore.removeVM(vmSpec.Name);
                    await backupCore.disconnectVIServer(config.vcenter_url);
                    backupCore.disposePS();
                }).catch(err => logger.error(err));
        })
        res.status(200).send('VM Approved!');
    })

    router.post('/vm/:vmName/reject', verifyToken, async (req, res) => {
        await requestedVmSchema.findOneAndUpdate({
            Name: req.params.vmName
        }, {
            $set: {
                Status: 'Rejected'
            }
        }, {
            new: true
        }, (err) => {
            if (err) {
                logger.error(err)
            }
        });
        res.status(200).send('VM Rejected!');
    })

    router.post('/extendvm', urlencodedParser, verifyToken, async (req, res) => {
        await requestedVmSchema.findOneAndUpdate({
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
        });
        logger.info('Reschedule VM: ' + req.body.Name + ' to shut down at: ' + new Date(req.body.EndDate));
        jobs.rescheduleJob(req.body.Name, req.body.EndDate);
        res.status(200).send('Extended VM Duration');
    })

    router.delete('/vm/:vmName', verifyToken, async (req, res) => {
        await core.removeVM(req.params.vmName)
            .then(async () => {
                await requestedVmSchema.deleteOne({
                    Name: req.param.vmName
                }).catch(err => logger.error(err));
                res.status(200).send('VM deleted!');
            }).catch(err => logger.error(err));
    })
}

main();

module.exports = router;