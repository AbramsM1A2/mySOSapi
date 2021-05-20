<script>
  import {
    Nav,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    NavItem,
    NavLink,
    Button,
    Table,
    Pagination,
    PaginationItem,
    PaginationLink,
  } from "sveltestrap";
  import { onMount } from "svelte";
  import { querystring } from "svelte-spa-router";

  //------------------Nav-----------------------

  //Load stats
  let open1 = false;
  const toggle1 = () => (open1 = !open1);
  const toggle1P = () => {
    open1 = !open1;
    loadStats();
  };
  //Delete all stats
  let open2 = false;
  const toggle2 = () => (open2 = !open2);
  const toggle2P = () => {
    open2 = !open2;
    deleteAllStats();
  };

  //------------------API-------------------
  const BASE_CONTACT_API_PATH = "/api/v2";

  //GetStats local db
  let natalityStats = [];

  //Local inputs
  var insertStatInput = {
    country: "",
    date: "",
    born: "",
    "men-born": "",
    "women-born": "",
    "natality-rate": "",
    "fertility-rate": "",
  };
  var queryStatInput = {
    country: "",
    date: "",
    born: "",
    "men-born": "",
    "women-born": "",
    "natality-rate": "",
    "fertility-rate": "",
  };

  //flags
  let isASearch = false;

  //Alertas GUI
  let errorMsg = "";
  let okMsg = "";
  let warningMsg = "";

  //Pagination GUI
  let current_offset = 0;
  let limit = 10;

  let current_page = 1;
  let last_page = 1;
  let total = 0;

  //------------------------------------------- Funciones de ayuda -------------------------------------------

  //-------Paginacion-------

  /**
   * Calcula la posicion de la pagina actual
   * @param size
   * @param startAt
   */
  function range(size, startAt = 0) {
    return [...Array(size).keys()].map((i) => i + startAt);
  }

  /**
   * Control del cambio de pagina
   * @param page
   * @param offset
   * @param search
   */
  function changePage(page, offset, search) {
    console.log("------Change page------");
    console.log(
      "Params page: " + page + " offset: " + offset + " search: " + search
    );
    last_page = Math.ceil(total / 10);
    console.log("new last page: " + last_page);
    if (page !== current_page) {
      console.log("enter if");
      current_offset = offset;
      current_page = page;
      console.log("page: " + page);
      console.log("current_offset: " + current_offset);
      console.log("current_page: " + current_page);
      if (search == false) {
        console.log(" search: false?" + search);
        getStats();
      } else {
        console.log(" search: true?" + search);
        searchStat();
      }
    }
    console.log("---------Exit change page-------");
  }

  /**
   * Total de elementos de una consulta
   */
  async function getNumTotal(fullQuery = "") {
    console.log("Fetching total entries");
    const res = await fetch(
      BASE_CONTACT_API_PATH + "/natality-stats" + fullQuery
    );
    if (res.ok) {
      const json = await res.json();
      total = json.length;

      changePage(current_page, current_offset, isASearch);
      console.log("getTotal: " + total);
    } else {
      total = 0;
      changePage(1, 0, false);
      console.log("ERROR!");
    }
  }

  //-------Inputs-------

  /**
   * Reiniciar los inputs
   * @param flag
   */
  function resetInputs(flag) {
    console.log("Reseting inputs of: " + flag);
    switch (flag) {
      case "search":
        console.log("reseting search");
        queryStatInput = {
          country: "",
          date: "",
          born: "",
          "men-born": "",
          "women-born": "",
          "natality-rate": "",
          "fertility-rate": "",
        };
        current_page = 1;
        current_offset = 0;
        getStats();
        break;
      case "insert":
        console.log("reseting insert");
        insertStatInput = {
          country: "",
          date: "",
          born: "",
          "men-born": "",
          "women-born": "",
          "natality-rate": "",
          "fertility-rate": "",
        };
        break;
    }
  }

  //-------GUI dinamica-------
  function getInputNameSpanish(inputName) {
    switch (inputName) {
      case "country":
        return "País";
      case "date":
        return "Año";
      case "born":
        return "Nacimientos";
      case "men-born":
        return "Hombres nacidos";
      case "women-born":
        return "Mujeres nacidas";
      case "natality-rate":
        return "Tasa de natalidad";
      case "fertility-rate":
        return "Índice de fecundación";
    }
  }

  //------------------------------------------- Funciones API -------------------------------------------

  /**
   * LoadInitialData
   */
  async function loadStats() {
    console.log("Loading data...");
    const res = await fetch(
      BASE_CONTACT_API_PATH + "/natality-stats/loadInitialData"
    ).then(function (res) {
      if (res.ok) {
        getStats();

        errorMsg = "";
        okMsg = "Datos cargados correctamente";
        console.log("OK");
      } else {
        if (res.status === 409) {
          errorMsg = "Alguno de los datos ya se encuentra cargado";
        } else if (res.status === 500) {
          errorMsg = "No se ha podido acceder a la base de datos";
        }
        okMsg = "";
        console.log("ERROR!" + errorMsg);
      }
    });
  }

  /**
   * Get Stats
   */
  async function getStats() {
    console.log("Fetching data...");

    const res = await fetch(
      BASE_CONTACT_API_PATH +
        "/natality-stats?limit=" +
        limit +
        "&offset=" +
        current_offset
    );

    if (res.ok) {
      const json = await res.json();
      natalityStats = json;

      console.log(`We have received ${natalityStats.length} stats.`);

      isASearch = false;

      //errorMsg = "";
      warningMsg = "";

      getNumTotal();

      console.log("Ok");
    } else {
      if (natalityStats.length == 0) {
        warningMsg = "No hay datos disponibles";
      }
      if (res.status === 500) {
        errorMsg = "No se ha podido acceder a la base de datos";
      }
      okMsg = "";
      console.log("ERROR!" + errorMsg);
    }
  }

  /**
   * Busqueda de elementos
   */
  async function searchStat() {
    console.log("Searching stat...");

    var msg = "";
    let fullQuery = "";
    let querySymbol = "?";

    //????
    if (isASearch == false) {
      current_offset = 0;
      current_page = 1;
    }

    //Input data
    var inputData = new Map(
      Object.entries(queryStatInput).filter((o) => {
        return o[1] != "";
      })
    );
    console.log(inputData);
    //Building query
    for (var [inputName, inputValue] of inputData.entries()) {
      
      if (inputValue !== null) {
        msg += getInputNameSpanish(inputName) + "=" + inputValue + " ";
        querySymbol += inputName + "=" + inputValue + "&";
      }
    }
    fullQuery = querySymbol.slice(0, -1);
    console.log("with query: " + fullQuery);
    if (fullQuery != "") {
      const res = await fetch(
        BASE_CONTACT_API_PATH +
          "/natality-stats/" +
          fullQuery +
          "&limit=" +
          limit +
          "&offset=" +
          current_offset
      );
      if (res.ok) {
        console.log("OK");
        const json = await res.json();
        natalityStats = json;

        okMsg = "Resulado de la busqueda con " + msg;
        isASearch = true;
        errorMsg = "";

        getNumTotal(fullQuery);
      } else {
        natalityStats = [];
        if (res.status === 404) {
          errorMsg = "No existe un dato con " + msg;
        } else if (res.status === 500) {
          errorMsg = "No se ha podido acceder a la base de datos";
        }
        okMsg = "";
        resetInputs("search");
        console.log("ERROR!" + errorMsg);
      }
    } else {
      getStats();
    }
  }

  async function insertStat() {
    console.log("Inserting stat: " + JSON.stringify(insertStatInput));

    insertStatInput.date = parseInt(insertStatInput.date);
    insertStatInput.born = parseInt(insertStatInput.born);
    insertStatInput["men-born"] = parseInt(insertStatInput["men-born"]);
    insertStatInput["women-born"] = parseInt(insertStatInput["women-born"]);
    insertStatInput["natality-rate"] = parseFloat(
      insertStatInput["natality-rate"]
    );
    insertStatInput["fertility-rate"] = parseFloat(
      insertStatInput["fertility-rate"]
    );

    const res = await fetch(BASE_CONTACT_API_PATH + "/natality-stats/", {
      method: "POST",
      body: JSON.stringify(insertStatInput),
      headers: {
        "Content-Type": "application/json",
      },
    }).then(function (res) {
      if (res.ok) {
        console.log("OK");

        errorMsg = "";
        okMsg = `La entrada ${insertStatInput.country} ${insertStatInput.date} ha sido insertado correctamente`;

        resetInputs("insert");
        if (isASearch) {
          searchStat();
        } else {
          getStats();
        }
      } else {
        if (res.status === 409) {
          errorMsg = `${insertStatInput.country} ${insertStatInput.date} ya se encuentra cargado`;
        } else if (res.status === 500) {
          errorMsg = "No se ha podido acceder a la base de datos";
        } else {
          errorMsg = "Todos los campos deben estar rellenados correctamene";
        }
        okMsg = "";

        resetInputs("insert");
        console.log("ERROR!" + errorMsg);
      }
    });
  }

  async function deleteStat(country, date) {
    console.log(`Deleting data with name ${country} and date ${date}`);

    const res = await fetch(
      BASE_CONTACT_API_PATH + "/natality-stats/" + country + "/" + date,
      {
        method: "DELETE",
      }
    ).then(function (res) {
      if (res.ok) {
        console.log("OK");

        //Un elemento en la pagina
        if (natalityStats.length === 1) {
          natalityStats = [];
          current_page = current_page - 1;
          current_offset = current_offset - 10;
        }
        if (isASearch) {
          searchStat();
        } else {
          getStats();
        }

        errorMsg = "";
        okMsg = `La entrada ${country} ${date} ha sido borrada correctamente`;
      } else {
        if (res.status === 404) {
          errorMsg = `No se puede eliminar, la entrada ${country} ${date} no existe`;
        } else if (res.status === 500) {
          errorMsg = "No se ha podido acceder a la base de datos";
        }
        okMsg = "";

        console.log("ERROR!" + errorMsg);
      }
    });
  }

  async function deleteAllStats() {
    console.log("Deleting data...");

    const res = await fetch(BASE_CONTACT_API_PATH + "/natality-stats/", {
      method: "DELETE",
    }).then(function (res) {
      if (res.ok) {
        console.log("OK");

        natalityStats = [];

        errorMsg = "";
        okMsg = "Todos los elementos han sido borrados";
        getNumTotal();
      } else {
        if (res.status === 404) {
          errorMsg = "No existen datos que borrar";
        } else if (res.status === 500) {
          errorMsg = "No se ha podido acceder a la base de datos";
        }

        okMsg = "";

        console.log("ERROR!" + errorMsg);
      }
    });
  }

  //functions executed
  onMount(getStats);
  getNumTotal();
