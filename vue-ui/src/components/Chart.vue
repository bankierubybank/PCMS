<template>
  <div class="container">
    <h1>Chart</h1>
    <div class="chart">
      <line-chart
        id="line"
        :data="chartData"
        xkey="Timestamp"
        ykeys='["Value"]'
        labels='["T1"]'
        line-color='["#FF6384"]'
        grid="true"
        grid-text-weight="bold"
        resize="true"
      ></line-chart>
    </div>
  </div>
</template>

<script>
import GetServices from "@/services/GetServices";
import Raphael from "raphael/raphael";
global.Raphael = Raphael;
import { LineChart } from "vue-morris";
export default {
  name: "chart",
  components: {
    LineChart
  },
  data() {
    return {
      chartData: [
        { Timestamp: "2019-01-23T15:00:00+07:00", Value: 0.67 },
        { Timestamp: "2019-01-23T17:00:00+07:00", Value: 0.23 },
        { Timestamp: "2019-01-23T19:00:00+07:00", Value: 0.17 },
        { Timestamp: "2019-01-23T21:00:00+07:00", Value: 0.2 },
        { Timestamp: "2019-01-23T23:00:00+07:00", Value: 0.18 },
        { Timestamp: "2019-01-24T01:00:00+07:00", Value: 0.16 },
        { Timestamp: "2019-01-24T03:00:00+07:00", Value: 0.26 },
        { Timestamp: "2019-01-24T05:00:00+07:00", Value: 0.4 },
        { Timestamp: "2019-01-24T07:00:00+07:00", Value: 0.16 },
        { Timestamp: "2019-01-24T09:00:00+07:00", Value: 0.29 },
        { Timestamp: "2019-01-24T11:00:00+07:00", Value: 0.68 },
        { Timestamp: "2019-01-24T13:00:00+07:00", Value: 0.24 },
        { Timestamp: "2019-01-24T15:00:00+07:00", Value: 0.24 },
        { Timestamp: "2019-01-24T17:00:00+07:00", Value: 0.25 },
        { Timestamp: "2019-01-24T19:00:00+07:00", Value: 0.25 },
        { Timestamp: "2019-01-24T21:00:00+07:00", Value: 0.24 },
        { Timestamp: "2019-01-24T23:00:00+07:00", Value: 0.25 },
        { Timestamp: "2019-01-25T01:00:00+07:00", Value: 0.25 },
        { Timestamp: "2019-01-25T03:00:00+07:00", Value: 0.24 },
        { Timestamp: "2019-01-25T05:00:00+07:00", Value: 0.35 },
        { Timestamp: "2019-01-25T07:00:00+07:00", Value: 0.24 }
      ]
    };
  },
  mounted() {
    //this.getVMStat("PCMS");
  },
  methods: {
    async getVMStat(vmName) {
      const response = await GetServices.fetchVMStat(vmName);
      this.chartData = response.data;
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