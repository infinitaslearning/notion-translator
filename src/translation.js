const core = require('@actions/core')
const translator = require('translate')

let updatedRows = 0
let erroredRows = 0

const getText = (richText) => {
  if (richText.length > 0) {
    return richText[0].plain_text
  } else {
    return ''
  }
}

// Configure translator
const translationEngine = core.getInput('translation_engine')
const translationKey = core.getInput('translation_key')
const translationUrl = core.getInput('translation_url')
if (translationEngine) {
  translator.engine = translationEngine
}
if (translationKey) {
  translator.key = translationKey
}
if (translationUrl) {
  translator.url = translationUrl
}
const defaultLanguageFrom = core.getInput('default_language_from')
const defaultLanguageTo = core.getInput('default_language_to')

const translate = async ({ notion, database, rows, fields }) => {
  for (const row of rows) {
    const translations = {}
    const inputLanguage = fields.language ? getText(row.properties[fields.language].rich_text) || defaultLanguageFrom : defaultLanguageFrom
    for (const input of fields.inputs) {
      const inputText = getText(row.properties[input].rich_text)
      try {
        translations[input] = inputText ? await translator(inputText, { from: inputLanguage, to: defaultLanguageTo }) : ''
      } catch (ex) {
        core.error(`Error with translation: ${ex.message}`)
        process.exit(1)
      }
    }
    await updateNotionRow(row, translations, { notion, database, fields })
  }
  core.info(`Completed with ${updatedRows} created and ${erroredRows} with errors`)
}

const updateNotionRow = async (row, translations, { notion, database, fields }) => {
  try {
    const properties = {}
    for (const input of fields.inputs) {
      if (translations[input]) {
        properties[fields.translations[input]] = {
          rich_text: [
            {
              text: {
                content: translations[input]
              }
            }
          ]
        }
      }
    }

    properties[fields.status] = {
      checkbox: true
    }
    await notion.pages.update({
      page_id: row.id,
      properties
    })
    updatedRows++
  } catch (ex) {
    erroredRows++
    core.warning(`Error updating row: ${ex.message} ...`)
  }
}

exports.translate = translate
