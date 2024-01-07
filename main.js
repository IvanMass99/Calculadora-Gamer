document.addEventListener("DOMContentLoaded", function () {
    // Función para calcular el resultado utilizando la API y fórmula personalizada
    function calcularResultado(inputId, resultadoId, formulas) {
        const cantidadInput = document.getElementById(inputId);
        const resultadoSpan = document.getElementById(resultadoId);

        cantidadInput.addEventListener("input", function () {
            const cantidad = parseFloat(cantidadInput.value);
            if (isNaN(cantidad)) {
                resultadoSpan.textContent = "$0.00 ARS";
                return;
            }

            // Obtener el valor del dólar desde la API (cambia la URL a tu fuente de datos)
            fetch("https://dolarapi.com/v1/dolares/oficial")
                .then(response => response.json())
                .then(data => {
                    const valorDolar = data.venta; // Cambiar a "venta" si prefieres el valor de venta

                    // Obtener el nombre de la tienda desde el inputId
                    const tienda = inputId.replace("cantidad", "");

                    // Verificar si la tienda tiene una fórmula personalizada en el archivo JSON
                    const formulaPersonalizada = formulas[tienda];

                    // Calcular el resultado utilizando la fórmula correspondiente
                    let resultado;
                    if (formulaPersonalizada) {
                        resultado = eval(formulaPersonalizada.formula);
                    } else {
                        resultado = cantidad * valorDolar * 1.60; // Fórmula predeterminada
                    }

                    resultadoSpan.textContent = resultado.toFixed(0) + " ARS";
                })
                .catch(error => {
                    console.error("Error al obtener el valor del dólar:", error);
                    resultadoSpan.textContent = "Resultado: Error al obtener el valor del dólar";
                });
        });
    }

    // Cargar las fórmulas desde el archivo JSON
    fetch("formulas.json")
        .then(response => response.json())
        .then(formulas => {
            // Llamar a la función para cada par de campos de entrada y resultado con las fórmulas personalizadas
            calcularResultado("cantidadSteam", "resultadoSteam", formulas);
            calcularResultado("cantidadEpic", "resultadoEpic", formulas);
            calcularResultado("cantidadPlayStation", "resultadoPlayStation", formulas);
            calcularResultado("cantidadNintendo", "resultadoNintendo", formulas);
            calcularResultado("cantidadUbisoft", "resultadoUbisoft", formulas);
            calcularResultado("cantidadGoogle", "resultadoGoogle", formulas);
            calcularResultado("cantidadApple", "resultadoApple", formulas);
            calcularResultado("cantidadXbox", "resultadoXbox", formulas);
            calcularResultado("cantidadNvidia", "resultadoNvidia", formulas);
            calcularResultado("cantidadXboxPass", "resultadoXboxPass", formulas);
            calcularResultado("cantidadEAplay", "resultadoEAplay", formulas);
        })
        .catch(error => {
            console.error("Error al cargar el archivo de fórmulas:", error);
        });
});
