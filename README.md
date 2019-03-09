# Private Cloud Management System

### What is Private Cloud Management System
PCMS is web application for private cloud automation in VMware vSphere environment.

### PCMS is builded by:
* [Vue CLI]
* [PowerShell Core] version 6
* [PowerCLI] version 11
* [Node.js] version 11
* [node-powershell] version 4
* Better used with [pm2]

### Deployment
* Install [PowerShell Core]
* Install [PowerCLI] by run PowerShell Core then install PowerCLI and config it
```sh
$ pwsh
$ Install-Module -Name VMware.PowerCLI
$ Set-PowerCLIConfiguration -InvalidCertificateAction Ignore -ParticipateInCeip $false
```
* Install [Node.js]
* Install [Vue CLI]
* Clone this git then
   * cd to server directory and ```$ npm install```
   * cd to vue-ui directory and ```$ npm install```

### Temporary Fix: Some modules is not currently supported on Core edition of PowerShell
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
Source: https://cloudhat.eu/powercli-10-0-0-linux-error-vmware-vimautomation-srm/

### Testing - REST API Server(Node.js)
Before run this command, needed to edit your vCenter details on app.js file.
```sh
$ node server/src/app.js
```
or run with pm2.
```sh
$ pm2 start app.js
$ pm2 monit
```

Some operations in app.js

| HTTP method | HTTP request | Description |
| ------ | ------ | ------ |
| GET | [localhost:8081/vms](http://localhost:8081/vms) | Return data of all virtual machines managed by vCenter |
| GET | [localhost:8081/vm/{vmname}](http://localhost:8081/vm/{vmname}) | Return data of virtual machine by that virtual machine name |
| GET | [localhost:8081/vmharddisk/{vmname}](http://localhost:8081/vmharddisk/{vmname}) | Return data of virtual machine harddisk by that virtual machine name |
| GET | [localhost:8081/vmhosts](http://localhost:8081/vmhosts) | Return data of all hosts managed by vCenter |
| GET | [localhost:8081/datastores](http://localhost:8081/datastores) | Return data of all datastores in vCenter |
| GET | [localhost:8081/datacenters](http://localhost:8081/datacenters) | Return data of all datacenters in vCenter |
| GET | [localhost:8081/vm/{vmname}/poweron](http://localhost:8081/vm/{vmname}/poweron) | Power on a virtual machine by that virtual machine name |
| GET | [localhost:8081/vm/{vmname}/poweroff](http://localhost:8081/vm/{vmname}/poweroff) | Power off a virtual machine by that virtual machine name |

### Testing - Vue
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
* Automatic create vm and install guest os when user request
* Automatic power-off vm when no usage for a time
* Automatic backup and delete vm when not use that vm anymore

### Node.js Module
| Module Name | Source |
| ------ | ------ |
| node-powershell | [node-powershell] |
| express | [express] |
| body-parser | [body-parser] |
| cors | [cors] |
| morgan | [morgan] |
| node-schedule | [node-schedule] |
| helmet | [helmet] |
| compressing | [compressing] |
| winston | [winston] |

### Vue.js Module
| Module Name | Source |
| ------ | ------ |
| axios | [axios] |
| vuejs-datepicker | [vuejs-datepicker] |
| vue-select | [vue-select] |

   [Vue.js]: <https://vuejs.org/>
   [Vue CLI]: <https://cli.vuejs.org/>
   [PowerShell Core]: <https://docs.microsoft.com/en-us/powershell/scripting/setup/installing-powershell?view=powershell-6>
   [PowerCLI]: <https://blogs.vmware.com/PowerCLI/2017/04/powercli-install-process-powershell-gallery.html>
   [node.js]: <http://nodejs.org>
   
   [node-powershell]: <https://github.com/rannn505/node-powershell>
   [node-schedule]: <https://github.com/node-schedule/node-schedule>
   [express]: <https://github.com/expressjs/express>
   [body-parser]: <https://github.com/expressjs/body-parser>
   [cors]: <https://github.com/expressjs/cors>
   [morgan]: <https://github.com/expressjs/morgan>
   [helmet]: <https://github.com/helmetjs/helmet>
   [compressing]: <https://github.com/node-modules/compressing>
   
   [axios]: <https://github.com/axios/axios>
   [vuejs-datepicker]: <https://github.com/charliekassel/vuejs-datepicker>
   [vue-select]: <https://github.com/sagalbot/vue-select>
   
   [winston]: <https://github.com/winstonjs/winston>
   [pm2]: <https://github.com/Unitech/pm2>