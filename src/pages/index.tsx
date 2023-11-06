import {
  useState,
  useEffect,
  useServer,
  Link,
  Page,
  LoadHandler,
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
// const [value, updateValue, statusOfValue] = useServerData<string>('contextKey')

// need to make a rule, whenever you use a server rendered useServer
// the initial value has to be the same as the server rendered value name
const Home = () => {
  const [text, setText] = useState<string>("wow")

  const [value, updateValue, statusOfValue] = useServer<string>('value', {
    loadFunction: async () => (
      (await fetch('http://localhost:3000/api')).json()
    ),
    updateFunction: async (data) => (
      (await fetch('http://localhost:3000/api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: data
        })
      })).json()
    ),
  }, {
    loadOn: 'server'
  })

  const [poop, updatePoop, statusOfPoop] = useServer<string>('value', {
    loadFunction: async () => (
      (await fetch('http://localhost:3000/api')).json()
    ),
    updateFunction: async (data) => (
      (await fetch('http://localhost:3000/api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: data
        })
      })).json()
    ),
  }, {
    loadOn: 'client'
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
        value={text + poop}
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