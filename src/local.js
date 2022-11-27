const { spawn } = require('child_process')
const path = require('path')
const process = require('process')

process.env.INPUT_NOTION_TOKEN = process.env.NOTION_TOKEN
process.env.INPUT_DATABASE = '3ea38518219c45dc8051c5c70b9de5ca'
process.env.INPUT_TRANSLATION_ENGINE = 'google'
process.env.INPUT_DEFAULT_LANGUAGE_FROM = 'nl'
process.env.INPUT_DEFAULT_LANGUAGE_TO = 'en'
process.env.INPUT_FIELD_TO_TRANSLATE = 'Message,Second Field'
process.env.INPUT_FIELD_TO_TRANSLATE_STATUS = 'Translated Status'
process.env.INPUT_FIELD_TO_TRANSLATE_RESULT = 'Translated,Second Result'
process.env.INPUT_FIELD_TO_TRANSLATE_LANGUAGE = 'Language'
process.env.INPUT_DEFAULT_LANGUAGE_FROM = 'nl'
process.env.INPUT_DEFAULT_LANGUAGE_TO = 'en'

const ip = path.join(__dirname, 'index.js')
const options = {
  env: process.env
}

const ls = spawn('node', [ip], options)

ls.stdout.on('data', (data) => {
  process.stdout.write(`${data}`)
})

ls.stderr.on('data', (data) => {
  process.stdout.write(`${data}`)
})

ls.on('close', (code) => {
  console.log(`child process exited with code ${code}`)
})
