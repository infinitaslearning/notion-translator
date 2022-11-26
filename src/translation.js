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

const defaultLanguageFrom = core.getInput('default_language_from')
const defaultLanguageTo = core.getInput('default_language_to')

const translate = async ({ notion, database, rows, fields }) => {
  for (const row of rows) {
    const inputText = getText(row.properties[fields.input].rich_text)
    const inputLanguage = fields.language ? getText(row.properties[fields.language].rich_text) || defaultLanguageFrom : defaultLanguageFrom
    const translatedText = inputText ? await translator(inputText, { from: inputLanguage, to: defaultLanguageTo }) : ''
    await updateNotionRow(row, translatedText, { notion, database, fields })
  }
  core.info(`Completed with ${updatedRows} created and ${erroredRows} with errors`)
}

const updateNotionRow = async (row, translatedText, { notion, database, fields }) => {
  try {
    const properties = {}
    properties[fields.result] = {
      rich_text: [
        {
          text: {
            content: translatedText
          }
        }
      ]
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
