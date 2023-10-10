const settings = require('../commands/command')

const nodemailer = require('nodemailer')

const trasportGmail = nodemailer.createTransport({
  service: 'gmail',
  port: 587,
  auth: {
    user: settings.emailUser,
    pass: settings.passwordUser
  }
})

module.export = { trasportGmail }