import {
  useServer,
  Link,
  Page,
  LoadHandler,
  useServerState,
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

  const [value, setLocalValue, setServerValue, statusOfValue] =
    useServerState<string>('page_comp', '')

  return (
    <Page config={config} id='page_comp'>
      <h1>Home</h1>
      <h2>Value: {value}</h2>
      <TextInput
        id="editor"
        name="editor"
        value={value}
        onChange={(e) => setLocalValue(e.currentTarget.value)}
      />
      <div>
        <Link to="/test-dashes/">Test Dashes</Link>
        <Link to="/dashboard/">Dashboard</Link>
      </div>
      <Button
        onClick={() => setLocalValue(value)}
        disabled={statusOfValue !== 'success'}
      >
        Update Locally
      </Button>
      <Button
        onClick={() => setServerValue(value)}
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