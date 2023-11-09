const ProductsService = require('../services/ProducstService')
const CustomErrors = require('../services/Errors/CustomErrors')
const EErrors = require('../services/Errors/enums')

class ProductsController {
  constructor(io) {
    this.service = new ProductsService()
    this.io = io
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
      };

    try {
      if (category) {
        filters.category = category
      }

      if (availability) {
          filters.status = availabilityOptions;
      }
    
      const products = await this.service.getAllProducts(filters, query)

      if (products.length === 0) {
        //return res.status(404).send({ status: 'Error', message: 'Productos no encontrados' })
        return res.sendError(404, 'Productos no encontrados', 'Error al obtener los productos')
      }

      const generatePageLink = (page) => {
        const newQuery = { ...req.query, ...filters, page: page };
        return '/api/products?' + new URLSearchParams(newQuery).toString();
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

      //return res.status(200).json(result)
      return res.sendSuccess(200, result)

    } catch (error) {
      //return res.status(500).send({ status: 'Error', error: 'Error al obtener los productos', message: error.message })
      return res.sendError(500, 'Error al obtener los productos', error)
    }
  }

  async getProductById(req, res) {
    const pid = req.params.pid

    try {
      const product = await this.service.getProductById(pid)

      if(!product) {
        const error = CustomErrors.createError({
          name: 'Error al obtener el producto',
          cause: `El producto con id ${pid} no se encuentra en el inventario`,
          message: `El producto con id ${pid} no se encuentra en el inventario`,
          code: EErrors.DATABASE_ERROR
        })
        throw error
      }

      //return res.status(200).json(product)
      return res.sendSuccess(200, product)

    } catch (error) {
      next(error)
    }  
  }

  async addProduct(req, res) {
    const newProduct = req.body
    
    try {
      const nvoProducto = await this.service.addProduct(newProduct)
      
      this.io.emit('newProduct', JSON.stringify(nvoProducto))
      //return res.status(201).send({ status: 'success', message: 'Producto agregado al inventario exitosamente' })
      return res.sendSuccess(201, 'Agregado exitosamente')

    } catch (error) {
      //return res.status(500).send({ status: 'Error', error: 'Error al agregar el producto', message: error.message })
      req.logger.error('Error al agregar el producto')
      next(error)
    }
  }

  async updateProduct(req, res) {
    const { productData, userId } = req.body
    const pid = req.params.pid

    try {
      const updateProduct = await this.service.updateProduct(pid, productData, userId)

      this.io.emit('updateProductInView', updateProduct)

      //return res.status(200).send({ status: 'success', message: 'Producto actualizado exitosamente' })
      return res.sendSuccess(200, 'Actualizado exitosamente')

    } catch (error) {
      if(error.message === 'El producto no encontrado') {
        //return res.status(404).send({ status: 'Error', message: error.message })
        return res.sendError(404, error.message)
      }
      if (error.code === 11000) {
        return res.sendError(409, `El code: ${productData.code} ya existe`)
      }

      //return res.status(500).send({ status: 'Error', error: 'Error al actualizar el producto', message: error.message })
      return res.sendError(500, error.message)
    }
  }

  async deleteProduct(req, res) {
    const pid = req.params.pid
    const { userId } = req.body
    
    try {
      await this.service.deleteProduct(pid, userId)

      req.logger.info('Se elimino el producto')

      this.io.emit('productDeleted', pid)     
      //return res.status(200).send({ status: 'success', message: 'El producto ha sido borrado correctamente' })
      return res.sendSuccess(200, 'Borrado exitosamente')
    } catch (error) {
      req.logger.error('Error al borrar el producto')
      if(error.message === 'El producto no encontrado') {
        //return res.status(404).send({ status: 'Error', message: error.message })
        return res.sendError(404, error.message)
      }

      if(error.message === 'No erer el propietario de producto para poder modificar o borrar el mismo') {
        return res.sendError(404, error.message)
      }
      //return res.status(500).send({ status: 'Error', error: 'Error al borrar el producto', message: error.message })
      return res.sendError(500, error.message)
    }
  }
}

module.exports = ProductsController