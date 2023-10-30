import { useState, useEffect, Link, LoadHandler, LoadStatus } from 'ezpz'

const Home = () => {
  const [text, setText] = useState<string>("wow")
  const [loadStatus, setLoadStatus] = useState<LoadStatus>('loading')

  useEffect(() => {
    console.log(text)
    setLoadStatus('success')
  }, [text])

  return (
    <div>
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
    </div>
  )
}

export default Home