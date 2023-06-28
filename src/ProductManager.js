const fs = require('fs')

class ProductManager {
    constructor(path) {
        this.path = path
    }

    //Visualizar el array de productos
    getProducts () {
        return fs.promises.readFile(this.path, 'utf-8')
        .then((productosString)=> {
            const productos = JSON.parse(productosString)
            return productos
        })
        .catch(error => {
            console.log('Error al leer el archivo', error)
            return []
        })
    }
    
    //Creacion metodo para agregar productos
    addProduct(data) {
        //Plantilla alta nuevo producto
        const nvoProd = {
            title: data.title,
            description: data.description,
            price: data.price,
            thumbnail: data.thumbnail,
            code: data.code,
            stock: data.stock
        }

        return this.getProducts()
            .then(products => { 
                //Validacion de campos obligatorios
                if(
                    data.title === '' ||
                    data.description === '' ||
                    data.price=== '' ||
                    data.thumbnail === '' ||
                    data.code === '' ||
                    data.stock === '') 
                    {
                    return console.log('Todos los capos son obligatorios')
                }
                //Validacion que no se repita el "Code" de los productos
                const repetido = products.find((el) => el.code === data.code)
                if (repetido){
                    return console.log('Los productos no pueden tener el code repetido')
                }

                nvoProd.id = products.length + 1
                products.push(nvoProd)

                return fs.promises.writeFile(this.path, JSON.stringify(products, null, 2))
                })
            .catch(error => {
                console.log('Error al guardar el producto')
                return error
            })
    }

    //Buscar productos por su ID
    getProductById (id) {
        return this.getProducts()
            .then(products => {
                const producto = products.find(producto => producto.id === id)
                return producto
                })
            .catch(error => {
                console.log('Error al obtener el producto')
                return error
            })
    }
    
    //Actualizar info de productos
    updateProduct(id, data) {
        return this.getProducts()
        .then(products => {
            const productoIndex = products.findIndex(producto => producto.id === id)

            if(productoIndex === -1) {
                return
            }

            products[productoIndex].title = data.title
            products[productoIndex].description = data.description
            products[productoIndex].price = data.price
            products[productoIndex].code = data.code
            products[productoIndex].stock = data.stock

            return fs.promises.writeFile(this.path, JSON.stringify(products, null, 2))
            })
        .catch(error => {
            console.log('Error al actualizar el producto')
            return error
        })
    }

    deleteProduct(id) {
        return this.getProducts()
        .then(products => {
            const prodIndex = products.findIndex(producto => producto.id === id)

            if(prodIndex === -1) {
                return console.log('No se ha encontrado el producto')
            }

            products.splice(prodIndex, 1)
            console.log(`Se ha eliminado el producto`)
            return fs.promises.writeFile(this.path, JSON.stringify(products, null, 2))
            })
        .catch(error => {
            console.log('Error al actualizar el producto')
            return error
        })
    }
}


//////////////////////////////////////////////////////////////////////////////////
//VALIDACIONES Y TESTS
const manager = new ProductManager('./products.json')

//Alta de productos
manager.addProduct({ 
    // title: 'yerba',
    // description:'playadito',
    // price: 800,
    // thumbnail:'img',
    // code: 'barras',
    // stock: 33,

    title: 'azucar',
    description:'domino',
    price: 475,
    thumbnail:'img',
    code: 'qwerty',
    stock: 22,
    
})

/*
/////MAS PRODUCTOS PARA AGREGAR/////
title: 'fideos',
description:'luchetti',
price: 280,
thumbnail:'img',
code: 'qwerty',
stock: 17,

title: 'harina',
description:'blancafor',
price: 320,
thumbnail:'img',
code: 'qwertyz',
stock: 10,

title: 'huevos',
description:'gallina',
price: 1300,
thumbnail:'img',
code: 'qwertyuio',
stock: 30,
//////////////////////////////////
*/

/*
manager.getProductById(3)
.then(producto => {
    console.log(producto)
})
*/

/*
manager
    .updateProduct(2, {
        title: 'fideos',
        description:'luchetti',
        price: 280,
        thumbnail:'img',
        code: 'qwerty',
        stock: 17,
    })
    .then(() => {
        return manager.getProductById(2)
    })
    .then((producto) => {
        console.log(producto)
    })
*/

/*
manager.deleteProduct(2)
*/