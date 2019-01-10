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
    this.PS.addCommand('$isPowerCLIImported = Get-Module VMware.PowerCLI')
    await this.PS.invoke()
      .then({}).catch(err => {
        console.log(err);
      });
    this.PS.addCommand('if ($isPowerCLIImported) {Import-Module VMware.PowerCLI}')
    await this.PS.invoke()
      .then({}).catch(err => {
        console.log(err);
      });
  }

  async ParticipateInCEIP() {
    /*
    Set PowerCLIConfiguration ParticipateInCEIP as true
    */
    this.PS.addCommand('Set-PowerCLIConfiguration -Scope User -ParticipateInCEIP $true -Confirm:$false')
    await this.PS.invoke()
      .then({}).catch(err => {
        console.log(err);
      });
  }

  async connectVIServer() {
    /*
    Connect to vCenter Server
    */
    this.PS.addCommand('Connect-VIServer', [{
        Server: this.server
      },
      {
        User: this.username
      },
      {
        Password: this.password
      },
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
      .then({}).catch(err => {
        console.log(err);
      });
    this.PS.addCommand('$vms | ConvertTo-Json -Depth 1 -AsArray');
    await this.PS.invoke()
      .then(output => {
        vms = JSON.parse(output);
      }).catch(err => {
        console.log(err);
      });
    return vms;
  }

  async getVMbyName(vmName) {
    /*
    Get virtual machine data by name
    */
    let vm;
    this.PS.addCommand('$vm = Get-VM @Name | Select-Object -Property * , @{N="IP Address";E={@($_.guest.IPAddress -join "|")}}', [{
      Name: vmName
    }]);
    await this.PS.invoke()
      .then({}).catch(err => {
        console.log(err);
      });
    this.PS.addCommand('$vm | ConvertTo-Json -Depth 1 -AsArray');
    await this.PS.invoke()
      .then(output => {
        vm = JSON.parse(output);
      }).catch(err => {
        console.log(err);
      });
    return vm;
  }

  async getVMHarddiskbyName(vmName) {
    /*
    Get virtual machine harddisk data by name
    */
    let vmharddisk;
    this.PS.addCommand('$vmharddisk = Get-HardDisk -VM (Get-VM @Name) | Select-Object -Property *', [{
      Name: vmName
    }]);
    await this.PS.invoke()
      .then({}).catch(err => {
        console.log(err);
      });
    this.PS.addCommand('$vmharddisk | ConvertTo-Json -Depth 1 -AsArray');
    await this.PS.invoke()
      .then(output => {
        vmharddisk = JSON.parse(output);
      }).catch(err => {
        console.log(err);
      });
    return vmharddisk;
  }

  async getVMHosts() {
    /*
    Get all hosts data from vCenter Server
    */
    let vmhosts;
    this.PS.addCommand('$vmhosts = Get-VMHost | Select-Object -Property *')
    await this.PS.invoke()
      .then(output => {}).catch(err => {
        console.log(err);
      });
    this.PS.addCommand('$vmhosts | ConvertTo-Json -Depth 1 -AsArray');
    await this.PS.invoke()
      .then(output => {
        vmhosts = JSON.parse(output);
      }).catch(err => {
        console.log(err);
      });
    return vmhosts;
  }

  async getDatastores() {
    /*
    Get all datastores data from vCenter Server
    */
    let datastores;
    this.PS.addCommand('$datastores = Get-Datastore | Select-Object -Property *')
    await this.PS.invoke()
      .then({}).catch(err => {
        console.log(err);
      });
    this.PS.addCommand('$datastores | ConvertTo-Json -Depth 1 -AsArray');
    await this.PS.invoke()
      .then(output => {
        datastores = JSON.parse(output);
      }).catch(err => {
        console.log(err);
      });
    return datastores;
  }

  async getDatacenters() {
    /*
    Get all datacenters data from vCenter Server
    */
    let datacenters;
    this.PS.addCommand('$datacenters = Get-Datacenter | Select-Object -Property *')
    await this.PS.invoke()
      .then({}).catch(err => {
        console.log(err);
      });
    this.PS.addCommand('$datacenters | ConvertTo-Json -Depth 1 -AsArray');
    await this.PS.invoke()
      .then(output => {
        datacenters = JSON.parse(output);
      }).catch(err => {
        console.log(err);
      });
    return datacenters;
  }

  async getVMStat(vmName) {
    /*
    Get VM Stat by VM name
    */
    let vmstat;
    this.PS.addCommand('Get-VM @Name | Get-Stat @IntervalMins | ConvertTo-Json -Depth 1 -AsArray', [{
        Name: vmName
      },
      {
        IntervalMins: (60 * 24)
      }
    ]);
    await this.PS.invoke()
      .then(output => {
        vmstat = JSON.parse(output);
      }).catch(err => {
        console.log(err);
      });
    return vmstat;
  }

  async removeVM(vmName) {
    /*
    Remove VM by VM name
    */
    let vmstat;
    this.PS.addCommand('Get-VM @Name | Remove-VM -DeletePermanently -Confirm:$false', [{
      Name: vmName
    }]);
    await this.PS.invoke()
      .then(output => {
        console.log(output);
      }).catch(err => {
        console.log(err);
      });
  }

  async newVM() {
    /*
    Create New VM
    */
    this.PS.addCommand('$vmhost = Get-VMHost', [{
      Name: "10.30.22.9"
    }])
    await this.PS.invoke()
      .then({}).catch(err => {
        console.log(err);
      });
    this.PS.addCommand('$datastore = Get-Datastore', [{
      Name: "datastore1"
    }])
    await this.PS.invoke()
      .then({}).catch(err => {
        console.log(err);
      });
    this.PS.addCommand('New-VM', [{
        Name: "TEST"
      }, {
        VMHost: '$vmhost'
      },
      {
        Datastore: '$datastore'
      },
      {
        NumCpu: 1
      },
      {
        MemoryMB: 256
      },{
        DiskGB: 16
      },
      {
        NetworkName: "VM Network"
      },
      'CD'
    ]);
    //this.PS.addCommand('New-VM -Name "Test New-VM" -VMHost (Get-VMHost -Name "10.30.22.9") -Datastore (Get-Datastore -Name "datastore1") -NumCpu 1 -MemoryMB 256 -DiskGB 16 -NetworkName "VM Network" -CD');
    await this.PS.invoke().then(output => {
      console.log(output);
    }).catch(err => {
      console.log(err);
    })
  }

  async powerOnVM(vmName) {
    /*
    Power On VM by VM name
    */
    this.PS.addCommand('Start-VM', [{
      VM: vmName
    }]);
    await this.PS.invoke()
      .then({}).catch(err => {
        console.log(err);
      });
  }

  async powerOffVM(vmName) {
    /*
    Power Off VM by VM name
    */
    this.PS.addCommand('Stop-VM', [{
        VM: vmName
      },
      'Confirm:$false'
    ]);
    await this.PS.invoke()
      .then({}).catch(err => {
        console.log(err);
      });
  }

  async disconnectVIServer() {
    /*
    Disconnect from vCenter Server and dispose PowerShell instance
    */
    this.PS.addCommand('Disconnect-VIServer', [{
        Server: this.server
      },
      'Confirm:$false'
    ]);
    await this.PS.invoke()
      .then(output => {
        console.log(output);
      }).catch(err => {
        console.log(err);
      });
  }

  async disposePS() {
    await this.PS.dispose();
  }
}

module.exports = Core;