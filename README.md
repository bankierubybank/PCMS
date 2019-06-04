# Private Cloud Management System

### What is Private Cloud Management System
PCMS is web application for private cloud automation in VMware vSphere environment.

### PCMS is builded by:
* [Vue.js]
* [PowerShell Core] version 6.1.1
* [PowerCLI] version 11.0.0.10380590
* [Node.js] version 11.9.9
* [node-powershell] version 4.0.0
* [MongoDB] version 4.0.5
* Better used with [pm2] for keep application alive forever

### Deployment
* Install [PowerShell Core]
* Install [PowerCLI] by run PowerShell Core then install PowerCLI and config it
```sh
$ pwsh
$ Set-ExecutionPolicy RemoteSigned
$ Install-Module -Name VMware.PowerCLI
$ Import-Module VMware.PowerCLI
$ Set-PowerCLIConfiguration -InvalidCertificateAction Ignore -ParticipateInCeip $false -DisplayDeprecationWarnings:$false
```
* Install [MongoDB]
* Install [Node.js]
* Install [Vue CLI]
* Clone this git then
   * cd to server directory and ```$ npm install```
   * cd to vue-ui directory and ```$ npm install```
   * Edit config file at /config/environments/config.json

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
```sh
$ node app.js
```
or run with pm2.
```sh
$ pm2 start app.js
$ pm2 monit
```

### Testing - Web Application (Vue.js)
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
| nodemailer | [nodemailer] | Send E-Mail |


### Vue.js Module
| Module Name | Source | Description |
| ------ | ------ | ------ |
| axios | [axios] | Consume API |
| vuejs-datepicker | [vuejs-datepicker] | Date Picker |
| bootstrap-vue | [bootstrap-vue] | Front-End Framework |
| vue-apexcharts | [vue-apexcharts] | Chart |
| moment | [moment] | Date Formatter |
| vue-swal | [vue-swal] | More Beautiful Alert |


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
   [nodemailer]: <https://github.com/nodemailer/nodemailer>
   
   [axios]: <https://github.com/axios/axios>
   [vuejs-datepicker]: <https://github.com/charliekassel/vuejs-datepicker>
   [bootstrap-vue]: <https://github.com/bootstrap-vue/bootstrap-vue>
   [vue-apexcharts]: <https://github.com/apexcharts/vue-apexcharts>
   [moment]: <https://github.com/moment/moment>
   [vue-swal]: <https://github.com/anteriovieira/vue-swal>
   
   [winston]: <https://github.com/winstonjs/winston>
   [pm2]: <https://github.com/Unitech/pm2>
   [eslint]: <https://github.com/eslint/eslint>