const process = require('process')
const { main } = require('./index.js')

jest.setTimeout(180000)

test('complete input should succeed with default inputs', async () => {
  process.env.INPUT_NOTION_TOKEN = process.env.NOTION_TOKEN
  process.env.INPUT_DATABASE = '3ea38518219c45dc8051c5c70b9de5ca'
  process.env.INPUT_TRANSLATION_ENGINE = 'google'
  process.env.INPUT_DEFAULT_LANGUAGE_FROM = 'nl'
  process.env.INPUT_DEFAULT_LANGUAGE_TO = 'en'
  process.env.INPUT_FIELD_TO_TRANSLATE = 'Message'
  process.env.INPUT_FIELD_TO_TRANSLATE_STATUS = 'Translated Status'
  process.env.INPUT_FIELD_TO_TRANSLATE_RESULT = 'Translated'
  process.env.INPUT_FIELD_TO_TRANSLATE_LANGUAGE = 'Language'
  expect(await main()).toBe(true)
})

test('complete input should succeed with default inputs on multi select fields', async () => {
  process.env.INPUT_NOTION_TOKEN = process.env.NOTION_TOKEN
  process.env.INPUT_DATABASE = '3ea38518219c45dc8051c5c70b9de5ca'
  process.env.INPUT_TRANSLATION_ENGINE = 'google'
  process.env.INPUT_DEFAULT_LANGUAGE_FROM = 'nl'
  process.env.INPUT_DEFAULT_LANGUAGE_TO = 'en'
  process.env.INPUT_FIELD_TO_TRANSLATE = 'Tags'
  process.env.INPUT_FIELD_TO_TRANSLATE_STATUS = 'Translated tag status'
  process.env.INPUT_FIELD_TO_TRANSLATE_RESULT = 'Translated tags'
  process.env.INPUT_FIELD_TO_TRANSLATE_LANGUAGE = 'Language tags'
  expect(await main()).toBe(true)
})
