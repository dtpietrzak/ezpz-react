import {
  Link,
  Page,
  LoadHandler,
  useServerSync,
} from 'ezpz'
import { PageConfig } from 'ezpz/types'
import Button from './_components/Button'
import { TextInput } from '@mantine/core'
import { Carousel } from '@mantine/carousel'

export const config: PageConfig = {
  title: 'Home', 
  description: 'Home page description',
}

const Home = () => {

  const [value, setLocalValue, setServerValue, statusOfValue] =
    useServerSync<string>('page_comp', '', {})

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