const core = require('@actions/core')

const loadData = async ({ notion }) => {
  const translationDb = core.getInput('database')
  const input = core.getInput('field_to_translate')
  const status = core.getInput('field_to_translate_status')
  const result = core.getInput('field_to_translate_result')
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

  const rows = []

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

    if (!input || structure[input] !== 'rich_text') {
      error = true
      core.error(`The input field ${input} must exist and be of type "Text"`)
    }

    if (!result || structure[result] !== 'rich_text') {
      error = true
      core.error(`The result field ${result} must exist and be of type "Text"`)
    }

    if (!status || structure[status] !== 'checkbox') {
      error = true
      core.error(`The status field ${status} must exist and be of type "Checkbox"`)
    }

    await getDatabaseRows(translationDb, (row) => {
      if (!row.properties[status].checkbox) {
        rows.push(row)
      }
    })
  }

  if (error) {
    process.exit(1)
  }

  return {
    rows,
    fields: {
      input,
      status,
      result,
      language
    }
  }
}

exports.loadData = loadData
