class Core {
  constructor(server, username, password) {
    this.server = server;
    this.username = username;
    this.password = password;
  }

  //Set-PowerCLIConfiguration -DisplayDeprecationWarnings:$false

  async createPS() {
    /*
    Create PowerShell instance to invoke PowerShell commands and parse output to JSON
    */
    let nodePowershell = require('node-powershell');
    this.PS = new nodePowershell({
      debugMsg: true,
      inputEncoding: 'utf8',
      outputEncoding: 'utf8',
      executionPolicy: 'RemoteSigned',
      noProfile: true
    });
  }

  async importPowerCLI() {
    /*
    Import PowerCLI Module
    */
    this.PS.addCommand('Import-Module VMware.PowerCLI')
    await this.PS.invoke()
    .then({
    }).catch(err => {
      console.log(err);
    });
  }

  async ParticipateInCEIP() {
    /*
    Set PowerCLIConfiguration ParticipateInCEIP as true
    */
    this.PS.addCommand('Set-PowerCLIConfiguration -Scope User -ParticipateInCEIP $true -Confirm:$false')
    await this.PS.invoke()
    .then({
    }).catch(err => {
      console.log(err);
    });
  }

  async connectVIServer() {
    /*
    Connect to vCenter Server
    */
    this.PS.addCommand('Connect-VIServer', [
      {Server: this.server},
      {User: this.username},
      {Password: this.password},
      'Force'
      ]);
    await this.PS.invoke()
    .then(output => {
      console.log(output);
    }).catch(err => {
      console.log(err);
    });
  }

  async getVMs() {
    /*
    Get all virtual machines data from vCenter Server
    */
    let vms;
    this.PS.addCommand('$vms = Get-VM | Select-Object -Property * , @{N="IP Address";E={@($_.guest.IPAddress -join "|")}}')
    await this.PS.invoke()
    .then({
    }).catch(err => {
      console.log(err);
    });
    this.PS.addCommand('$vms | ConvertTo-Json -Depth 1 -AsArray');
    await this.PS.invoke()
    .then(output => {
      console.log(output);
      vms = JSON.parse(output);
    }).catch(err => {
      console.log(err);
    });
    return vms;
  }

  async getVM(vmName) {
    /*
    Get virtual machine data by name
    */
    let vm;
    this.PS.addCommand('$vm = Get-VM @Name | Select-Object -Property * , @{N="IP Address";E={@($_.guest.IPAddress -join "|")}}', [
      {Name: vmName}
      ]);
    await this.PS.invoke()
    .then({
    }).catch(err => {
      console.log(err);
    });
    this.PS.addCommand('$vm | ConvertTo-Json -Depth 1 -AsArray');
    await this.PS.invoke()
    .then(output => {
      console.log(output);
      vm = JSON.parse(output);
    }).catch(err => {
      console.log(err);
    });
    return vm;
  }

  async disconnectVIServer() {
    /*
    Disconnect from vCenter Server and dispose PowerShell instance
    */
    this.PS.addCommand('Disconnect-VIServer', [
      {Server: this.server},
      'Confirm:$false'
      ]);
    await this.PS.invoke()
    .then(output => {
      console.log(output);
      this.PS.dispose();
    }).catch(err => {
      console.log(err);
      this.PS.dispose();
    });
  }
}

class Server {
  constructor(hostname, port) {
    this.hostname = hostname;
    this.port = port;
  }

  createServer(JSONdata) {
    /*
    Create Server and bind server at given host:port for response http request
    */
    let http = require('http');
    this.server = http.createServer((req, res) => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/plain');
      res.end(JSON.stringify(JSONdata) + '\n');
    });
    this.server.listen(this.port, this.hostname, () => {
      console.log(`Server running at http://${this.hostname}:${this.port}/`);
    });
  }


}

async function main() {
  /*
  Temporary function used for testing
  */
  const core = new Core('10.0.15.10', 'administrator@labs.vsphere', 'vc#13ITkmitl');
  await core.createPS();
  await core.importPowerCLI();
  await core.ParticipateInCEIP();
  await core.connectVIServer();
  let vm = await core.getVM("Ubuntu Server");
  await core.disconnectVIServer();
  const server = new Server('127.0.0.1', '3000');
  server.createServer(vm);
}

main();