</script>

<main>
  <Nav>
    <NavItem>
      <NavLink href="/">Página Principal</NavLink>
    </NavItem>
    <NavItem>
      <NavLink href="/#/natality-stats/natalityCharts">Análiticas</NavLink>
    </NavItem>
  </Nav>

  <h2>Natalidad</h2>

  <div>
    {#if errorMsg}
      <p class="msgRed" style="color: #9d1c24">ERROR: {errorMsg}</p>
    {/if}
    {#if okMsg}
      <p class="msgGreen" style="color: #155724">{okMsg}</p>
    {/if}
    {#if warningMsg}
      <p class="msgYellow" style="color: #a56604">{warningMsg}</p>
    {/if}
  </div>
  <div>
    <Button color="primary" on:click={toggle1}>Cargar datos inciales</Button>
    <Modal isOpen={open1} {toggle1}>
      <ModalHeader {toggle1}>¿Cargar los datos iniciales?</ModalHeader>
      <ModalBody>
        Esta acción cargará los datos siempre y cuando no existan previamente.
      </ModalBody>
      <ModalFooter>
        <Button color="primary" on:click={toggle1P}>Cargar</Button>
        <Button color="secondary" on:click={toggle1}>Cancelar</Button>
      </ModalFooter>
    </Modal>

    {#if natalityStats.length === 0}
      <Button disabled color="danger" on:click={toggle2}
        >Borrar todos los datos</Button
      >
    {:else}
      <Button color="danger" on:click={toggle2}>Borrar todos los datos</Button>
      <Modal isOpen={open2} {toggle2}>
        <ModalHeader {toggle2}>¿Borrar todos los datos?</ModalHeader>
        <ModalBody>Esta acción no se puede deshacer.</ModalBody>
        <ModalFooter>
          <Button color="danger" on:click={toggle2P}>Borrar</Button>
          <Button color="secondary" on:click={toggle2}>Cancelar</Button>
        </ModalFooter>
      </Modal>
    {/if}
  </div>

  <div>
    <h3>Listado de datos</h3>
    <Table bordered>
      <thead>
        <tr>
          <th> País </th>
          <th>Año </th>
          <th>Nacimientos </th>
          <th>Hombres nacidos </th>
          <th>Mujeres nacidas </th>
          <th>Tasa de natalidad </th>
          <th>Índice de fecundación </th>
          <th colspan="2">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td
            ><input
              type="text"
              placeholder="spain"
              bind:value={queryStatInput.country}
            /></td
          >
          <td
            ><input
              type="number"
              placeholder="2019"
              min="1900"
              bind:value={queryStatInput.date}
            /></td
          >
          <td
            ><input
              type="number"
              placeholder="2000"
              min="1"
              bind:value={queryStatInput.born}
            /></td
          >
          <td
            ><input
              type="number"
              placeholder="1000"
              min="1"
              bind:value={queryStatInput["men-born"]}
            /></td
          >
          <td
            ><input
              type="number"
              placeholder="1000"
              min="1"
              bind:value={queryStatInput["women-born"]}
            /></td
          >
          <td
            ><input
              type="number"
              placeholder="10.2"
              min="1.0"
              bind:value={queryStatInput["natality-rate"]}
            /></td
          >
          <td
            ><input
              type="number"
              placeholder="2.1"
              min="1.0"
              bind:value={queryStatInput["fertility-rate"]}
            /></td
          >

          <td colspan="2"
            ><Button color="primary" on:click={searchStat}>Buscar</Button></td
          >
        </tr>
        <tr>
          <td colspan="9" />
        </tr>
        <tr>
          <td
            ><input
              type="text"
              placeholder="spain"
              bind:value={insertStatInput.country}
            /></td
          >
          <td
            ><input
              type="number"
              placeholder="2019"
              min="1900"
              bind:value={insertStatInput.date}
            /></td
          >
          <td
            ><input
              type="number"
              placeholder="2000"
              min="1"
              bind:value={insertStatInput.born}
            /></td
          >
          <td
            ><input
              type="number"
              placeholder="1000"
              min="1"
              bind:value={insertStatInput["men-born"]}
            /></td
          >
          <td
            ><input
              type="number"
              placeholder="1000"
              min="1"
              bind:value={insertStatInput["women-born"]}
            /></td
          >
          <td
            ><input
              type="number"
              placeholder="10.2"
              min="1.0"
              bind:value={insertStatInput["natality-rate"]}
            /></td
          >
          <td
            ><input
              type="number"
              placeholder="2.1"
              min="1.0"
              bind:value={insertStatInput["fertility-rate"]}
            /></td
          >
          <td colspan="2"
            ><Button color="primary" on:click={insertStat}>Insertar</Button></td
          >
        </tr>

        <tr>
          <td colspan="9" />
        </tr>

        {#each natalityStats as stat}
          <tr>
            <td>{stat.country}</td>
            <td>{stat.date}</td>
            <td>{stat.born}</td>
            <td>{stat["men-born"]}</td>
            <td>{stat["women-born"]}</td>
            <td>{stat["natality-rate"]}%</td>
            <td>{stat["fertility-rate"]}</td>
            <td>
              <a href="#/natality-stats/{stat.country}/{stat.date}">
                <Button color="primary">Editar</Button>
              </a></td
            >
            <td
              ><Button
                color="danger"
                on:click={deleteStat(stat.country, stat.date)}>Borrar</Button
              ></td
            >
          </tr>
        {/each}
      </tbody>
    </Table>
  </div>

  <div>
    <p>Se muestran {natalityStats.length} de un total de {total} entradas.</p>

    <!-- Pagination -->
    <Pagination ariaLabel="Web pagination">
      <PaginationItem class={current_page === 1 ? "disabled" : ""}>
        <PaginationLink
          previous
          href="#/natality-stats"
          on:click={() =>
            changePage(current_page - 1, current_offset - 10, isASearch)}
        />
      </PaginationItem>
      {#each range(last_page, 1) as page}
        <PaginationItem class={current_page === page ? "active" : ""}>
          <PaginationLink
            previous
            href="#/natality-stats"
            on:click={() => changePage(page, (page - 1) * 10, isASearch)}
            >{page}</PaginationLink
          >
        </PaginationItem>
      {/each}
      <PaginationItem class={current_page === last_page ? "disabled" : ""}>
        <PaginationLink
          next
          href="#/natality-stats"
          on:click={() =>
            changePage(current_page + 1, current_offset + 10, isASearch)}
        />
      </PaginationItem>
    </Pagination>
  </div>
</main>

<style>
  main {
    text-align: center;
    padding: 1em;
    margin: 0 auto;
  }
  p {
    display: inline;
  }
  .msgYellow {
    padding: 8px;

    background-color: #fff3cd;
  }
  .msgRed {
    padding: 8px;

    background-color: #f8d7da;
  }
  .msgGreen {
    padding: 8px;

    background-color: #d4edda;
  }
  div {
    margin-bottom: 20px;
  }
  h2 {
    text-transform: uppercase;
    font-size: 4em;
    font-weight: 100;
  }
</style>
