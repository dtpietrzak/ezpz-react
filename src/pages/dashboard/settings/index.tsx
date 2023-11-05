import { PageConfig } from "ezpz"

export const config: PageConfig = {}


const DashboardSettings = () => {
  // const [text, setText] = useState<string>("")

  return (
    <div>
      <h1>Dashboard Settings</h1>
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

export default DashboardSettings