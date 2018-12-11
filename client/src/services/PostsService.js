import Api from '@/services/Api'

export default {
  fetchVMs() {
    return Api().get('vms')
  },
  fetchVMHosts() {
    return Api().get('vmhosts')
  },
  fetchDatastores() {
    return Api().get('datastores')
  },
  fetchDatacenters() {
    return Api().get('datacenters')
  }
}
