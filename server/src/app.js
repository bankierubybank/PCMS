const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const schedule = require('node-schedule');
const PORT = 8081;
const Core = require('./core.js');

async function createServer() {
	const app = express();
	app.use(morgan('combined'));
	app.use(bodyParser.json());
	app.use(cors());
	app.use(helmet());

	const core = new Core('10.0.15.10', 'administrator@labs.vsphere', 'vc#13ITkmitl');
	await core.createPS()
		.then(await core.importPowerCLI())
		.then(await core.connectVIServer())
		.catch(err => console.log(err));

	app.get('/vms', async (req, res) => {
		await core.getVMs()
			.then(output => {
				res.json(output);
			}).catch(err => {
				console.log(err);
			})
	})

	app.get('/vm/:vmName', async (req, res) => {
		await core.getVMbyName(req.params.vmName)
			.then(output => {
				res.json(output);
			}).catch(err => {
				console.log(err);
			})
	})

	app.get('/vmharddisk/:vmName', async (req, res) => {
		await core.getVMHarddiskbyName(req.params.vmName)
			.then(output => {
				res.json(output);
			}).catch(err => {
				console.log(err);
			})
	})

	app.get('/vmhosts', async (req, res) => {
		await core.getVMHosts()
			.then(output => {
				res.json(output);
			}).catch(err => {
				console.log(err);
			})
	})

	app.get('/datastores', async (req, res) => {
		await core.getDatastores()
			.then(output => {
				res.json(output);
			}).catch(err => {
				console.log(err);
			})
	})

	app.get('/datacenters', async (req, res) => {
		await core.getDatacenters()
			.then(output => {
				res.json(output);
			}).catch(err => {
				console.log(err);
			})
	})

	app.get('/vmstat/:vmName', async (req, res) => {
		await core.getVMStat(req.params.vmName)
			.then(output => {
				res.json(output);
			}).catch(err => {
				console.log(err);
			})
	})

	app.get('/vm/:vmName/poweron', async (req, res) => {
		await core.powerOnVM(req.params.vmName)
			.then(output => {
				console.log("VM POWER ON!");
				res.json(output);
			}).catch(err => {
				console.log(err);
			})
	})

	app.get('/vm/:vmName/poweroff', async (req, res) => {
		await core.powerOffVM(req.params.vmName)
			.then(output => {
				console.log("VM POWER OFF!");
				res.json(output);
			}).catch(err => {
				console.log(err);
			})
	})

	//Tempory for testing
	app.get('/vm/:vmName/backup', async (req, res) => {
		await core.backUpVM(req.params.vmName)
			.then(output => {
				console.log("VM BACK UP COMPLETED!");
			}).catch(err => {
				console.log(err);
			})
	})

	let urlencodedParser = bodyParser.urlencoded({
		extended: false
	});

	app.post('/newvm', urlencodedParser, async (req, res) => {
		console.log(req.body);
		res.send('POST REQ: newvm');

		//let totalMemoryGBAllocated = await core.getTotalMemoryGBAllocatedbyHost('10.30.22.9');
		let vmhost = await core.getVMHostbyName('10.30.22.9');

		// Request VM spec is available for this host
		if ((req.body.MemoryMB / 1024) < vmhost[0].MemoryUsageGB) {
			console.log("RESOURCE AVAILABLE!")
			
			await core.newVMfromTemplate(req.body)
			.then(output => {
				
			}).catch(err => {
				console.log(err);
			})

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

	app.delete('/vm/:vmName', async (req, res) => {
		await core.removeVM(req.params.vmName)
			.then(output => {
				res.send('DELETE REQ: vm/vmName');
			}).catch(err => {
				console.log(err);
			})
	})

	app.listen(PORT, () => console.log('App listen on port: ' + PORT));
}

createServer();