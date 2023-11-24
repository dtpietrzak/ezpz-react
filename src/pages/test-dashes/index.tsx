import { useNavigate, Page, useServer } from "ezpz"
import { PageConfig } from 'ezpz/types'

export const config: PageConfig = {}

const TestDashes = () => {
  const navigate = useNavigate()

  const [value, setLocalValue, setServerValue, statusOfValue] =
    useServer<string>('value', {
      loadFunction: async () => (
        (await fetch('http://localhost:3000/api')).json()
      ),
      updateFunction: async (data) => (
        (await fetch('http://localhost:3000/api', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: data })
        })).json()
      ),
    }, {
      serverSyncId: 'example_id',
      loadOn: 'client',
    })

  return (
    <Page config={config}>
      <h1>Test-Dash</h1>
      <textarea
        id="editor"
        name="editor"
        rows={10}
        cols={80}
        value={value}
        onChange={(e) => setLocalValue(e.target.value)}
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