import { PageConfig } from "ezpz/types"

export const config: PageConfig = {}


const DashboardFeed = () => {
  // const [text, setText] = useState<string>("")

  return (
    <div>
      <h1>Dashboard Feed</h1>
      <textarea
        id="editor"
        name="editor"
        rows={10}
        cols={80}
        // value={text}
        // onChange={(e) => setText(e.target.value)}
      />
    </div>
  )
}

export default DashboardFeed