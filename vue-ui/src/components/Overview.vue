<style scoped>

@import "https://fonts.googleapis.com/icon?family=Material+Icons";
	body{
		background: #539892;
		height: 100%;
		color: white;
	}
	.row, .col{
		padding: 0;
	}
	.collection{
		border: 0;
		border-radius: 0;
		margin-top: 7.5em;
	}
	.collection a.collection-item{
		color: #222222;
	}
	.collection .collection-item {
    background-color: #fff;
    line-height: 1.5rem;
    padding: 1em 1.5em;
    margin: 0;
    border: 0;
	}
	.collection a.collection-item:hover {
    background-color: #222222;
    color: #fff;
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
	#sidebar-menu{
		background: #ffffff;
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
		<div class="row">
			<div id="sidebar-menu" class="col s2 m2 l2">
				<div class="collection">
			        <a href="#!" class="collection-item active">Aj.Chotipas</a>
			        <a href="#!" class="collection-item">My VMs</a>
			        <a href="#!" class="collection-item">Request</a>
			      </div>

			</div>
			<div class="col s10 m10 l10">
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


<script>
import GetServices from "@/services/GetServices";
	export default {
	  name: "vms",
	  data() {
	    return {
				session: {},
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

</script>

