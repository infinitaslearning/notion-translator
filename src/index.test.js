const path = require('path')
const process = require('process')
const cp = require('child_process')

jest.setTimeout(180000)

test('complete input should succeed with default inputs', () => {
  process.env.INPUT_NOTION_TOKEN = process.env.NOTION_TOKEN
  process.env.INPUT_DATABASE = '3ea38518219c45dc8051c5c70b9de5ca'
  process.env.INPUT_TRANSLATION_ENGINE = 'google'
  process.env.INPUT_DEFAULT_LANGUAGE_FROM = 'nl'
  process.env.INPUT_DEFAULT_LANGUAGE_TO = 'en'
  process.env.INPUT_FIELD_TO_TRANSLATE = 'Message'
  process.env.INPUT_FIELD_TO_TRANSLATE_STATUS = 'Translated Status'
  process.env.INPUT_FIELD_TO_TRANSLATE_RESULT = 'Translated'
  process.env.INPUT_FIELD_TO_TRANSLATE_LANGUAGE = 'Language'
  process.env.INPUT_DEFAULT_LANGUAGE_FROM = 'nl'
  process.env.INPUT_DEFAULT_LANGUAGE_TO = 'en'

  const ip = path.join(__dirname, 'index.js')
  const options = {
    env: process.env
  }
  const result = cp.execSync(`node ${ip}`, options).toString()
  expect(result).toBeDefined()
})
