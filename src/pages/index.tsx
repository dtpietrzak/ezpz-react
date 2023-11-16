import {
  useState,
  useServer,
  Link,
  Page,
  LoadHandler,
  useSkipServer,
} from 'ezpz'
import { PageConfig } from 'ezpz/types'
import Button from './_components/Button'
import { TextInput } from '@mantine/core'
import { Carousel } from '@mantine/carousel'

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
  const [text, setText] = useSkipServer(
    useState('test_thing'),
    ['string', () => { }],
  )

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
      loadOn: 'client',
    })

  return (
    <Page config={config} id='page_comp'>
      <h1>Home</h1>
      <h2>Value: {value}</h2>
      <TextInput
        id="editor"
        name="editor"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div>
        <Link to="/test-dashes/">Test Dashes</Link>
        <Link to="/dashboard/">Dashboard</Link>
      </div>
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
      <div className='w-64'>
        <Carousel withIndicators height={200}>
          <Carousel.Slide>1</Carousel.Slide>
          <Carousel.Slide>2</Carousel.Slide>
          <Carousel.Slide>3</Carousel.Slide>
        </Carousel>
      </div>
    </Page>
  )
}

export default Home