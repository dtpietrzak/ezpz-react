import {
  useState,
  useServer,
  Link,
  Page,
  LoadHandler,
  useEffect,
} from 'ezpz'
import { PageConfig } from 'ezpz/types'
import Button from './_components/Button';

export const config: PageConfig = {
  title: 'Home',
  description: 'Home page description',
}

// you could make a provider that allows you to jump down levels
// add an option to useServer, like "contextKey"
// this has to be unique across the entire app
// then you can use that to jump down levels like:
// const [value, setLocalValue, setServerValue, statusOfValue] = useServerData<string>('contextKey')

const Home = () => {
  const [text, setText] = useState<string>("wow")

  useEffect(() => {
    console.log(text)
  }, [text])

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
      serverInitId: 'poop_nug',
      loadOn: 'server',
    })

  return (
    <Page config={config} id='page_comp'>
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
      <Link to="/test-dashes/">Test Dashes</Link>
      <Button
        onClick={() => setLocalValue(text)}
        disabled={statusOfValue !== 'success'}
      >
        Update Locally
      </Button>
      <Button
        onClick={() => setServerValue(text)}
        disabled={statusOfValue !== 'success'}
      >
        Update Server
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