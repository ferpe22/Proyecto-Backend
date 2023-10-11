const mongoose = require('mongoose')

class MongoSingleton {
  static instance
  static MONGODB_CONNECT
  constructor() {
    MongoSingleton.MONGODB_CONNECT = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_HOST}/${process.env.MONGODB_NAME}?retryWrites=true&w=majority`
    mongoose.connect(MongoSingleton.MONGODB_CONNECT, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
  }

  static getConnection() {
    if (this.instance) {
      console.log('Ya existe una conexión a la base de datos')

      return this.instance
    }

    this.instance = new MongoSingleton()
    console.log(`Conectado a la base de datos ${process.env.MONGODB_NAME}`)
    
    return this.instance
  }
}

module.exports = MongoSingleton