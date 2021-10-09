//////////////////// RESTRINGIR CARACTERES //////////////////// 



//////////////////// VARIABLES //////////////////// 

final = ""
//////////////////// PS STORE //////////////////// 

function PS_store() 

{


    PS_precio = parseFloat(document.getElementById('PS_precio').value)
    let element = document.getElementById('PS_final')
    element.innerHTML = `<p>PRECIO FINAL<h2> $ ${((PS_precio * final)*1.65).toFixed(2)} ARS </h2></p>`


}

//////////////////// NINTENDO //////////////////// 

function Nintendo_store() 

{


    Nintendo_precio = parseFloat(document.getElementById('Nintendo_precio').value)
    let element = document.getElementById('Nintendo_final')
    element.innerHTML = `<p> PRECIO FINAL<h2> $ ${((Nintendo_precio * final)*1.65).toFixed(2)} ARS </h2></p>`


}

//////////////////// EPIC STORE //////////////////// 

function tienda_epic_store() 

{


    epic_store_precio = parseFloat(document.getElementById('Epic_store_precio').value)
    let element = document.getElementById('Epic_store_final')
    element.innerHTML = `<p>PRECIO FINAL<h2> $ ${((epic_store_precio * final)*1.65).toFixed(2)} ARS </h2></p>`


}



//////////////////// STEAM ////////////////////////

function tienda_steam() {


    steam_precio = parseFloat(document.getElementById('Steam_precio').value)
    let element = document.getElementById('Steam_final')
    element.innerHTML = `<p>PRECIO FINAL<h2> $ ${(steam_precio * 1.65).toFixed(2)} ARS 🧉  </h2></p>`

}

//////////////////// XBOX ////////////////////////

function Xbox_store() 

{


    Xbox_precio = parseFloat(document.getElementById('Xbox_precio').value)
    let element = document.getElementById('Xbox_final')
    element.innerHTML = `<p>PRECIO FINAL<h2> $ ${(Xbox_precio * 1.65).toFixed(2)} ARS </h2></p>`

}

//////////////////// UBISOFT ////////////////////////

function Ubisoft_store() 

{


    Ubisoft_precio = parseFloat(document.getElementById('Ubisoft_precio').value)
    let element = document.getElementById('Ubisoft_final')
    element.innerHTML = `<p>PRECIO FINAL<h2> $ ${(Ubisoft_precio * 1.27).toFixed(2)} ARS </h2></p>`

}

//////////////////// DOLAR API //////////////////// 
//////////////////// DOLAR API //////////////////// 
//////////////////// DOLAR API //////////////////// 

//const url = 'https://api-dolar-argentina.herokuapp.com/api/dolaroficial'



const url = 'https://www.dolarsi.com/api/api.php?type=valoresprincipales'

fetch(url)

    .then(response => response.json())
    .then(casa => {

        final = parseFloat([casa[0].casa.venta])
                console.log(casa[0].casa.venta)
       // console.log([casa[0].casa.compra])

    })

    .catch(err => console.log(err))

//////////////////// DOLAR API //////////////////// 
//////////////////// DOLAR API //////////////////// 
//////////////////// DOLAR API //////////////////// 


PS_store()
Nintendo_store()
tienda_epic_store()
tienda_steam()
Xbox_store()
Ubisoft_store()

///////////////////////// MENU RESPONSIVE ////////////////

