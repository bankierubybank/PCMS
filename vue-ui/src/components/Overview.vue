<style scoped>

@import "https://fonts.googleapis.com/icon?family=Material+Icons";
	body{
		background: #539892;
		height: 100%;
		color: white;
	}
	nav{
	 background-color: #1b1b1b;
	}
	p{
		padding: 0px;
	}
	a{
		color: white;
	}

	#nav{
		padding: 0px !important;
	}
	#sidenav{
		position: absolute;
	    top: 10px;
	    width: 44px;
	    height: 44px;
	    z-index: 700;
	    background-color: #1b1b1b;
	    font-size: 28px;
	}
	.fa{
		margin-top: 15%;
	    text-align: center;
	    display: block;
	    text-rendering: auto;
	    -webkit-font-smoothing: antialiased;
	}.sidenav{
	    width: 20%;
	}
	#firstname{
		padding-left: 1em;
	}
	#icon-size{
		font-size: 32px;
	}
</style>

<template>
	<div class="bg-main">
		<header>
		<nav>
		  <div class="nav-wrapper">
		    <ul class="right hide-on-med-and-down">
		      <li><i id="icon-size" class="large material-icons">notifications_none</i></li>
		      <li><span id="firstname">IT Support</span></li>
		      <!-- Dropdown Trigger -->
		      <li><a class="dropdown-trigger" href="#!" data-target="dropdown1"><i id="icon-size" class="large material-icons">account_circle</i></a></li>
		    </ul>
		  </div>
		</nav>
		</header>

		<div class="row">
			<div class="col s12 m4 l3">
				<!-- Grey navigation panel -->
				<ul id="slide-out" class="sidenav">
					<li><div class="user-view">
						<div class="background">
						</div>
						<a href="#name"><span class="black-text name">IT Support</span></a>
					</div></li>
					<li><a class="waves-effect" href="overview.html">Overview</a></li>
					<li><a class="waves-effect" href="requestApproval.html">Request Approval</a></li>
					<li><a class="waves-effect" href="vms.html">Virtual Machines</a></li>
				</ul>
				<a href="#sidr" id="sidenav" data-target="slide-out" class="sidenav-trigger"><i class="fa small material-icons">menu</i></a>

			</div>
		</div>

		<div class="row">
			<div class="col s12 m8 l12">
				<!-- Teal page content  -->
				<div class="container">
					<h1>Virtual Machines</h1>
					<div class="row">
						<div class="col s12 m12">
							<table class="highlight">
							<thead>
								<tr>
									<th>VM Name</th>
									<th>Power State</th>
									<th>Specs</th>
									<th>Duration</th>
									<th>View</th>
								</tr>
							</thead>
								<tbody v-for="(vm, id) in vms" :key="id">
									<tr>
										<td><p><span>{{ vm.Name }}</span></p></td>
										<td><p><span v-if="vm.PowerState">PowerState: On</span>
                  							<span v-else>PowerState: Off</span></p>
                  						</td>
										<td>
											<p>
												<span>Guest: {{ vm.Guest }}</span>
											</p>
							                <p>
							                  <span>Cpu: {{ vm.NumCpu }} Core</span>
							                </p>
							                <p>
							                  <span>Memory: {{ vm.MemoryGB }} GB</span>
							                </p>
							                <p>
							                  <span>Storage: {{ vm.UsedSpaceGB }} GB</span>
							                </p>
										</td>
										<td>01/01/2562 - 01/01/2563</td>							
										<td>
											<!-- Modal Trigger -->
											<a class="waves-effect waves-light btn modal-trigger" href="#modal1">View</a>
										</td>
									</tr>
								</tbody>
							
							</table>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script src="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.3/jquery"></script>
<script>
import GetServices from "@/services/GetServices";
	export default {
	  name: "vms",
	  data() {
	    return {
	      vms: []
	    };
	  },
	  mounted() {
	    this.getVMs();
	  },
	  methods: {
	    async getVMs() {
	      const response = await GetServices.fetchVMs();
	      this.vms = response.data;
	    }
	  }
	};

  $(document).ready(function(){
    $('.sidenav').sidenav();
  });
</script>

