# Notion Database Translator

This action will go through a Notion database (with specific fields), and translate a column for you.

## Notion integration and token

First, you need to have an integration access token - which you can get from https://www.notion.so/my-integrations after creating an integration.  Give the integration a friendly name like 'Github Actions'.

By default integrations cant access any content so you you *must* share your database (or the parent page / tree it is contained within) with the integration you created earlier to be able to access it.

## Notion Databases

This action expects a Notion database with the following properties, this will become the 

  - Input: text, multi-selection
  - Result: text, multi-selection
  - Status: checkbox
  - Language: text  

You can set the names of these columns to be whatever you like (see below).

You can see an example here: https://infinitaslearning.notion.site/Translator-3785106f94ab40d2ab4a607aec32e3b3

## Usage

This is typically deployed as a scheduled action:

```yaml
name: Notion Translator
on:
  schedule:
    - cron:  '30 5 * * *'
  workflow_dispatch:
jobs:
  catalog:
    runs-on: ubuntu-latest
    steps:
     - name: Notion Translator  
       uses: infinitaslearning/notion-translator@main        
       with:          
         notion_token: ${{ secrets.NOTION_TOKEN }}
         database: 2b26b4290cc84d95ad3e93c3255277a1    
         translation_engine: 'deepl'
         translation_key: ${{ secrets.DEEPL_KEY }}
         translation_url: 'api-free.deepl.com'
         default_language_from: nl
         default_language_to: en
         field_to_translate: 'Input'
         field_to_translate_status: 'Status'
         field_to_translate_result: 'Result'
         field_to_translate_language: 'Language'

```
https://www.notion.so/infinitaslearning/01bc4d5bf56842d3bf0dd78623b1a000?v=9864fa167f1f442baa10839f06a45912
The `Language` column is optional - only use it if the language can vary by row.

To get the database ID, simply browse to it, click on the '...' in Notion, and get a 'Copy link'.  The GUID at the end of the URL (but before the `?v=`) is the id, this works on both embedded and full page databases.

### Multiple Columns

You can translate multiple columns using comma separated lists of the same length for input and output:

```
field_to_translate: 'Input 1, Input 2'
field_to_translate_result: 'Result 1, Result 2'
```

## Development

Assumes you have `@vercel/ncc` installed globally.
After changes ensure you `npm run build`, commit and then submit a PR.

For the tests to run you need to have the environment variables set for GITHUB_TOKEN, NOTION_TOKEN and NOTION_DATABASE.
