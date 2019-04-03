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
      chartData: []
    };
  },
  mounted() {
    this.getVMStat();
  },
  methods: {
    async getVMStat() {
      const response = await GetServices.fetchVMStat({
        vmName: "PCMS-Server",
        intervalMins: 1440,
        stat: "mem.usage.average"
      });
      //this.chartData = response.data;
      this.chartData = [
    {
        "Timestamp": "2019-03-14T07:00:00+07:00",
        "Value": 22.36
    },
    {
        "Timestamp": "2019-03-15T07:00:00+07:00",
        "Value": 24.6
    },
    {
        "Timestamp": "2019-03-16T07:00:00+07:00",
        "Value": 28.25
    },
    {
        "Timestamp": "2019-03-17T07:00:00+07:00",
        "Value": 30.13
    },
    {
        "Timestamp": "2019-03-18T07:00:00+07:00",
        "Value": 32.7
    },
    {
        "Timestamp": "2019-03-19T07:00:00+07:00",
        "Value": 36.07
    },
    {
        "Timestamp": "2019-03-20T07:00:00+07:00",
        "Value": 38.53
    },
    {
        "Timestamp": "2019-03-21T07:00:00+07:00",
        "Value": 24.31
    },
    {
        "Timestamp": "2019-03-22T07:00:00+07:00",
        "Value": 26.3
    },
    {
        "Timestamp": "2019-03-23T07:00:00+07:00",
        "Value": 31.16
    },
    {
        "Timestamp": "2019-03-24T07:00:00+07:00",
        "Value": 34.14
    }
]
    }
  }
};
</script>
