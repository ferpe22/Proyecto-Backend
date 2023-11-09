const { Command } = require('commander')
const config = require('../config/config')
const dotenv = require('dotenv')

const program = new Command()

program
  .option('--mode <mode>', 'Modo de trabajo', 'dev')

program.parse()
const option = program.opts()

dotenv.config({
  path: `.env.${option.mode}`
})

const setting = config()

module.exports = setting