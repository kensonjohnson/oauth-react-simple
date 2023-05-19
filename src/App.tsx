import { useState } from "react";
import { generateRandomString } from "./utils/auth";

function App() {
  const [state, setState] = useState(generateRandomString(64));
  return (
    <>
      <h3>{state}</h3>
      <button
        onClick={() => {
          setState(generateRandomString(64));
        }}
      >
        Generate New State
      </button>
    </>
  );
}

export default App;
