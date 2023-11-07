import { useNavigate, useState, Page, useServer } from "ezpz"
import { PageConfig } from 'ezpz/types'

export const config: PageConfig = {}

const TestDashes = () => {
  const navigate = useNavigate()

  const [value, updateValue, statusOfValue] = useServer<string>('value', {
    loadFunction: async () => (
      (await fetch('http://localhost:3000/api')).json()
    ),
    updateFunction: async (data) => (
      (await fetch('http://localhost:3000/api', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({message: data})
      })).json()
    ),
  }, {
    loadOn: 'server',
  })

  return (
    <Page config={config}>
      <h1>Test-Dashes</h1>
      <textarea
        id="editor"
        name="editor"
        rows={10}
        cols={80}
        value={value}
      />
      <button 
        onClick={() => navigate(-1)}
      >
        Back
      </button>
    </Page>
  )
}

export default TestDashes