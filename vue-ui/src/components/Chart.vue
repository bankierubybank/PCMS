<template>
  <div class="container">
    <h1>Chart</h1>
    <div class="chart">
      <GChart type="LineChart" :data="chartData" :options="chartOptions" :resizeDebounce="500"/>
    </div>
  </div>
</template>

<script>
import GetServices from "@/services/GetServices";
import { GChart } from "vue-google-charts";
export default {
  name: "chart",
  components: {
    GChart
  },
  data() {
    return {
      vms: [],
      chartData: [
        ["DateTime", "Percentage"],
        ["2019-01-23T15:00:00+07:00", 0.67],
        ["2019-01-23T17:00:00+07:00", 0.23],
        ["2019-01-23T19:00:00+07:00", 0.17],
        ["2019-01-23T21:00:00+07:00", 0.2],
        ["2019-01-23T23:00:00+07:00", 0.18],
        ["2019-01-24T01:00:00+07:00", 0.16],
        ["2019-01-24T03:00:00+07:00", 0.26],
        ["2019-01-24T05:00:00+07:00", 0.4],
        ["2019-01-24T07:00:00+07:00", 0.16],
        ["2019-01-24T09:00:00+07:00", 0.29]
      ],
      chartOptions: {
        chart: {
          title: "CPU Usage",
          subtitle: "CPU usage as a percentage during the interval"
        }
      }
    };
  },
  mounted() {
    //this.getVMStat("PCMS");
  },
  methods: {
    async getVMStat(vmName) {
      const response = await GetServices.fetchVMStat(vmName);
      this.vms = response.data;
    }
  }
};
</script>

/* datacollection: [
        {
          Value: 0.16,
          Timestamp: "2019-01-24T00:30:00+07:00",
          MetricId: "cpu.usage.average",
          Unit: "%",
          Description: "CPU usage as a percentage during the interval",
          Entity: "PCMS",
          EntityId: "VirtualMachine-vm-106",
          IntervalSecs: 1800,
          Instance: "",
          Uid:
            "/VIServer=labs.vsphere\\administrator@10.0.15.10:443/VirtualMachine=VirtualMachine-vm-106/FloatSample=cpu.usage.average\\\\636838866000000000/"
        },
        {
          Value: 0.2,
          Timestamp: "2019-01-24T00:00:00+07:00",
          MetricId: "cpu.usage.average",
          Unit: "%",
          Description: "CPU usage as a percentage during the interval",
          Entity: "PCMS",
          EntityId: "VirtualMachine-vm-106",
          IntervalSecs: 1800,
          Instance: "",
          Uid:
            "/VIServer=labs.vsphere\\administrator@10.0.15.10:443/VirtualMachine=VirtualMachine-vm-106/FloatSample=cpu.usage.average\\\\636838848000000000/"
        },
        {
          Value: 0.17,
          Timestamp: "2019-01-23T23:30:00+07:00",
          MetricId: "cpu.usage.average",
          Unit: "%",
          Description: "CPU usage as a percentage during the interval",
          Entity: "PCMS",
          EntityId: "VirtualMachine-vm-106",
          IntervalSecs: 1800,
          Instance: "",
          Uid:
            "/VIServer=labs.vsphere\\administrator@10.0.15.10:443/VirtualMachine=VirtualMachine-vm-106/FloatSample=cpu.usage.average\\\\636838830000000000/"
        }
      ], */
