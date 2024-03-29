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
  if (multiSelect && multiSelect.length > 0) {
    const values = []
    for (const value of multiSelect) {
      values.push(value.name)
    }
    return values
  } else {
    return []
  }
}

const getText = (fieldProperties) => {
  if (fieldProperties.rich_text) {
    return [getTextFromRichText(fieldProperties.rich_text)]
  }
  if (fieldProperties.multi_select) {
    return getTextFromMultiSelect(fieldProperties.multi_select)
  }
  return ''
}

const getLanguage = (language) => {
  if (language.rich_text) {
    return getTextFromRichText(language.rich_text)
  }
  if (language.formula) {
    return language.formula[language.formula.type]
  }
  return ''
}

function memoize (method) {
  const cache = {}
  return async function () {
    const args = JSON.stringify(arguments)
    cache[args] = cache[args] || method.apply(this, arguments)
    return cache[args]
  }
}

const cachedTranslator = memoize(async function (inputText, from, to) {
  return await translator(inputText, { from: from, to: to })
})

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
      const inputTexts = getText(row.properties[input])
      const rowTranslations = []
      for (const inputText of inputTexts) {
        try {
          if (inputText) {
            rowTranslations.push(inputText ? await cachedTranslator(inputText, inputLanguage, defaultLanguageTo) : '')
          }
        } catch (ex) {
          core.error(`Error with translation ${ex.message} [${inputText} from ${inputLanguage} to ${defaultLanguageTo}]`)
          throw ex
        }
      }
      translations[input] = rowTranslations
    }
    await updateNotionRow(row, translations, { notion, fields })
  }
  core.info(`Completed with ${updatedRows} created and ${erroredRows} with errors`)
}

const updateNotionRow = async (row, translations, { notion, fields }) => {
  try {
    const properties = {}
    for (const input of fields.inputs) {
      if (row.properties[input].rich_text && translations[input].length > 0) {
        const translation = translations[input][0]
        if (translation) {
          properties[fields.translations[input]] = {
            rich_text: [
              {
                text: {
                  content: translation
                }
              }
            ]
          }
        }
      } else if (row.properties[input].multi_select && translations[input].length > 0) {
        const translated = []
        for (const translation of translations[input]) {
          translated.push({ name: translation })
        }
        properties[fields.translations[input]] = {
          multi_select: translated
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
