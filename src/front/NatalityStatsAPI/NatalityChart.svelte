<script>
  import { onMount } from "svelte";

  import { Table, Button, Nav, NavItem, NavLink } from "sveltestrap";

  const BASE_CONTACT_API_PATH = "/api/v2";

  let natalityData = [];
  let natalityChartData = [];

let natalityChartCountryDateData = [];
let natalityChartBornData = [];
let natalityChartMenBornData = [];
let natalityChartWomenBornData = [];
let natalityChartNatalityRateData = [];
let natalityChartFertilityRateData = [];


  var msg = "";

  async function loadChart() {
    console.log("Fetching data...");

    const res = await fetch(BASE_CONTACT_API_PATH + "/natality-stats");
    

    if (res.ok) {
      console.log("OK");
      natalityData = await res.json();
      natalityData.forEach(stat => {
      natalityChartCountryDateData.push(stat.country+"-"+stat.date);
      natalityChartBornData.push(stat.born);
      natalityChartMenBornData.push(stat["men-born"]);
      natalityChartWomenBornData.push(stat["women-born"]);
      natalityChartNatalityRateData.push(stat["natality-rate"]);
      natalityChartFertilityRateData.push(stat["fertility-rate"]); 
      msg="";
      });
    }else{
      console.log("Error");
      msg = "Por favor primero cargue los datos de la API";
    }
    
    console.log("Natality Chart DaTa: " + natalityChartData);

    Highcharts.chart("container", {
      title: {
        text: "natality-stats",
      },
      yAxis: {
        title: {
          text: "Valor",
        },
      },
      xAxis: {
        title: {
          text: "País-Año",
        },
        categories: natalityChartCountryDateData,
      },
      legend: {
        layout: "vertical",
        align: "right",
        verticalAlign: "middle",
      },
      annotations: [
        {
          labels: [
            {
              point: "date",
              text: "",
            },
            {
              point: "min",
              text: "Min",
              backgroundColor: "white",
            },
          ],
        },
      ],
      series: [
        {
          name: "Nacimientos",
          data: natalityChartBornData,
        },
        {
          name: "Hombres nacidos",
          data: natalityChartMenBornData,
        },
        {
          name: "Mujeres nacidas",
          data: natalityChartWomenBornData,
        },
        {
          name: "Ratio de natalidad (%)",
          data: natalityChartNatalityRateData,
        },
        {
          name: "Ratio de fertilidad (%)",
          data: natalityChartFertilityRateData,
        }
        
      ],
      responsive: {
        rules: [
          {
            condition: {
              maxWidth: 500,
            },
            chartOptions: {
              legend: {
                layout: "horizontal",
                align: "center",
                verticalAlign: "bottom",
              },
            },
          },
        ],
      },
    });
  }
</script>
<svelte:head>
  <script src="https://code.highcharts.com/highcharts.js"></script>
  <script src="https://code.highcharts.com/modules/series-label.js"></script>
  <script src="https://code.highcharts.com/modules/exporting.js"></script>
  <script src="https://code.highcharts.com/modules/export-data.js"></script>
  <script
    src="https://code.highcharts.com/modules/accessibility.js"
    on:load={loadChart}></script>
</svelte:head>
<main>
  <Nav>
    <NavItem>
      <NavLink href="/">Página Principal</NavLink>
    </NavItem>
    <NavItem>
      <NavLink href="#/natality-stats">Datos</NavLink>
    </NavItem>
  </Nav>

  <div>
    <h2>
      Análiticas
    </h2>
  </div>

  {#if msg}
    <p>{msg}</p>
  {:else}
    <figure class="highcharts-figure">
      <div id="container" />
      <p class="highcharts-description">
        Gráfico de líneas básico que muestra los diferentes valores para los campos de natality-stats.
      </p>
    </figure>
  {/if}
</main>

<style>
  main {
    text-align: center;
    padding: 1em;
    margin: 0 auto;
  }
  div{
    margin-bottom: 15px;
  }
  p {
    display: inline;
  }
  .msgRed {
    padding: 8px;

    background-color: #f8d7da;
  }
  .msgGreen {
    padding: 8px;

    background-color: #d4edda;
  }
  .highcharts-figure,
  .highcharts-data-table table {
    min-width: 360px;
    max-width: 800px;
    margin: 1em auto;
  }

  .highcharts-data-table table {
    font-family: Verdana, sans-serif;
    border-collapse: collapse;
    border: 1px solid #ebebeb;
    margin: 10px auto;
    text-align: center;
    width: 100%;
    max-width: 500px;
  }
  .highcharts-data-table caption {
    padding: 1em 0;
    font-size: 1.2em;
    color: #555;
  }
  .highcharts-data-table th {
    font-weight: 600;
    padding: 0.5em;
  }
  .highcharts-data-table td,
  .highcharts-data-table th,
  .highcharts-data-table caption {
    padding: 0.5em;
  }
  .highcharts-data-table thead tr,
  .highcharts-data-table tr:nth-child(even) {
    background: #f8f8f8;
  }
  .highcharts-data-table tr:hover {
    background: #f1f7ff;
  }
</style>
