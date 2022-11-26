const core = require('@actions/core')
const { Client, LogLevel } = require('@notionhq/client')
const { loadData } = require('./data')
const { translate } = require('./translation')

try {
  const NOTION_TOKEN = core.getInput('notion_token')
  const database = core.getInput('database')

  core.debug('Creating notion client ...')
  const notion = new Client({
    auth: NOTION_TOKEN,
    logLevel: LogLevel.ERROR
  })

  console.log('here')

  const refreshData = async () => {
    core.startGroup('🗂️  Loading data to translate ...')
    const { rows, fields } = await loadData({ core, notion })
    core.info(`Found ${rows.length} rows in the database to translate`)
    core.endGroup()
    core.startGroup('🗂️  Translating ...')
    await translate({ core, notion, rows, fields, database })
    core.endGroup()
  }

  refreshData()
} catch (error) {
  core.setFailed(error.message)
}
