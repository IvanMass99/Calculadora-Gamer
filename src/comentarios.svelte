<script>
    import comentarios from "./assets/comentarios.json";
</script>

<main>
    <h2 class="text-center text-light m-5">Comentarios</h2>

     <!------------------------------------------------------------->

    <div class="card-group justify-content-center">
        {#each comentarios as comentarios (comentarios.id)}

<div>


                 <div class="card rounded m-3" style="width:350px; height:auto;" id="card">

                    <h4 class="text-start m-2 mt-4">
                    <i style="font-size:28px;"class="{comentarios.icono} m-2"/>{comentarios.usuario}</h4>
                    <p class="text-light mx-3" style="font-style:italic;">"{comentarios.texto}"</p>
                    <p class="text-end mx-3"><i class="bi bi-heart-fill text-start mx-3"></i>{comentarios.votos}</p>
    
     
                 </div>
                </div>
        {/each}
    </div>
</main>



<style>
    #card {

        
    
        font-weight: bold;
        color: whitesmoke;
        box-shadow: 0px 5px 15px 5px rgba(0, 0, 0, 0.2);

        background-color: rgba(184, 184, 184, 0.1);

        border-style: solid;
        border-radius: 8px;
        border: none;
    }

    #card h4 {
        color: salmon;
    }

    #card i {
        color: salmon;
    }
</style>
