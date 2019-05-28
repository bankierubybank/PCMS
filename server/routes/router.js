const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const schedule = require('node-schedule');
const Core = require('../controllers/core.js');
const config = require('../config/environments/test.json');
const logger = require('../controllers/logger.js');
const debugging = true;
const requestedVmSchema = require('../db/models/requestedVmSchema.js');
const notificationSchema = require('../db/models/notificationSchema.js');
const vmTemplateSchema = require('../db/models/vmTemplateSchema.js');
const VMPerfSchema = require('../db/models/VMPerfSchema.js');
const LdapClient = require('ldapjs-client');
const jwt = require('jsonwebtoken');
const mailer = require('../controllers/mailer.js');
const quotaSchema = require('../db/models/quotaSchema.js');
const uploadToGoogleDrive = require('../controllers/googleDrive.js');

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
        } else if (req.body.username == 'lecturer' && req.body.password == 'lecturer') {
            accountData.type = 'Lecturer';
            accountData.username = 'lecturer';
            accountData.displayName = 'lecturer';
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

    router.get('/quota/vm', verifyToken, async (req, res) => {
        await quotaSchema.find({
            Name: 'Quota Per VM'
        }).then((data) => {
            res.status(200).json(data);
        }).catch(err => logger.error(err));
    })

    router.get('/quota/user', verifyToken, async (req, res) => {
        await quotaSchema.find({
            Name: 'Quota Per User'
        }).then((data) => {
            res.status(200).json(data);
        }).catch(err => logger.error(err));
    })

    router.post('/quota/vm', urlencodedParser, verifyToken, async (req, res) => {
        let quota = await quotaSchema.findOneAndUpdate({
            Name: 'Quota Per VM'
        }, {
            $set: {
                NumCpu: req.body.NumCpu,
                MemoryGB: req.body.MemoryGB,
                ProvisionedSpaceGB: req.body.ProvisionedSpaceGB
            }
        }, {
            new: true
        }, (err, data) => {
            if (err) {
                logger.error(err);
            }
            if (!data) {
                let newQuota = new quotaSchema({
                    Name: 'Quota Per VM',
                    NumCpu: 1,
                    MemoryGB: 1,
                    ProvisionedSpaceGB: 16,
                    Users: 1
                })
                newQuota.save(logger.info('Create new quota rule!')).catch(err => logger.error(err));
            }
        });
        res.status(200).json(quota)
    })

    router.post('/quota/user', urlencodedParser, verifyToken, async (req, res) => {
        let quota = await quotaSchema.findOneAndUpdate({
            Name: 'Quota Per User'
        }, {
            $set: {
                NumCpu: req.body.NumCpu,
                MemoryGB: req.body.MemoryGB,
                ProvisionedSpaceGB: req.body.ProvisionedSpaceGB
            }
        }, {
            new: true
        }, (err, data) => {
            if (err) {
                logger.error(err);
            }
            if (!data) {
                let newQuota = new quotaSchema({
                    Name: 'Quota Per User',
                    NumCpu: 1,
                    MemoryGB: 1,
                    ProvisionedSpaceGB: 16,
                    Users: 1
                })
                newQuota.save(logger.info('Create new quota rule!')).catch(err => logger.error(err));
            }
        });
        res.status(200).json(quota)
    })

    router.post('/recalquota', urlencodedParser, verifyToken, async (req, res) => {
        let FreeSpaceGB = 0;
        await core1.getDatastores()
            .then(datastores => {
                datastores.forEach(datastore => {
                    FreeSpaceGB += parseFloat(datastore.FreeSpaceGB)
                })
            }).catch(err => logger.error(err));

        //Use 70% of free space to calculate quota
        let quota = await quotaSchema.findOneAndUpdate({
            Name: 'Quota Per User'
        }, {
            $set: {
                NumCpu: 1,
                MemoryGB: 1,
                ProvisionedSpaceGB: parseInt(((FreeSpaceGB * 70 / 100) / req.body.Users), 10),
                Users: req.body.Users
            }
        }, {
            new: true
        }, (err) => {
            if (err) {
                logger.error(err);
            }
        });
        res.status(200).json(quota)
    })

    router.get('/notification', verifyToken, async (req, res) => {
        if (req.decoded.type == 'Lecturer') {
            await notificationSchema.find({
                'Requestor.Lecturer': req.decoded.username
            }).then((notifications) => {
                if (notifications[0]) {
                    res.status(200).json(notifications)
                } else {
                    res.status(200).json([])
                }
            }).catch(err => logger.error(err))
        } else if (req.decoded.type == 'Student') {
            await notificationSchema.find({
                'Requestor.Student': req.decoded.username
            }).then((notifications) => {
                if (notifications[0]) {
                    res.status(200).json(notifications)
                } else {
                    res.status(200).json([])
                }
            }).catch(err => logger.error(err))
        }
    })

    router.get('/registeredvm', verifyToken, async (req, res) => {
        if (req.decoded.type == 'Staff') {
            await requestedVmSchema.find().then((registeredVMs) => {
                if (registeredVMs[0]) {
                    res.status(200).json(registeredVMs)
                } else {
                    res.status(200).json([])
                }
            }).catch(err => logger.error(err))
        } else if (req.decoded.type == 'Lecturer') {
            await requestedVmSchema.find({
                'Requestor.Lecturer': req.decoded.username
            }).then((registeredVMs) => {
                if (registeredVMs[0]) {
                    res.status(200).json(registeredVMs)
                } else {
                    res.status(200).json([])
                }
            }).catch(err => logger.error(err))
        } else if (req.decoded.type == 'Student') {
            await requestedVmSchema.find({
                'Requestor.Student': req.decoded.username
            }).then((registeredVMs) => {
                if (registeredVMs[0]) {
                    res.status(200).json(registeredVMs)
                } else {
                    res.status(200).json([])
                }
            }).catch(err => logger.error(err))
        }
    })

    router.get('/template', verifyToken, async (req, res) => {
        await vmTemplateSchema.find().then((templates) => {
            res.status(200).json(templates);
        }).catch(err => logger.error(err));
    })

    router.get('/lecturer', verifyToken, async (req, res) => {
        await searchAD({
            scope: 'sub',
            attributes: ['sAMAccountName', 'displayName']
        }, 'OU=Lecturer,DC=it,DC=kmitl,DC=ac,DC=th').then((lecturer) => {
            res.status(200).json(lecturer);
        }).catch(err => logger.error(err));
    })

    router.get('/logout', verifyToken, async (req, res) => {
        res.status(200).json({
            status: false,
            token: null
        })
    })

    await vmRoutes(core1);
    await vmOperation(core2, jobs);
    await reScheduleVM(jobs);

    router.use((req, res) => {
        res.status(404).send('Not found.');
    });
}

