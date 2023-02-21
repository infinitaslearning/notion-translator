const core = require('@actions/core')
const { Client, LogLevel } = require('@notionhq/client')
const { loadData } = require('./data')
const { translate } = require('./translation')

const main = async () => {
  try {
    const NOTION_TOKEN = core.getInput('notion_token')

    core.debug('Creating notion client ...')
    const notion = new Client({
      auth: NOTION_TOKEN,
      logLevel: LogLevel.ERROR
    })

    const refreshData = async () => {
      core.startGroup('🗂️  Loading data to translate ...')
      const { rows, fields } = await loadData({ core, notion })
      core.info(`Found ${rows.length} rows in the database to translate`)
      core.endGroup()
      core.startGroup(`🗂️  Translating ${rows.length} rows with ${fields.inputs.length} input fields ...`)
      await translate({ notion, rows, fields })
      core.endGroup()
    }
    await refreshData()
    return true
  } catch (error) {
    core.setFailed(error.message)
    return false
  }
}

if (require.main === module) {
  main()
}

exports.main = main
