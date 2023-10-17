const config = () => {
  return {
    port: process.env.PORT,
    mongoDbUser: process.env.MONGODB_USER,
    mongoDbPassword: process.env.MONGODB_PASSWORD,
    mongoDbHost: process.env.MONGODB_HOST,
    mongoDbName: process.env.MONGODB_NAME,
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    privateKey: process.env.PRIVATE_KEY,
    jwtKey: process.env.JWT_KEY,
    emailUser: process.env.EMAIL_USER,
    passwordUser: process.env.PASSWORD_USER
  }  
}

module.exports = config