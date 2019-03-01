class Core {
  /**
   * Create core object for using PowerShell
   * @param {String} server A string of server name or ip address. (Ex. labs.vsphere or 10.0.15.10)
   * @param {String} username A string of vCenter user account.
   * @param {String} password A string of password.
   */
  constructor(server, username, password) {
    this.server = server;
    this.username = username;
    this.password = password;
  }

  /**
   * Create PowerShell instance.
   */
  async createPS() {
    let nodePowershell = require('node-powershell');
    this.PS = new nodePowershell({
      verbose: true,
      pwsh: true,
      inputEncoding: 'utf8',
      outputEncoding: 'utf8',
      executionPolicy: 'RemoteSigned',
      noProfile: true
    });
  }

  /**
   * Import PowerCLI module to PowerShell, then set PowerCLI configuration
   */
  async importPowerCLI() {
    this.PS.addCommand('$isPowerCLIImported = Get-Module VMware.PowerCLI; if ($isPowerCLIImported) {} else {Import-Module VMware.PowerCLI; Set-PowerCLIConfiguration -Scope User -ParticipateInCeip $true -DisplayDeprecationWarnings $false -Confirm:$false}')
    await this.PS.invoke()
      .then({}).catch(err => console.log(err));
  }

  /**
   * Connect to vCenter server.
   */
  async connectVIServer() {
    this.PS.addCommand('Connect-VIServer')
      .then(this.PS.addParameters([{
        Server: this.server
      }, {
        User: this.username
      }, {
        Pass: this.password
      }]));
    await this.PS.invoke()
      .then({}).catch(err => console.log(err));
  }

  /**
   * Get data of all virtual machines from vCenter server.
   * @returns {JSON} Data of all virtual machines.
   */
  async getVMs() {
    let vms;
    this.PS.addCommand('Get-VM | Select-Object -Property * , @{N="IP Address";E={@($_.guest.IPAddress -join "|")}} | ConvertTo-Json -Depth 1 -AsArray');
    await this.PS.invoke()
      .then(output => {
        vms = JSON.parse(output);
      }).catch(err => console.log(err));
    return vms;
  }

  /**
   * Get a virtual machine data.
   * @param {String} vmName A string of virtual machine's name.
   * @returns {JSON} Data of a virtual machine.
   */
  async getVMbyName(vmName) {
    let vm;
    this.PS.addCommand('Get-VM')
      .then(this.PS.addParameters([{
        Name: vmName
      }]))
      .then(this.PS.addArgument('| Select-Object -Property * , @{N="IP Address";E={@($_.guest.IPAddress -join "|")}} | ConvertTo-Json -Depth 1 -AsArray'));
    await this.PS.invoke()
      .then(output => {
        vm = JSON.parse(output);
      }).catch(err => console.log(err));
    return vm;
  }

  /**
   * Get data of all virtual machines from single ESXi Host.
   * @param {String} VMHostName A string of ESXi hostname.
   */
  async getVMsbyHostName(VMHostName) {
    let vms;
    this.PS.addCommand('Get-VM | where VMHost')
      .then(this.PS.addParameters([{
        Match: VMHostName
      }]))
      .then(this.PS.addArgument('| Select-Object -Property * , @{N="IP Address";E={@($_.guest.IPAddress -join "|")}} | ConvertTo-Json -Depth 1 -AsArray'));
    await this.PS.invoke()
      .then(output => {
        vms = JSON.parse(output);
      }).catch(err => console.log(err));
    return vms;
  }

  /**
   * Get total memory allocated in single ESXi host in GB.
   * @param {String} VMHostName A string of ESXi hostname.
   */
  async getTotalMemoryGBAllocatedbyHost(VMHostName) {
    let totalMemoryGBAllocated;
    this.PS.addCommand('$totalMemoryGBAllocated = 0; $vms = Get-VM | where VMHost')
      .then(this.PS.addParameters([{
        Match: VMHostName
      }]));
    await this.PS.invoke()
      .then({}).catch(err => console.log(err));
    this.PS.addCommand('foreach ($vm in $vms) { $totalMemoryGBAllocated += $vm.MemoryGB }; Write-Host $totalMemoryGBAllocated');
    await this.PS.invoke()
      .then(output => {
        totalMemoryGBAllocated = output;
      }).catch(err => console.log(err));
    return totalMemoryGBAllocated;
  }

  /**
   * Get virtual machine harddisk data.
   * @param {String} vmName A string of virtual machine's name.
   */
  async getVMHarddiskbyName(vmName) {
    let vmharddisk;
    this.PS.addCommand('Get-VM', [{
        Name: vmName
      }])
      .then(this.PS.addParameters([{
        Name: vmName
      }]))
      .then(this.PS.addArgument('| Get-HardDisk | Select-Object -Property * | ConvertTo-Json -Depth 1 -AsArray'));
    await this.PS.invoke()
      .then(output => {
        vmharddisk = JSON.parse(output);
      }).catch(err => console.log(err));
    return vmharddisk;
  }

  /**
   * Get data of all host from vCenter server.
   */
  async getVMHosts() {
    let vmhosts;
    this.PS.addCommand('Get-VMHost | Select-Object -Property * | ConvertTo-Json -Depth 1 -AsArray');
    await this.PS.invoke()
      .then(output => {
        vmhosts = JSON.parse(output);
      }).catch(err => console.log(err));
    return vmhosts;
  }

  /**
   * Get ESXi host data.
   * @param {String} VMHostName A string of ESXi hostname.
   */
  async getVMHostbyName(VMHostName) {
    let vmhost;
    this.PS.addCommand('Get-VMHost')
      .then(this.PS.addParameters([{
        Name: VMHostName
      }]))
      .then(this.PS.addArgument('| Select-Object -Property * | ConvertTo-Json -Depth 1 -AsArray'));
    await this.PS.invoke()
      .then(output => {
        vmhost = JSON.parse(output);
      }).catch(err => console.log(err));
    return vmhost;
  }

  /**
   * Get data of all datastores from vCenter server.
   */
  async getDatastores() {
    let datastores;
    this.PS.addCommand('Get-Datastore | Select-Object -Property * | ConvertTo-Json -Depth 1 -AsArray');
    await this.PS.invoke()
      .then(output => {
        datastores = JSON.parse(output);
      }).catch(err => console.log(err));
    return datastores;
  }

  /**
   * Get data of all datacenters from vCenter server.
   */
  async getDatacenters() {
    let datacenters;
    this.PS.addCommand('Get-Datacenter | Select-Object -Property * | ConvertTo-Json -Depth 1 -AsArray');
    await this.PS.invoke()
      .then(output => {
        datacenters = JSON.parse(output);
      }).catch(err => console.log(err));
    return datacenters;
  }

  /**
   * Get virtual machine's stat.
   * @param {String} vmName A string of virtual machine's name.
   * @param {int} intervalmins Interval minutes.
   * @param {String} stat A string of wanted stat. (Ex. cpu.usage.average)
   */
  async getVMStat(vmName, intervalmins, stat) {
    let vmstat;
    this.PS.addCommand('Get-VM')
      .then(this.PS.addParameters([{
        Name: vmName
      }]))
      .then(this.PS.addArgument('| Get-Stat'))
      .then(this.PS.addParameters([{
        IntervalMins: intervalmins
      }, {
        Stat: stat
      }]))
      .then(this.PS.addArgument('| Select-Object -Property Timestamp, Value | Sort-Object -Property Timestamp | ConvertTo-Json -Depth 1 -AsArray'));
    await this.PS.invoke()
      .then(output => {
        vmstat = JSON.parse(output);
      }).catch(err => console.log(err));
    return vmstat;
  }

  /**
   * Remove a virtual machine permanently.
   * @param {String} vmName A string of virtual machine's name.
   */
  async removeVM(vmName) {
    this.PS.addCommand('Get-VM')
      .then(this.PS.addParameters({
        Name: vmName
      }))
      .then(this.PS.addArgument('| Remove-VM -DeletePermanently -Confirm:$false'));
    await this.PS.invoke()
      .then({}).catch(err => console.log(err));
  }

  /**
   * Create a virtual machine.
   * @param {JSON} spec A JSON object contains virtual machine's spec.
   */
  async newVM(spec) {
    this.PS.addCommand('$vmhost = Get-VMHost')
      .then(this.PS.addParameters([{
        Name: "10.30.22.9"
      }]));
    await this.PS.invoke()
      .then({}).catch(err => console.log(err));

    this.PS.addCommand('$datastore = Get-Datastore')
      .then(this.PS.addParameters([{
        Name: "datastore1"
      }]));
    await this.PS.invoke()
      .then({}).catch(err => console.log(err));

    this.PS.addCommand('New-VM CD')
      .then(this.PS.addParameters([{
          Name: spec.Name
        },
        {
          VMHost: '$vmhost'
        },
        {
          Datastore: '$datastore'
        },
        {
          NumCpu: spec.NumCpu
        },
        {
          MemoryMB: spec.MemoryMB
        },
        {
          DiskGB: spec.DiskGB
        },
        {
          NetworkName: spec.NetworkName
        }
      ]));
    await this.PS.invoke()
      .then({}).catch(err => console.log(err));
  }

  /**
   * Create a virtual machine from existing template,
   * then configure virtual machine's spec
   * @param {JSON} spec A JSON object contains virtual machine's spec.
   */
  async newVMfromTemplate(spec) {
    this.PS.addCommand('$vmhost = Get-VMHost')
      .then(this.PS.addParameters([{
        Name: "10.30.22.9"
      }]));
    await this.PS.invoke()
      .then({}).catch(err => console.log(err));

    this.PS.addCommand('$datastore = Get-Datastore')
      .then(this.PS.addParameters([{
        Name: "datastore1"
      }]));
    await this.PS.invoke()
      .then({}).catch(err => console.log(err));

    this.PS.addCommand('$template = Get-Template')
      .then(this.PS.addParameters([{
        Name: "UbuntuTemplate"
      }]));
    await this.PS.invoke()
      .then({}).catch(err => console.log(err));

    this.PS.addCommand('New-VM')
      .then(this.PS.addParameters([{
          Name: spec.Name
        },
        {
          ResourcePool: '$vmhost'
        },
        {
          Datastore: '$datastore'
        },
        {
          Template: '$template'
        }
      ]));
    await this.PS.invoke()
      .then({}).catch(err => console.log(err));

    this.PS.addCommand('Get-VM')
      .then(this.PS.addParameters([{
        Name: spec.Name
      }]))
      .then(this.PS.addArgument('| Set-VM -Confirm:$false'))
      .then(this.PS.addParameters([{
          NumCpu: spec.NumCpu
        },
        {
          MemoryMB: spec.MemoryMB
        }
      ]));
    await this.PS.invoke()
      .then({}).catch(err => console.log(err));

    this.PS.addCommand('$vmhdd = Get-VM')
      .then(this.PS.addParameters([{
        Name: spec.Name
      }]))
      .then(this.PS.addArgument('| Get-HardDisk'));
    await this.PS.invoke()
      .then({}).catch(err => console.log(err));

    this.PS.addCommand('Set-HardDisk -Confirm:$false')
      .then(this.PS.addParameters([{
          HardDisk: '$vmhdd'
        },
        {
          CapacityGB: spec.DiskGB
        }
      ]));
    await this.PS.invoke()
      .then({}).catch(err => console.log(err));

    await this.powerOnVM(spec.Name);

    this.PS.addCommand('Get-VM')
      .then(this.PS.addParameters([{
        Name: spec.Name
      }]))
      .then(this.PS.addArgument('| Invoke-VMScript'))
      .then(this.PS.addParameters([{
          ScriptType: 'Bash'
        },
        {
          ScriptText: 'sudo growpart /dev/sda 1'
        },
        {
          GuestUser: 'ubuntu'
        },
        {
          GuestPassword: 'P@ssw0rd'
        },
        {
          ToolsWaitSecs: 120
        }
      ]));
    await this.PS.invoke()
      .then({}).catch(err => console.log(err));

    this.PS.addCommand('Get-VM')
      .then(this.PS.addParameters([{
        Name: spec.Name
      }]))
      .then(this.PS.addArgument('| Invoke-VMScript'))
      .then(this.PS.addParameters([{
          ScriptType: 'Bash'
        },
        {
          ScriptText: 'sudo resize2fs /dev/sda1'
        },
        {
          GuestUser: 'ubuntu'
        },
        {
          GuestPassword: 'P@ssw0rd'
        },
        {
          ToolsWaitSecs: 120
        }
      ]));
    await this.PS.invoke()
      .then({}).catch(err => console.log(err));
  }

  /**
   * Power on a  virtual machine.
   * @param {String} vmName A string of virtual machine's name.
   */
  async powerOnVM(vmName) {
    this.PS.addCommand('Start-VM')
      .then(this.PS.addParameters([{
        VM: vmName
      }]));
    await this.PS.invoke()
      .then({}).catch(err => console.log(err));
  }

  /**
   * Power off a virtual machine.
   * @param {String} vmName A string of virtual machine's name.
   */
  async powerOffVM(vmName) {
    this.PS.addCommand('Stop-VM -Confirm:$false')
      .then(this.PS.addParameters([{
        VM: vmName
      }]));
    await this.PS.invoke()
      .then({}).catch(err => console.log(err));
  }

  /**
   * Download vmx, vmdk, vmsd, vmxf and nvram files of a virtual machine,
   * then compress these files as .zip format.
   * @param {String} vmName A string of virtual machine's name.
   */
  async backUpVM(vmName) {
    this.PS.addCommand('$VMView = Get-VM')
      .then(this.PS.addParameters([{
        Name: vmName
      }]))
      .then(this.PS.addArgument('| Get-View'));
    await this.PS.invoke()
      .then({}).catch(err => console.log(err));

    this.PS.addCommand('$ds = Get-Datastore $VMview.Config.Files.VmPathName.Split(" ")[0].TrimStart("[").TrimEnd("]")');
    await this.PS.invoke()
      .then({}).catch(err => console.log(err));

    this.PS.addCommand('New-PSDrive')
      .then(this.PS.addParameters([{
        Name: 'vcds'
      }, {
        Location: '$ds'
      }, {
        PSProvider: 'VimDatastore'
      }, {
        Root: '/'
      }]));
    await this.PS.invoke()
      .then({}).catch(err => console.log(err));

    const path = require('path');
    let dir = path.join(process.cwd(), 'vmbackup', vmName);
    this.PS.addCommand('New-Item -ItemType "directory"')
      .then(this.PS.addParameters([{
        Path: dir
      }]));
    await this.PS.invoke()
      .then().catch(err => console.log(err));

    this.PS.addCommand('foreach ($file in $VMView.LayoutEx.File) { $filename = $file.Name.split("]")[1].TrimStart(" "); Copy-DatastoreItem -Item vcds:\$filename')
      .then(this.PS.addParameters([{
        Destination: dir
      }]))
      .then(this.PS.addArgument('}'));
    await this.PS.invoke()
      .then({}).catch(err => console.log(err));

    const compressing = require('compressing');
    await compressing.zip.compressDir(dir, path.join(process.cwd(), vmName + '.zip'))
      .then(console.log("CREATED FILE! COMPRESSING IS IN PROGRESS!")).catch(err => console.log(err));
  }

  /**
   * Temporary for testing compressing module.
   * @param {String} vmName A string of virtual machine's name.
   */
  async testCompress(vmName) {
    const path = require('path');
    let dir = path.join(process.cwd(), 'vmbackup', vmName);
    const compressing = require('compressing');
    await compressing.zip.compressDir(dir, path.join(process.cwd(), vmName + '.zip'))
      .then(console.log("CREATED FILE! COMPRESSING IS IN PROGRESS")).catch(err => console.log(err));
  }

  /**
   * Disconnect from current connected vCenter server.
   */
  async disconnectVIServer() {
    this.PS.addCommand('Disconnect-VIServer -Confirm:$false')
      .then(this.PS.addParameters([{
        Server: this.server
      }]));
    await this.PS.invoke()
      .then(output => {
        console.log(output);
      }).catch(err => console.log(err));
  }

  /**
   * Dispose PowerShell instance
   */
  async disposePS() {
    await this.PS.dispose();
  }
}

module.exports = Core;