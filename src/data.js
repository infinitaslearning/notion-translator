const core = require('@actions/core')

const loadData = async ({ notion }) => {
  const translationDb = core.getInput('database')
  const input = core.getInput('field_to_translate')
  const result = core.getInput('field_to_translate_result')
  const status = core.getInput('field_to_translate_status')
  const language = core.getInput('field_to_translate_language')

  const getDatabaseRows = async (databaseId, rowFunction, startCursor) => {
    try {
      const pageRows = await notion.databases.query({
        database_id: databaseId,
        start_cursor: startCursor
      })
      pageRows.results.forEach(rowFunction)
      if (pageRows.has_more) {
        return await getDatabaseRows(databaseId, rowFunction, pageRows.next_cursor)
      }
    } catch (ex) {
      error = true
      core.error(`Failed to retrieve data: ${ex.message}`)
    }
  }

  const inputs = input.split(',').map((field) => { return field.trim() })
  const results = result.split(',').map((field) => { return field.trim() })

  const rows = []
  const translations = {}

  let error = false

  if (translationDb) {
    // Get core DB structure
    const dbStructure = await notion.databases.retrieve({
      database_id: translationDb
    })

    const structure = {}
    Object.keys(dbStructure.properties).forEach((property) => {
      structure[dbStructure.properties[property].name] = dbStructure.properties[property].type
    })

    const checkField = (field, types, typeDescriptions) => {
      if (!field || !types.includes(structure[field])) {
        error = true
        core.error(`The field ${field} must exist in the Notion database and be of types: ${typeDescriptions} but instead found ${structure[field]}`)
      }
    }

    if (inputs.length !== results.length) {
      error = true
      core.error(`You have mismatched input (${inputs.length}) and result (${results.length}) settings - they need to be the same length!`)
    }

    for (let i = 0; i < inputs.length; i++) {
      translations[inputs[i]] = results[i]
      checkField(inputs[i], ['rich_text', 'multi_select'], ['Text', 'Multi-Select'])
      checkField(results[i], ['rich_text', 'multi_select'], ['Text', 'Multi-Select'])
      if (structure[inputs[i]] !== structure[results[i]]) {
        error = true
        core.error(`Input field and result field must be of the same type, but found (${structure[inputs[i]]}) != (${structure[results[i]]})`)
      }
    }

    checkField(status, 'checkbox', 'Checkbox')

    await getDatabaseRows(translationDb, (row) => {
      if (!row.properties[status].checkbox) {
        rows.push(row)
      }
    })
  }

  if (error) {
    throw new Error('Errors happened during loading of the data')
  }

  return {
    rows,
    fields: {
      inputs,
      status,
      translations,
      language
    }
  }
}

exports.loadData = loadData
