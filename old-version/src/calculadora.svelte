<script>

    import stores from './assets/stores.json'
    
 
    var dolar = ""
    
    const url = 'https://www.dolarsi.com/api/api.php?type=valoresprincipales'
    
    fetch(url)
    
        .then(response => response.json())
        .then(casa => {
    
            dolar = parseFloat([casa[0].casa.venta])
                    console.log(casa[0].casa.venta)
       
    
        })
    
        .catch(err => console.log(err))
    
    </script>
    
    <main id="calculadora">

        <h2 class="text-light text-center">Tiendas de videojuegos</h2>
    
    <div class="card-group justify-content-center">
        {#each stores as store (store.id) }
            <div class="">
                <div class="">
                    <div class="card m-5 rounded w-75">
                        
                        <i style="font-size:65px;" class="{store.icono} text-light text-center m-3"></i>
                        <h2 class="text-center mb-4"> {store.name}</h2>	
                       
                        
                        {#if store.moneda<1}
                        <input class="w-50 text-center m-auto mb-3"  type="number" bind:value={store.precio} placeholder="$0 ARS">
                        <h3 class="m-4 pb-4 text-center">{parseFloat(store.precio*store.impuesto).toFixed(2)} ARS</h3>
                        {:else if store.moneda >0}
                        <input class="w-50 text-center m-auto mb-3"  type="number" bind:value={store.precio} placeholder="$0 USD">
                        <h3 class="m-4 pb-4 text-center">${parseFloat((store.precio*store.impuesto)*dolar).toFixed(2)} ARS</h3>
                       {/if}
                       

                    </div>
                </div>
            </div>
        {/each}
    </div>
    
    
    
  
    
    
    
    </main>
    
    <style>
        

        .card

{

    

    font-weight: bold;
    color: whitesmoke;
    box-shadow: 0px 5px 15px 5px rgba(0, 0, 0, 0.2);

    background-color: rgb(10, 10, 20, 0.5);

    border-style: solid;
    border-radius: 8px;
    border: none;


}

input

{

border-top: none;
border-right: none;
border-left: none;
border-bottom: 2px solid salmon;

color: aliceblue;
background-color: transparent;

font-size: 24px;


}

h3 {font-size: 24px; color: salmon;}


    </style>
