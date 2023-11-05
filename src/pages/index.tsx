import {
  useState,
  useEffect,
  useServer,
  Link,
  Page,
  LoadHandler,
  PageConfig,
  FPC,
  LoadStatus,
} from 'ezpz'
import Button from './_components/Button';

export const config: PageConfig = {
  title: 'Home',
  description: 'Home page description',
}

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const SomeOtherThing = () => {
  return 'wow';
}

// you could make a provider that allows you to jump down levels
// add an option to useServer, like "contextKey"
// this has to be unique across the entire app
// then you can use that to jump down levels like:
// const [value, updateValue, statusOfValue] = useServerData<string>('contextKey')

// need to make a rule, whenever you use a server rendered useServer
// the initial value has to be the same as the server rendered value name
const Home = () => {
  const [text, setText] = useState<string>("wow")

  const [value, updateValue, statusOfValue] = useServer<string>('value', {
    loadFunction: async () => {
      await timeout(2000);
      return {
        data: new Date().toISOString(),
        status: 'success' as LoadStatus,
      }
    },
    updateFunction: async (data) => {
      await timeout(2000)
      return {
        data: typeof data === 'string' ? data : 'test',
        status: 'success',
      }
    },
  }, {
    loadOn: 'server'
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
      <Button
        onClick={() => updateValue(text)}
        disabled={statusOfValue !== 'success'}
      >
        Test out the updater
      </Button>
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