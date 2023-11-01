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

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const Home = () => {
  const [text, setText] = useState<string>("wow")

  const [value, setValue, statusOfValue] = useServer('testInit', {
    loadFunction: async () => {
      await timeout(2000);
      return {
        data: 'test',
        status: 'success',
      }
    },
    updateFunction: async (data) => {
      await timeout(2000)
      return {
        data: typeof data === 'string' ? data : 'test',
        status: 'success',
      }
      // return {
      //   error: 'something went wrong',
      //   status: 'error',
      // }
    },
  }, {
    loadOn: 'server',
  })

  useEffect(() => {
    console.log(text, value, 'from useEffect')
  }, [text, value])

  return (
    <Page config={config}>
      <h1>Home</h1>
      <h2>Value: {value}</h2>
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
      <button
        onClick={() => setValue(text)}
        disabled={statusOfValue !== 'success'}
      >
        Test out the updater
      </button>
      <LoadHandler
        status={statusOfValue}
        init={<div>init...</div>}
        loading={<div>loading...</div>}
        success={<div>success!</div>}
        error={<div>error!</div>}
      />
    </Page>
  )
}

export default Home



// find "export default (.*)"

// replace "const $1 = () => {"
// with "const $1 = async () => {"

// find const \[(.*), (.*), (.*)\] = useServer(.*)(
// replace with const [$1, $2, $3] = await useServerAsync(.*)(

// save this as the file to be used for the server side stuff