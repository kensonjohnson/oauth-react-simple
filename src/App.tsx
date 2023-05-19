import { useState } from "react";
import { generateState } from "./utils/auth";

function App() {
  const [state, setState] = useState(generateState());
  return (
    <>
      <h3>{state}</h3>
      <button
        onClick={() => {
          setState(generateState());
        }}
      >
        Generate New State
      </button>
    </>
  );
}

export default App;
