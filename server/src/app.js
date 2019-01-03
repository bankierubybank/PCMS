const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');

async function createServer() {
	const app = express();
	app.use(morgan('combined'));
	app.use(bodyParser.json());
	app.use(cors());

	let Core = require('./core.js');
	let core = new Core('10.0.15.10', 'administrator@labs.vsphere', 'vc#13ITkmitl');
	await core.createPS();
	await core.importPowerCLI();
	await core.connectVIServer();

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

	/*
	app.post('/newvm', async (req, res) => {
		await core.newVM()
			.then(output => {
				res.json(output);
			}).catch(err => {
				console.log(err);
			})
	})
	*/

	app.listen(8081);
	console.log('App listen on port: 8081');
}

createServer();