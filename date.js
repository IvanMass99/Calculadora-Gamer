document.addEventListener("DOMContentLoaded", function () {
    const fechaH3 = document.getElementById("fecha");
    
    // Obtener la fecha actual
    const fechaActual = new Date();
    
    // Formatear la fecha como "Día de la semana, Mes Día, Año"
    const opcionesDeFormato = { weekday: 'long', month: 'long', day: 'numeric' };
    const fechaFormateada = fechaActual.toLocaleDateString('es-ES', opcionesDeFormato);
    
    // Establecer la fecha formateada en el elemento <h3>
    fechaH3.textContent =  "(" + fechaFormateada + ")";
});
