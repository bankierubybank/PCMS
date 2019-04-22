# Private Cloud Management System

### What is Private Cloud Management System
PCMS is web application for private cloud automation in VMware vSphere environment.

### PCMS is builded by:
* [Vue CLI]
* [PowerShell Core] version 6
* [PowerCLI] version 11
* [Node.js] version 11
* [node-powershell] version 4
* [MongoDB]
* Better used with [pm2] for keep application alive forever

### Deployment
* Install [PowerShell Core]
* Install [PowerCLI] by run PowerShell Core then install PowerCLI and config it
```sh
$ pwsh
$ Set-ExecutionPolicy RemoteSigned
$ Install-Module -Name VMware.PowerCLI
$ Import-Module VMware.PowerCLI
$ Set-PowerCLIConfiguration -InvalidCertificateAction Ignore -ParticipateInCeip $false
```
* Install [MongoDB]
* Install [Node.js]
* Install [Vue CLI]
* Clone this git then
   * cd to server directory and ```$ npm install```
   * cd to vue-ui directory and ```$ npm install```
   * Use example.json to create your setting file, named it test.json and saved at /config/environments/

### Temporary Fix: Some modules is not currently supported on Core edition of PowerShell
Comment these modules (Add # in front of these modules) in VMware.PowerCLI.psd1

Located in C:\Program Files\PowerShell\Modules\VMware.PowerCLI\11.0.0.10380590 (Windows) or /usr/local/share/powershell/Modules/VMware.PowerCLI/11.0.0.10380590/ (Ubuntu)
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

### Testing - REST API Server (Node.js)
Before run this command, needed to edit your vCenter details on /config/environments/test.json file.
```sh
$ node app.js
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

### Testing - Web Application (Vue.js)
Needed to run REST API server (Node.js) before run this command.
```sh
$ cd vue-ui
$ npm run serve
```
Open Web Browser and go to
- [localhost](http://localhost)

### Node.js Module
| Module Name | Source | Description |
| ------ | ------ | ------ |
| node-powershell | [node-powershell] | Invoke PowerShell Commands on Node.js |
| express | [express] | Create REST Server |
| jsonwebtoken | [jsonwebtoken] | Maintain user's web token |
| body-parser | [body-parser] | Parse HTTP Request's Body |
| cors | [cors] | Enable CORS in Node.js |
| morgan | [morgan] | HTTP Request Logger |
| node-schedule | [node-schedule] | Schedule Jobs in Node.js |
| helmet | [helmet] | Middleware for more Security |
| compressing | [compressing] | Compress files into .zip |
| winston | [winston] | Log errors to Console and Files |
| mongoose | [mongoose] | MongoDB ODM for Node.js |
| compression | [compression] | Compress Response's Body |
| googleapis | [googleapis] | Upload backup files to Google Drive |
| ldapjs-client | [ldapjs-client] | Authentication with Active Directory |

### Vue.js Module
| Module Name | Source |
| ------ | ------ |
| axios | [axios] |
| vuejs-datepicker | [vuejs-datepicker] |
| bootstrap-vue | [bootstrap-vue] |
| vue2-frappe | [vue2-frappe] |


### JS Style Guide
Strict to Google JS Style Guide: https://google.github.io/styleguide/jsguide.html with [eslint].

   [Vue.js]: <https://vuejs.org/>
   [Vue CLI]: <https://cli.vuejs.org/>
   [PowerShell Core]: <https://docs.microsoft.com/en-us/powershell/scripting/setup/installing-powershell?view=powershell-6>
   [PowerCLI]: <https://blogs.vmware.com/PowerCLI/2017/04/powercli-install-process-powershell-gallery.html>
   [node.js]: <http://nodejs.org>
   [MongoDB]: <https://www.mongodb.com/download-center/community>
   
   [node-powershell]: <https://github.com/rannn505/node-powershell>
   [node-schedule]: <https://github.com/node-schedule/node-schedule>
   [express]: <https://github.com/expressjs/express>
   [body-parser]: <https://github.com/expressjs/body-parser>
   [cors]: <https://github.com/expressjs/cors>
   [morgan]: <https://github.com/expressjs/morgan>
   [helmet]: <https://github.com/helmetjs/helmet>
   [compressing]: <https://github.com/node-modules/compressing>
   [compression]: <https://github.com/expressjs/compression>
   [mongoose]: <https://github.com/Automattic/mongoose>
   [googleapis]: <https://github.com/googleapis/google-api-nodejs-client>
   [ldapjs-client]: <https://github.com/zont/ldapjs-client>
   [jsonwebtoken]: <https://github.com/auth0/node-jsonwebtoken>
   
   [axios]: <https://github.com/axios/axios>
   [vuejs-datepicker]: <https://github.com/charliekassel/vuejs-datepicker>
   [bootstrap-vue]: <https://github.com/bootstrap-vue/bootstrap-vue>
   [vue2-frappe]: <https://github.com/JustSteveKing/vue2-frappe>
   
   [winston]: <https://github.com/winstonjs/winston>
   [pm2]: <https://github.com/Unitech/pm2>
   [eslint]: <https://github.com/eslint/eslint>