import { PageConfig, useNavigate, useState, Page } from "ezpz"

export const config: PageConfig = {}

const Home = () => {
  const navigate = useNavigate()
  const [text, setText] = useState<string>("")

  return (
    <Page config={config}>
      <h1>Test-Dashes</h1>
      <textarea
        id="editor"
        name="editor"
        rows={10}
        cols={80}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button 
        onClick={() => navigate(-1)}
      >
        Back
      </button>
    </Page>
  )
}

export default Home