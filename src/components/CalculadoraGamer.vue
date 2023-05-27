<template>
    <main id="calculadora">


        <h1 id="titulos" class="text-light text-center p-5">TIENDAS DE VIDEOJUEGOS</h1>
  
      <div class="card-group justify-content-center">
        <div v-for="store in stores" :key="store.id">
          <div class="">
            <div class="card m-5 rounded w-75" style="height: 350px;">
              <template v-if="store.imagen">
                <img :src="store.imagen" :alt="store.name" class="icon-image mb-4 mt-5">
              </template>
              <template v-else>
                <i style="font-size:65px;" :class="store.icono + ' text-light text-center m-3'"></i>
              </template>
              <h2 style="color: var(--color-main1)" class="text-center mb-4">{{ store.name }}</h2>
              <template v-if="store.moneda < 1">
                <input class="w-50 text-center m-auto mb-3" type="number" v-model="store.precio" placeholder="$0 ARS">
                <h3 class="m-4 pb-4 text-center">{{ (store.precio * store.impuesto).toFixed(2) }} ARS</h3>
              </template>
              <template v-else-if="store.moneda > 0">
                <input class="w-50 text-center m-auto mb-3" type="number" v-model="store.precio" placeholder="$0 USD">
                <h3 class="m-4 pb-4 text-center">${{ ((store.precio * store.impuesto) * dolar).toFixed(2) }} ARS</h3>
              </template>
            </div>
          </div>
        </div>
      </div>
  
      <h1  id="titulos" class="text-light text-center p-5">MICROPAGOS</h1>
  
      <div class="card-group justify-content-center">
        <div v-for="micropago in micropagos" :key="micropago.id">
          <div class="">
            <div class="card m-5 rounded w-75" style="height: 350px;">
              <template v-if="micropago.imagen">
                <img style="width: auto;" :src="micropago.imagen" :alt="micropago.name" class="icon-image mb-4 mt-5">
              </template>
              <template v-else>
                <i style="font-size:65px;" :class="micropago.icono + ' text-light text-center m-3'"></i>
              </template>
              <h2  style="color: var(--color-main1)" class="text-center mb-4">{{ micropago.name }}</h2>
              <template v-if="micropago.moneda < 1">
                <input class="w-50 text-center m-auto mb-3" type="number" v-model="micropago.precio" placeholder="$0 ARS">
                <h3 style="color: var(--color-main1)" class="m-4 pb-4 text-center">{{ (micropago.precio * micropago.impuesto).toFixed(2) }} ARS</h3>
              </template>
              <template v-else-if="micropago.moneda > 0">
                <input  class="w-50 text-center m-auto mb-3" type="number" v-model="micropago.precio" placeholder="$0 USD">
                <h3 style="color: var(--color-main1)" class="m-4 pb-4 text-center">${{ ((micropago.precio * micropago.impuesto) * dolar).toFixed(2) }} ARS</h3>
              </template>
            </div>
          </div>
        </div>
      </div>

      <h1 id="titulos" class="text-light text-center p-5">SERVICIOS EN LA NUBE</h1>

      <div class="card-group justify-content-center">
        <div v-for="nube in nubes" :key="nube.id">
          <div class="">
            <div class="card m-5 rounded w-75" style="height: 350px;">
              <template v-if="nube.imagen">
                <img :src="nube.imagen" :alt="nube.name" class="icon-image mb-4 mt-5">
              </template>
              <template v-else>
                <i style="font-size:65px;" :class="nube.icono + ' text-light text-center m-3'"></i>
              </template>
              <h2 style="color: var(--color-main1)" class="text-center mb-4">{{ nube.name }}</h2>
              <template v-if="nube.moneda < 1">
                <input class="w-50 text-center m-auto mb-3" type="number" v-model="nube.precio" placeholder="$0 ARS">
                <h3 style="color: var(--color-main1)" class="m-4 pb-4 text-center">{{ (nube.precio * nube.impuesto).toFixed(2) }} ARS</h3>
              </template>
              <template v-else-if="nube.moneda > 0">
                <input class="w-50 text-center m-auto mb-3" type="number" v-model="nube.precio" placeholder="$0 USD">
                <h3 style="color: var(--color-main1)" class="m-4 pb-4 text-center">${{ ((nube.precio * nube.impuesto) * dolar).toFixed(2) }} ARS</h3>
              </template>
            </div>
          </div>
        </div>
      </div>
  
    </main>
  </template>
  
  <script>
  import stores from "@/assets/stores.json";
  import micropagos from "@/assets/micropagos.json";
  import nube from "@/assets/nube.json";
  
  export default {
    data() {
      return {
        dolar: "",
        stores: stores,
        micropagos: micropagos,
        nubes: nube
      };
    },
    mounted() {
      const url = "https://www.dolarsi.com/api/api.php?type=valoresprincipales";
      fetch(url)
        .then(response => response.json())
        .then(casa => {
          this.dolar = parseFloat(casa[0].casa.venta);
          console.log(casa[0].casa.venta);
        })
        .catch(err => console.log(err));
    },
  };
  </script>
  
  <style scoped>
  .card {
    font-weight: bold;
    color: whitesmoke;
    box-shadow: 0px 5px 15px 5px rgba(0, 0, 0, 0.2);
    background-color: rgb(10, 10, 20, 0.5);
    border-style: solid;
    border-radius: 8px;
    border: none;
  }
  
  input {
    border-top: none;
    border-right: none;
    border-left: none;
    border-bottom: 2px solid rgb(252, 252, 252);
    color: aliceblue;
    background-color: transparent;
    font-size: 24px;
    
  }
  
  h3 {
    font-size: 24px;
    color: salmon;
  }
  
  .icon-image {
    width: 65px;
    height: 65px;
    margin: 0 auto;
    display: block;
  }

  #titulos 
  
  {
    text-align: center;
    color: azure;
    background-color: rgb(10, 10, 20, 0.5);


  }

 

  </style>
  