import {
  useState,
  useEffect,
  useServer,
  Link,
  Page,
  LoadHandler,
  LoadStatus,
  PageConfig,
} from 'ezpz'

export const config: PageConfig = {
  title: 'Home',
}

export const server = () => {

}

const Home = () => {
  const [text, setText] = useState<string>("wow")
  const [loadStatus, setLoadStatus] = useState<LoadStatus>('loading')

  const [value, setValue, statusOfValue] = useServer('testInit', {
    loadFunction: async () => {
      return {
        data: 'test',
        status: 'success',
      }
    },
    updateFunction: async (data) => {
      return {
        data,
        status: 'success',
      }
    }
  })

  useEffect(() => {
    console.log(text, value, 'from useEffect')
    setLoadStatus('success')
  }, [text, value])

  return (
    <Page config={config}>
      <h1>Home</h1>
      <textarea
        id="editor"
        name="editor"
        rows={10}
        cols={80}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button
        onClick={() => console.log("clicked")}
      >
        <Link to="/test-dashes/">Test Dashes</Link>
      </button>
      <LoadHandler
        status={loadStatus}
        loading={<div>loading...</div>}
        success={<div>success!</div>}
      />
    </Page>
  )
}

export default Home