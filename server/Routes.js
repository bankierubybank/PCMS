async function createCore() {
  let express = require('express');
  let routes = express.Router();
  let Core = require('./core.js');
  const core = new Core('10.0.15.10', 'administrator@labs.vsphere', 'vc#13ITkmitl');
  await core.createPS();
  await core.importPowerCLI();
  await core.connectVIServer();
  routes.route('/vms').get(async function (req, res, next) {
    await core.getVMs()
    .then(output => {
      res.json(output);
    }).catch(err => {
      console.log(err);
    })
  })
  routes.route('/vm/:name').post(async function (req, res, next) {
    let name = req.params.name;
    await core.getVM(name)
    .then(output => {
      res.json(output);
    }).catch(err => {
      console.log(err);
    })
  })
  routes.route('/disconnect').get(async function (req, res, next) {
    await core.disconnectVIServer()
    .then(output => {
      res.json('Disconnected');
    }).catch(err => {
      console.log(err);
    })
  })
  module.exports = routes;
}
