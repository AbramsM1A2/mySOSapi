<script>
  import {
    Button
  } from "sveltestrap";
</script>

<main>
  <h1>natality-stats API</h1>

  <div>
    <h2>Para desarrolladores</h2>
  <a href="/#">
    <Button color="secondary">GitHub</Button>
  </a>
  <a href="/api/v2/natality-stats"
  ><Button color="primary">API v2</Button></a
>
<a href="https://documenter.getpostman.com/view/14932491/TzRa7jTe"
><Button color="info">Documentacion</Button></a
>
  
</div>
  <div>
    <h2>Para usuarios</h2>
  <a href="/#/natality-stats"
    ><Button color="primary">Interfaz</Button></a
  >
  <a href="/#/natality-stats/natalityCharts">
    <Button color="primary">Grafica</Button>
  </a>

</div>

<div>
  Hecho con <em class=love-color>&#9829;</em> por <a href=http://github.com/AbramsM1A2 target=_blank class=text-muted>Abraham Corta</a> 
</div>

</main>

<style>
  main {
    text-align: center;
    padding: 1em;
    max-width: 240px;
    margin: 0 auto;
  }
  h1 {
    color: #ff3e00;
    text-transform: uppercase;
    font-size: 4em;
    font-weight: 100;
  }
  div{
    margin-bottom: 15px;
  }
  @media (min-width: 640px) {
    main {
      max-width: none;
    }
  }
</style>
