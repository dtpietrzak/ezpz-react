import { useNavigate, Page, useServer, useServerSync } from "ezpz"
import { PageConfig } from 'ezpz/types'

export const config: PageConfig = {}

const TestDashes = () => {
  const navigate = useNavigate()

  const [value, setLocalValue, setServerValue, statusOfValue, reloadValue] =
    useServerSync<string>('page_comp', '', {})

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
        onClick={() => setServerValue(value)}
      >
        SAVE ON SERVER
      </button>
      <button
        onClick={() => reloadValue()}
      >
        Load from server
      </button>
      <button
        onClick={() => navigate(-1)}
      >
        Back
      </button>
    </Page>
  )
}

export default TestDashes