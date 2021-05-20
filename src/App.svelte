<script lang="ts">
	import Router from 'svelte-spa-router'
	
	import NotFound from "./Pages/NotFound.svelte";
	import Home from "./Pages/Home.svelte";
	import NatalityAPI from "./front/NatalityStatsAPI/NatalityAPI.svelte";
	import EditNatalityAPI from "./front/NatalityStatsAPI/EditStat.svelte";
	import NatalityCharts from "./front/NatalityStatsAPI/NatalityChart.svelte";


	const routes = {
		"/":Home,
		"/natality-stats": NatalityAPI,
		"/natality-stats/:country/:date":EditNatalityAPI,
		"/natality-stats/natalityCharts":NatalityCharts,
		'*': NotFound};
</script>

<main>
	<Router {routes} />
</main>

<style>

</style>