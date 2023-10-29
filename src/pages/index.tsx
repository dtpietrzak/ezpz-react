import { useState, useEffect, Link } from 'ezpz'

const Home = () => {
  const [text, setText] = useState<string>("wow")

  useEffect(() => {
    console.log(text)
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
    </div>
  )
}

export default Home