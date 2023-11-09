const generateProductError = (product) => {
  return `Una o más propiedades de un producto no son válidas:
  *title: Debe ser tipo String, se recibio: ${product.title}
  *description: Debe ser tipo String, se recibio: ${product.description}
  *price: Debe ser tipo Number, se recibio: ${product.price}
  *code: Debe ser tipo String, se recibio: ${product.code}
  *stock: Debe ser tipo Number, se recibio: ${product.stock}
  *category: Debe ser tipo String, se recibio: ${product.category}
  *status: Debe ser tipo Boolean, se recibio: ${product.status}
  `
}

const generateNotFoundError = (id, data) => {
  if(data === 'cart') {
      return `No se pudo encontrar el carrito con el ID: ${id}`;
  } else if (data === 'product') {
      return `No se pudo encontrar el producto con el ID: ${id}`;
  } else if (data === 'productCart') {
      return `No se pudo encontrar en e carrito, el producto con el ID: ${id}`
  }
}

module.export = { generateProductError, generateNotFoundError }