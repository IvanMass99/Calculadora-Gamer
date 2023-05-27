<template>

<NavbarComp></NavbarComp>
<BienvenidaVue></BienvenidaVue>

<CalculadoraGamer></CalculadoraGamer>
<FooterComp></FooterComp>

</template>

<script>

import NavbarComp from "./components/NavbarComp.vue"
import BienvenidaVue from "./components/BienvenidaComp.vue"

import CalculadoraGamer from "./components/CalculadoraGamer.vue"
import FooterComp from "./components/FooterComp.vue"




export default 
{
  name: 'HomeApp',
  components: { NavbarComp, BienvenidaVue, CalculadoraGamer, FooterComp}
}
</script>

<style>
</style>
