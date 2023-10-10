const ProductService = require('../services/ProductService')

class ProductsController {
  constructor() {
    this.service = new ProductService()
  }

  async getAllProducts(req, res) {
    const filters = {}
      const { page= 1, limit= 5, sort, category, availability } = req.query
      const sortOptions = sort === 'asc' ? { price: 1 } : sort === 'desc' ? { price: -1 } : {};
      const availabilityOptions = availability === 'available' ? true : availability === 'unavailable' ? false : undefined;
      const query = {
          page: parseInt(page),
          limit: parseInt(limit),
          sort: sortOptions,
      }

    try {
      if (category) {
        filters.category = category
      }

      if (availability) {
          filters.status = availabilityOptions;
      }
    
      const products = await this.service.getAllProducts(filters, query)

      if (products.length === 0) {
        return res.status(404).send({ status: 'Error', message: 'Productos no encontrados' })
      }

      const generatePageLink = (page) => {
        const newQuery = { ...req.query, ...filters, page: page };
        return 'api/products?' + new URLSearchParams(newQuery).toString();
      };

      // return res.status(200).json({
      //   status: 'success',
      //   payload: products.doc,
      //   totalPages: products.totalPages,
      //   prevPage: products.prevPage,
      //   nextPage: products.nextPage,
      //   hasPrevPage: products.hasPrevPage,
      //   hasNextPage: products.hasNextPage,
      //   prevLink: products.hasPrevPage ? generatePageLink(products.prevPage) : null,
      //   nextLink: products.hasNextPage ? generatePageLink(products.nextPage) : null
      // })

      const result = {
        ...products,
        prevLink: products.PrevPage ? generatePageLink(products.prevPage) : null,
        nextLink: products.NextPage ? generatePageLink(products.nextPage) : null  
      }

      return res.status(200).json(result)

    } catch (error) {
      return res.status(500).send({ status: 'Error', error: 'Error al obtener los productos', message: error.message })
    }
  }

  async getProductById(req, res) {
    const pid = req.params.pid

    try {
      const product = await this.service.getProductById(pid)

      return res.status(200).json(product)

    } catch (error) {
      if (error.message === 'El producto no se encuenta en el inventario') {
        return res.status(404).send({ status: 'Error', message: error.message })
      }

      return res.status(500).send({ status: 'Error', error: 'Error al obtener los productos', message: error.message })
    }
  }

  async addProduct(req, res) {
    const newProduct = req.body

    try {
      await this.service.addProduct(newProduct)

      return res.status(201).send({ status: 'success', message: 'Producto agregado al inventario exitosamente' })

    } catch (error) {
      return res.status(500).send({ status: 'Error', error: 'Error al agregar el producto', message: error.message })
    }
  }

  async updateProduct(req, res) {
    const body = req.body
    const pid = req.params.pid

    try {
      await this.service.updateProduct(pid, body)

      return res.status(200).send({ status: 'success', message: 'Producto actualizado exitosamente' })

    } catch (error) {
      if(error.message === 'El producto no existe') {
        return res.status(404).send({ status: 'Error', message: error.message })
      }

      return res.status(500).send({ status: 'Error', error: 'Error al actualizar el producto', message: error.message })
    }
  }

  async deleteProduct(req, res) {
    const pid = req.params.pid
    
    try {
      await this.service.deleteProduct(pid)
      
      return res.status(200).send({ status: 'success', message: 'El producto ha sido borrado correctamente' })
    } catch (error) {
      if(error.message === 'El producto no existe') {
        return res.status(404).send({ status: 'Error', message: error.message })
      }
      return res.status(500).send({ status: 'Error', error: 'Error al borrar el producto', message: error.message })
    }
  }
}

module.exports = ProductsController