import { useState } from "react";
import { generateRandomString } from "./utils/auth";
import { ListGroup, Button, Stack } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  const [state, setState] = useState(generateRandomString(64));
  return (
    <>
      <ListGroup>
        <ListGroup.Item>
          <Stack gap={2} direction="horizontal">
            <div className="h-100">
              <p className="mt-3">{state}</p>
            </div>
            <div className="vr" />
            <Button
              variant="secondary"
              onClick={() => {
                setState(generateRandomString(64));
              }}
            >
              Generate New State
            </Button>
          </Stack>
        </ListGroup.Item>
      </ListGroup>
    </>
  );
}

export default App;
