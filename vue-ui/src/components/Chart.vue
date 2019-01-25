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
    this.getVMStat("PCMS");
  },
  methods: {
    async getVMStat(vmName) {
      const response = await GetServices.fetchVMStat(vmName);
      this.chartData = response.data;
    }
  }
};
</script>