async function searchAD(options, OU) {
    let client = new LdapClient({
        url: config.ldap_url
    });

    await client.bind(config.ldap_username, config.ldap_password)
        .catch(err => {
            logger.error(err);
        });

    return await client.search(OU, options);
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
 * @param {schedule} jobs Node-schedule jobs.
 */
async function reScheduleVM(jobs) {
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
                logger.info('Schedule VM: ' + vm.Name + ' to shut down at: ' + new Date(vm.EndDate.getTime() - (1000 * 60 * 60 * 24 * 15)));
                jobs.scheduleJob(vm.Name, vm.EndDate - 15, async function () {
                    await nearExpired(vm)
                })
                jobs.scheduleJob(vm.Name, vm.EndDate, async function () {
                    await backup(vm)
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
                cpu = await core.getLatestVMStat(vm.Id, 'cpu.usage.average').catch(err => {
                    logger.info(cpu)
                    logger.error(err)
                });
                mem = await core.getLatestVMStat(vm.Id, 'mem.usage.average').catch(err => {
                    logger.info(mem)
                    logger.error(err)
                });
                disk = await core.getLatestVMStat(vm.Id, 'disk.usage.average').catch(err => {
                    logger.info(disk)
                    logger.error(err)
                });
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
        await core.getVMs({
                Location: 'Public Cloud'
            })
            .then(output => {
                res.status(200).json(output);
            }).catch(err => logger.error(err));
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
        await core.getDatastores({
                Location: 'Public Cloud'
            })
            .then(output => {
                res.status(200).json(output);
            }).catch(err => logger.error(err));
    })

    router.get('/datastoreclusters', verifyToken, async (req, res) => {
        await core.getDatastoreClusters({
                Name: 'Public Cloud Storage Cluster'
            })
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
        await core.getVMStat(await escapeSpecial(req.body.vmName), req.body.intervalMins, req.body.stat)
            .then(output => {
                res.status(200).json(output);
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
        let requestDoc = {
            Name: req.body.Name,
            NumCpu: req.body.NumCpu,
            MemoryGB: req.body.MemoryGB,
            ProvisionedSpaceGB: req.body.DiskGB,
            OS: req.body.OS,
            Requestor: {
                Lecturer: '',
                Student: '',
                Course: req.body.Requestor.Course
            },
            Type: req.body.Type,
            Status: 'Pending',
            StartDate: new Date(req.body.StartDate),
            EndDate: new Date(req.body.EndDate)
        }
        let registeredVMs = [];
        if (req.decoded.type == 'Lecturer') {
            requestDoc.Requestor.Lecturer = req.decoded.username
            registeredVMs = await requestedVmSchema.find({
                'Requestor.Lecturer': req.decoded.username,
                Status: 'Approved'
            }).catch(err => logger.error(err))
        } else if (req.decoded.type == 'Student') {
            requestDoc.Requestor.Lecturer = req.body.Requestor.Lecturer
            requestDoc.Requestor.Student = req.decoded.username
            registeredVMs = await requestedVmSchema.find({
                'Requestor.Student': req.decoded.username,
                Status: 'Approved'
            }).catch(err => logger.error(err))
        }
        let totalProvisionedGB = 0;
        registeredVMs.forEach(vm => {
            totalProvisionedGB += vm.ProvisionedSpaceGB
        })

        let newVM = new requestedVmSchema(requestDoc)
        newVM.save(res.status(200).send('VM Requested!')).catch(err => logger.error(err));

        let vmQuota = await quotaSchema.find({
            Name: 'Quota Per VM'
        }).catch(err => logger.error(err));
        let userQuota = await quotaSchema.find({
            Name: 'Quota Per User'
        }).catch(err => logger.error(err));

        if (req.body.DiskGB <= vmQuota[0].ProvisionedSpaceGB && (req.body.DiskGB + totalProvisionedGB) <= userQuota[0].ProvisionedSpaceGB) {
            let vmSpec = await requestedVmSchema.findOneAndUpdate({
                Name: req.body.Name
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
            /*
            if (req.body.OS == 'Ubuntu') {
                logger.info('Ubuntu');
                let vmTemplate;
                await vmTemplateSchema.find({
                    Name: 'UbuntuTemplate'
                }).then((templates) => {
                    vmTemplate = templates;
                }).catch(err => logger.error(err));
                await core.newVMfromTemplate(vmSpec, vmTemplate[0], 'Requested VM by uranium', {
                    Name: 'Datastores Cluster',
                    Type: 'DatastoreCluster'
                }).catch(err => logger.error(err));
            } else {
                await core.newVM(vmSpec, 'Requested VM by uranium', {
                    Name: 'Datastores Cluster',
                    Type: 'DatastoreCluster'
                }).catch(err => logger.error(err));
            }
            */
            await core.newVM(vmSpec, 'Requested VM by uranium', {
                Name: 'Public Cloud Storage Cluster',
                Type: 'DatastoreCluster'
            }).catch(err => logger.error(err));

            await sendNoti(vmSpec, 'Approved')
            logger.info('Schedule VM: ' + vmSpec.Name + ' to shut down at: ' + new Date(vmSpec.EndDate));
            jobs.scheduleJob(vmSpec.Name, vmSpec.EndDate, async function () {
                await backup(vmSpec)
            })
        }
    })

    router.post('/autocreate', verifyToken, async (req, res) => {
        let vmSpec = await requestedVmSchema.findOneAndUpdate({
            Name: req.body.Name
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
        res.status(200).send('VM Approved!');

        /*
        if (req.body.OS == 'Ubuntu') {
            logger.info('Ubuntu');
            let vmTemplate;
            await vmTemplateSchema.find({
                Name: 'UbuntuTemplate'
            }).then((templates) => {
                vmTemplate = templates;
            }).catch(err => logger.error(err));
            await core.newVMfromTemplate(vmSpec, vmTemplate[0], 'Requested VM by uranium', {
                Name: 'Datastores Cluster',
                Type: 'DatastoreCluster'
            }).catch(err => logger.error(err));
        } else {
            await core.newVM(vmSpec, 'Requested VM by uranium', {
                Name: 'Datastores Cluster',
                Type: 'DatastoreCluster'
            }).catch(err => logger.error(err));
        }
        */

        await core.newVM(vmSpec, 'Requested VM by uranium', {
            Name: 'Public Cloud Storage Cluster',
            Type: 'DatastoreCluster'
        }).catch(err => logger.error(err));

        await sendNoti(vmSpec, 'Approved');
        logger.info('Schedule VM: ' + vmSpec.Name + ' to shut down at: ' + new Date(vmSpec.EndDate));
        jobs.scheduleJob(vmSpec.Name, vmSpec.EndDate, async function () {
            await backup(vmSpec);
        })
    })

    router.post('/reject', verifyToken, async (req, res) => {
        let vmSpec = await requestedVmSchema.findOneAndUpdate({
            Name: req.body.Name
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
        await sendNoti(vmSpec, 'Rejected', req.body.Reason)
    })

    router.post('/extendvm', urlencodedParser, verifyToken, async (req, res) => {
        let registeredVMs = [];
        if (req.decoded.type == 'Lecturer') {
            registeredVMs = await requestedVmSchema.find({
                'Requestor.Lecturer': req.decoded.username,
                Status: 'Approved'
            }).catch(err => logger.error(err))
        } else if (req.decoded.type == 'Student') {
            registeredVMs = await requestedVmSchema.find({
                'Requestor.Student': req.decoded.username,
                Status: 'Approved'
            }).catch(err => logger.error(err))
        }
        let totalProvisionedGB = 0;
        registeredVMs.forEach(vm => {
            totalProvisionedGB += vm.ProvisionedSpaceGB
        })

        let vmQuota = await quotaSchema.find({
            Name: 'Quota Per VM'
        }).catch(err => logger.error(err));
        let userQuota = await quotaSchema.find({
            Name: 'Quota Per User'
        }).catch(err => logger.error(err));

        let vmSpec = await requestedVmSchema.findOne({
            Name: req.body.Name
        })

        if (vmSpec.DiskGB <= vmQuota[0].ProvisionedSpaceGB && (vmSpec.DiskGB + totalProvisionedGB) <= userQuota[0].ProvisionedSpaceGB) {
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
            res.status(200).send('Extended VM Duration');
            await sendNoti(vmSpec, 'Extended');
            logger.info('Reschedule VM: ' + req.body.Name + ' to shut down at: ' + new Date(req.body.EndDate));
            jobs.rescheduleJob(req.body.Name, req.body.EndDate);
        } else {
            await requestedVmSchema.findOneAndUpdate({
                Name: req.body.Name
            }, {
                $set: {
                    Status: 'ExtendPending',
                    NewEndDate: new Date(req.body.EndDate)
                }
            }, {
                new: true
            }, (err) => {
                if (err) {
                    logger.error(err)
                }
            });
            res.status(200).send('Extended VM Duration Pending');
        }
    })

    router.post('/extendvm/approve', urlencodedParser, verifyToken, async (req, res) => {
        let vmSpec = await requestedVmSchema.findOne({
            Name: req.body.Name
        });
        await requestedVmSchema.findOneAndUpdate({
            Name: req.body.Name
        }, {
            $set: {
                Status: 'Approved',
                EndDate: vmSpec.NewEndDate
            }
        }, {
            new: true
        }, (err) => {
            if (err) {
                logger.error(err)
            }
        });
        res.status(200).send('Extended VM Duration');
        await sendNoti(vmSpec, 'Extended');
        logger.info('Reschedule VM: ' + req.body.Name + ' to shut down at: ' + new Date(vmSpec.NewEndDate));
        jobs.rescheduleJob(req.body.Name, vmSpec.NewEndDate);
    })

    router.delete('/vm/:vmName', verifyToken, async (req, res) => {
        await core.removeVM(await escapeSpecial(req.params.vmName))
            .then(async () => {
                await requestedVmSchema.deleteOne({
                    Name: req.param.vmName
                }).catch(err => logger.error(err));
                res.status(200).send('VM deleted!');
            }).catch(err => logger.error(err));
    })
}

async function sendNoti(vmSpec, Status, Reason) {
    let noti = new notificationSchema({
        Name: vmSpec.Name,
        Requestor: vmSpec.Requestor,
        Subject: `VM ${vmSpec.Name} ${Status}!`,
        Message: `VM ${vmSpec.Name} ${Status}!`,
        Timestamp: new Date()
    })
    if (Status == 'Rejected') {
        noti.Message = `VM ${vmSpec.Name} ${Status}! Please Check You Email`

    }
    noti.save().catch(err => logger.error(err))

    let lecturerEmail;
    if (vmSpec.Requestor.Lecturer == 'lecturer') {
        lecturerEmail = '58070020@kmitl.ac.th'
    } else {
        let loptions = {
            scope: 'sub',
            attributes: ['sAMAccountName', 'displayName', 'mail'],
            filter: `(&(sAMAccountName=${vmSpec.Requestor.Lecturer}*))`
        };
        lecturerEmail = await searchAD(loptions, 'OU=Lecturer,DC=it,DC=kmitl,DC=ac,DC=th');
        lecturerEmail = lecturerEmail[0].mail
    }
    await mailer.send(lecturerEmail, vmSpec, Status, Reason);
    if (vmSpec.Requestor.Student) {
        let soptions = {
            scope: 'sub',
            attributes: ['sAMAccountName', 'displayName', 'mail'],
            filter: `(&(sAMAccountName=${vmSpec.Requestor.Student}*))`
        };
        let studentEmail = await searchAD(soptions, 'OU=Student,DC=it,DC=kmitl,DC=ac,DC=th');
        await mailer.send(studentEmail[0].mail, vmSpec, Status, Reason);
    }
}

async function backup(vmSpec) {
    let backupCore = new Core(config.vcenter_url, config.vcenter_username, config.vcenter_password);
    await backupCore.shutdownVMGuest(await escapeSpecial(vmSpec.Name))
        .then(async () => logger.info('VM: ' + vmSpec.Name + ' was shuted down at: ' + new Date())).catch(err => logger.error(err));
    backupCore.addLogger(logger);
    backupCore.createPS(debugging)
        .then(await backupCore.connectVIServer())
        .catch(err => logger.error(err));
    await backupCore.backUpVM(await escapeSpecial(vmSpec.Name))
        .then(async () => {
            await uploadToGoogleDrive(vmSpec.Name + '.zip');
            await sendNoti(vmSpec, 'Backup');
            await backupCore.removeItem(vmSpec.Name);
            await backupCore.removeVM(await escapeSpecial(vmSpec.Name));
            await backupCore.disconnectVIServer(config.vcenter_url);
            backupCore.disposePS();
        }).catch(err => logger.error(err));
}

async function nearExpired(vmSpec) {
    await sendNoti(vmSpec, 'Near_Expired')
}

async function escapeSpecial(string) {
    return await string.replace('[', '*').replace(']', '*');
}

main();

module.exports = router;