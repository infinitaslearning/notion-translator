const core = require('@actions/core')
const translator = require('translate')

let updatedRows = 0
let erroredRows = 0

const getTextFromRichText = (richText) => {
  if (richText && richText.length > 0) {
    return richText[0].plain_text.trim()
  } else {
    return ''
  }
}

const getTextFromMultiSelect = (multiSelect) => {
  return ''
}

const getText = (fieldProperties) => {
  if ('rich_text' in fieldProperties) {
    return getTextFromRichText(fieldProperties.rich_text)
  }
  if ('multi_select' in fieldProperties) {
    return getTextFromMultiSelect(fieldProperties.multi_select)
  }
  return ''
}

const getLanguage = (language) => {
  if (language.rich_text) {
    return getText(language.rich_text)
  }
  if (language.formula) {
    return language.formula[language.formula.type]
  }
  return ''
}

const translate = async ({ notion, rows, fields }) => {
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
  for (const row of rows) {
    const translations = {}
    const inputLanguage = fields.language ? getLanguage(row.properties[fields.language]) || defaultLanguageFrom : defaultLanguageFrom
    for (const input of fields.inputs) {
      const inputText = getText(row.properties[input])
      try {
        if (inputText) {
          translations[input] = inputText ? await translator(inputText, { from: inputLanguage, to: defaultLanguageTo }) : ''
        }
      } catch (ex) {
        core.error(`Error with translation ${ex.message} [${inputText} from ${inputLanguage} to ${defaultLanguageTo}]`)
        process.exit(1)
      }
    }
    await updateNotionRow(row, translations, { notion, fields })
  }
  core.info(`Completed with ${updatedRows} created and ${erroredRows} with errors`)
}

const updateNotionRow = async (row, translations, { notion, fields }) => {
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
