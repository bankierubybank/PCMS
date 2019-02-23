const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const Core = require('../src/core.js');
const schedule = require('node-schedule');

express().use(bodyParser.json());

const urlencodedParser = bodyParser.urlencoded({
    extended: false
});

async function main() {
    const core1 = new Core('10.0.15.10', 'administrator@labs.vsphere', 'vc#13ITkmitl');
    await core1.createPS()
        .then(await core1.importPowerCLI())
        .then(await core1.connectVIServer())
        .catch(err => console.log(err));

    const core2 = new Core('10.0.15.10', 'administrator@labs.vsphere', 'vc#13ITkmitl');
    await core2.createPS()
        .then(await core2.importPowerCLI())
        .then(await core2.connectVIServer())
        .catch(err => console.log(err));

    vmRoutes(core1);
    vmOperation(core2);
}

async function vmRoutes(core) {
    router.get('/vms', async (req, res) => {
        await core.getVMs()
            .then(output => {
                res.json(output);
            }).catch(err => console.log(err));
    })

    router.get('/vms/:vmhost', async (req, res) => {
        await core.getVMsbyHostName(req.params.vmhost)
            .then(output => {
                res.json(output);
            }).catch(err => console.log(err));
    })

    router.get('/vm/:vmName', async (req, res) => {
        await core.getVMbyName(req.params.vmName)
            .then(output => {
                res.json(output);
            }).catch(err => console.log(err));
    })

    router.get('/vmharddisk/:vmName', async (req, res) => {
        await core.getVMHarddiskbyName(req.params.vmName)
            .then(output => {
                res.json(output);
            }).catch(err => console.log(err));
    })

    router.get('/vmhosts', async (req, res) => {
        await core.getVMHosts()
            .then(output => {
                res.json(output);
            }).catch(err => console.log(err));
    })

    router.get('/datastores', async (req, res) => {
        await core.getDatastores()
            .then(output => {
                res.json(output);
            }).catch(err => console.log(err));
    })

    router.get('/datacenters', async (req, res) => {
        await core.getDatacenters()
            .then(output => {
                res.json(output);
            }).catch(err => console.log(err));
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
        await core.getVMStat(req.body.vmName, req.body.intervalMins, req.body.stat)
            .then(output => {
                res.json(output);
            }).catch(err => console.log(err));
    })
}

async function vmOperation(core) {
    router.post('/vm/:vmName/poweron', async (req, res) => {
        await core.powerOnVM(req.params.vmName)
            .then(res.status(200).send('POWERED ON')).catch(err => console.log(err));
    })

    router.post('/vm/:vmName/poweroff', async (req, res) => {
        await core.powerOffVM(req.params.vmName)
            .then(res.status(200).send('POWERED OFF')).catch(err => console.log(err));
    })

    //Tempory for testing
    router.get('/vm/:vmName/backup', async (req, res) => {
        let backupCore = new Core('10.0.15.10', 'administrator@labs.vsphere', 'vc#13ITkmitl');
        await backupCore.createPS()
            .then(await backupCore.importPowerCLI())
            .then(await backupCore.connectVIServer())
            .catch(err => console.log(err));
        await backupCore.backUpVM(req.params.vmName)
            .then(output => {
                res.status(200).send('BACKUP COMPLETED!');
                backupCore.disposePS();
            }).catch(err => console.log(err));
    })

    //Tempory for testing
    router.get('/vm/:vmName/testCom', async (req, res) => {
        let testComCore = new Core('10.0.15.10', 'administrator@labs.vsphere', 'vc#13ITkmitl');
        await testComCore.createPS()
            .then(await testComCore.importPowerCLI())
            .then(await testComCore.connectVIServer())
            .catch(err => console.log(err));
        await testComCore.testCompress(req.params.vmName)
            .then(output => {
                res.status(200).send('BACKUP COMPLETED!');
                testComCore.disposePS();
            }).catch(err => console.log(err));
    })

    router.post('/newvm', urlencodedParser, async (req, res) => {
        //let totalMemoryGBAllocated = await core.getTotalMemoryGBAllocatedbyHost('10.30.22.9');
        let vmhost = await core.getVMHostbyName('10.30.22.9');

        // Request VM spec is available for this host
        if ((req.body.MemoryMB / 1024) < vmhost[0].MemoryUsageGB) {
            console.log("RESOURCE AVAILABLE!")

            await core.newVMfromTemplate(req.body)
                .then(output => {
                    console.log(output);
                    res.status(200).send('VM CREATED');
                }).catch(err => console.log(err));

            //Schedule for EndDate
            console.log("STARTED SCHEDULE JOB! at:" + req.body.EndDate);
            let temp = schedule.scheduleJob(req.body.EndDate, async function () {
                console.log("DONE SCHEDULED JOB! at: " + req.body.EndDate);
                /*
            await core.powerOffVM(req.params.vmName)
				.then(output => {
					console.log("VM POWER OFF!");
					res.json(output);
				}).catch(err => {
					console.log(err);
				})
            */
            })
        } else {
            console.log("RESOURCE UNAVAILABLE!")
        }
    })

    router.delete('/vm/:vmName', async (req, res) => {
        await core.removeVM(req.params.vmName)
            .then(output => {
                res.status(200).send('VM DELETED');
            }).catch(err => console.log(err));
    })
}

main();

module.exports = router;