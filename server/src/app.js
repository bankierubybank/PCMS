const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const PORT = 8081;

async function createServer() {
	const app = express();
	app.use(morgan('combined'));
	app.use(bodyParser.json());
	app.use(cors());
	let urlencodedParser = bodyParser.urlencoded({
		extended: false
	});

	let Core = require('./core.js');
	let core = new Core('10.0.15.10', 'administrator@labs.vsphere', 'vc#13ITkmitl');
	await core.createPS();
	await core.importPowerCLI();
	await core.connectVIServer();

	let schedule = require('node-schedule');

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

	app.post('/newvm', urlencodedParser, async (req, res) => {
		console.log(req.body);
		res.send('POST REQ: newvm');


		await core.getVMHost(req.body.VMHost){
			.then(output => {
				console.log(output);
			}).catch(err => {
				console.log(err);
			})
		}

		/*await core.newVM(req.body)
			.then(output => {
				res.send('POST REQ: newvm');
			}).catch(err => {
				console.log(err);
			})
		*/

		console.log(req.body.endDate);
		let temp = schedule.scheduleJob(req.body.endDate, async function () {
            console.log("DONE SCHEDULED JOB! at: " + req.body.endDate);
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