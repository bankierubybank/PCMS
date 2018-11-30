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
