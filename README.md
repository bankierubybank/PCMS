# Private Cloud Management System - Core

### What is this
PCMS is developing for get/set data in VMware private cloud environment.

### Prerequisite
PCMS requires [PowerShell Core] version 6, [PowerCLI] version 11, [Node.js] version 11 and [node-powershell] to run.

Run PowerShell with this command.
```sh
$ pwsh
```
Install PowerCLI on PowerShell with this command
```sh
$ Install-Module -Name VMware.PowerCLI
```

### Temporary Fix: If running on Windows that has Windows PowerShell (version 5) and PowerShell Core (version 6)
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

Comment these modules
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

### Testing
This command will connect to vCenter and pull all virtual machine data to console, needed to edit your vCenter details on core.js file before run this command.
```sh
$ node core.js
```

### Todos
 - Integration test with UI

### PCMS is builded by:
* [PowerShell Core] version 6
* [PowerCLI] version 11
* [Node.js] version 11
* [node-powershell] - use PowerShell on Node.js

   [PowerShell Core]: <https://docs.microsoft.com/en-us/powershell/scripting/setup/installing-powershell?view=powershell-6>
   [PowerCLI]: <https://blogs.vmware.com/PowerCLI/2017/04/powercli-install-process-powershell-gallery.html>
   [node.js]: <http://nodejs.org>
   [node-powershell]: <https://github.com/rannn505/node-powershell>
