# Private Cloud Management System

### What is this
PCMS is web application for get/set data in VMware private cloud environment.

### Prerequisite
PCMS requires [Vue CLI] version 3, [PowerShell Core] version 6, [PowerCLI] version 11, [Node.js] version 11 and [node-powershell] to run.

### PowerCLI Installation and Configuration
Run PowerShell Core then install and config PowerCLI on PowerShell Core with this command
```sh
$ pwsh
$ Install-Module -Name VMware.PowerCLI
$ Import-Module VMware.PowerCLI
$ Set-PowerCLIConfiguration -InvalidCertificateAction Ignore -ParticipateInCeip $false
```

### Node.js Module
| Module Name | Installation |
| ------ | ------ |
| node-powershell | npm i --save node-powershell |
| express | npm i --save express |
| cors | npm i --save cors |
| morgan | npm i --save morgan |

### Vue.js Module
| Module Name | Installation |
| ------ | ------ |
| axios | npm i --save axios |

### Temporary Fix: Make node-powershell to use PowerShell Core (version 6)
Open Shell.js and edit this line
```javascript
_this._proc = spawn('powershell' + (IS_WIN ? '.exe' : ''), args, { stdio: 'pipe' });
```
to
```javascript
_this._proc = spawn('pwsh' + (IS_WIN ? '.exe' : ''), args, { stdio: 'pipe' });
```

### Temporary Fix: Some modules is not currently supported on Core edition of PowerShell
Follow this guide
https://cloudhat.eu/powercli-10-0-0-linux-error-vmware-vimautomation-srm/

Comment these modules (Add # in front of these modules)
```
#@{"ModuleName"="VMware.VimAutomation.Srm";"ModuleVersion"="10.0.0.7893900"}
#@{"ModuleName"="VMware.VimAutomation.License";"ModuleVersion"="10.0.0.7893904"}
#@{"ModuleName"="VMware.VimAutomation.vROps";"ModuleVersion"="10.0.0.7893921"}
#@{"ModuleName"="VMware.VimAutomation.HorizonView";"ModuleVersion"="7.6.0.10230451"}
#@{"ModuleName"="VMware.VimAutomation.Cloud";"ModuleVersion"="11.0.0.10379994"}
#@{"ModuleName"="VMware.DeployAutomation";"ModuleVersion"="6.7.0.8250345"}
#@{"ModuleName"="VMware.ImageBuilder";"ModuleVersion"="6.7.0.8250345"}
#@{"ModuleName"="VMware.VumAutomation";"ModuleVersion"="6.5.1.7862888"}
```

### Testing - Server
Before run this command, needed to edit your vCenter details on app.js file.
```sh
$ node server/src/app.js
```
Open Web Browser and go to
- [localhost:8081/vms](http://localhost:8081/vms) to see all virtual machines data.
- [localhost:8081/vmhosts](http://localhost:8081/vmhosts) to see all hosts data.
- [localhost:8081/datastores](http://localhost:8081/datastores) to see all datastores data.
- [localhost:8081/datacenters](http://localhost:8081/datacenters) to see all virtual machines data.

### Testing - Client
Needed to run server(server/src/app.js) before run this command.
```sh
$ cd vue-ui
$ npm run serve
```
Open Web Browser and go to
- [localhost:8080/vms](http://localhost:8080/vms) to see all virtual machines data.
- [localhost:8080/vmhosts](http://localhost:8080/vmhosts) to see all hosts data.
- [localhost:8080/datastores](http://localhost:8080/datastores) to see all datastores data.
- [localhost:8080/datacenters](http://localhost:8080/datacenters) to see all virtual machines data.

### Todos

### PCMS is builded by:
* [Vue CLI]
* [PowerShell Core] version 6
* [PowerCLI] version 11
* [Node.js] version 11
* [node-powershell] - use PowerShell on Node.js

   [Vue.js]: <https://vuejs.org/>
   [Vue CLI]: <https://cli.vuejs.org/>
   [PowerShell Core]: <https://docs.microsoft.com/en-us/powershell/scripting/setup/installing-powershell?view=powershell-6>
   [PowerCLI]: <https://blogs.vmware.com/PowerCLI/2017/04/powercli-install-process-powershell-gallery.html>
   [node.js]: <http://nodejs.org>
   [node-powershell]: <https://github.com/rannn505/node-powershell>
