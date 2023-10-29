// import { useState } from 'react'

const Home = () => {
  // const [text, setText] = useState<string>("")

  return (
    <div>
      <h1>Dashboard</h1>
      <textarea
        id="editor"
        name="editor"
        rows={10}
        cols={80}
        // value={text}
        // onChange={(e) => setText(e.target.value)}
      />
    </div>
  )
}

export default Home