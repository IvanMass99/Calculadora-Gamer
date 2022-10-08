<script></script>


<main>

    <div class="bienvenida text-center">

        <h1 class="" style="color:salmon;"> CALCULADORA GAMER </h1>
    
        <h4 class="mt-5 mb-3 text-light"> Calcula el precio final con impuestos incluidos en diversas tiendas de videojuegos.</h4>

        <h5 class="text-secondary">¡Actualizada a los últimos impuestos agregados!</h5>
    
        <h5 class="text-secondary"></h5>
    
    
        <div class="text-light mt-5">
    
            <i class="bi bi-steam"></i>
            <i class="bi bi-playstation"></i>
            <i class="bi bi-xbox"></i>
            <i class="bi bi-nintendo-switch"></i>
            <i class="bi bi-google-play"></i>  
            <i class="bi bi-three-dots"></i>  
    
        </div>
    
        <div class="container_mouse mt-5">
            <span class="mouse-btn">
                <span class="mouse-scroll"></span>
            </span>
    
        </div>
    
    </div>
    
    
    
    

</main>


<style>

.bienvenida

{

margin: 10%;

}

i

{

margin: 2%;
font-size: 42px;

}




/* ----------------------- SCROLL ANIMATION --------------------------*/


.mouse-btn {
    margin: 10px auto;
    width: 40px;
    height: 80px;
    border: 3px solid salmon;
    border-radius: 20px;
    display: flex;
  }
  
  .mouse-scroll {
    display: block;
    width: 20px;
    height: 20px;
    background: linear-gradient(170deg, salmon, salmon);
    border-radius: 50%;
    margin: auto;
    animation: scrolling13 1.5s linear infinite;
  }
  
  @keyframes scrolling13 {
    0% {
      opacity: 0;
      transform: translateY(-20px);
    }
  
    100% {
      opacity: 1;
      transform: translateY(20px);
    }
  }

</style>