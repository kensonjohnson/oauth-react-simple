import { useState, useEffect } from "react";
import {
  generateRandomString,
  generateCodeChallenge,
  saveCodeVerifierLocally,
  recallLocalCodeVerifier,
  generateURL,
  getToken,
  recallLocalToken,
  getProfile,
} from "./utils/auth";
import { ListGroup, Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  const [codeVerifier, setCodeVerifier] = useState(generateRandomString(64));
  const [hashedCodeVerifier, setHashedCodeVerifier] = useState("");
  const [codeChallenge, setCodeChallenge] = useState("");
  const [URL, setURL] = useState("");
  const [code, setCode] = useState("N/A");
  const [token, setToken] = useState("");
  const [profile, setProfile] = useState();

  async function hashCode(codeVerifier: string) {
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const digest = await window.crypto.subtle.digest("SHA-256", data);
    const array = new Uint8Array(digest);
    return array.join("");
  }

  function performOAuth() {
    if (URL !== "") {
      window.location.href = URL;
    }
  }

  useEffect(() => {
    // Check for codeVerifier in localstorage
    const codeVerifier = recallLocalCodeVerifier();
    if (codeVerifier) {
      setCodeVerifier(codeVerifier);
    } else {
      saveCodeVerifierLocally(generateRandomString(64));
    }

    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    if (code) {
      setCode(code);
    }
    // check for token
    let storedToken = recallLocalToken();
    if (storedToken) {
      setToken(storedToken);
    } else {
      // check for URL parameters
      if (codeVerifier && code) {
        setCode(code);
        getToken(codeVerifier, code);
        storedToken = recallLocalToken();
        setToken(storedToken as string);
      }
    }

    if (!profile && storedToken) {
      getProfile(storedToken).then((data) => {
        console.log("Data in App.tsx: ", data);
        setProfile(data);
      });
    }
  }, []);

  // Update hash using codeVerifier as input
  useEffect(() => {
    hashCode(codeVerifier).then((hash) => {
      setHashedCodeVerifier(hash);
    });
    generateCodeChallenge(codeVerifier).then((challenge) => {
      setCodeChallenge(challenge);
      setURL(generateURL(challenge));
    });
  }, [codeVerifier]);

  return (
    <>
      <ListGroup>
        <ListGroup.Item>
          <div className="d-flex gap-5 justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-5">
              <h3>Code Verifier:</h3>
              <div>{codeVerifier}</div>
            </div>
            <Button
              variant="secondary"
              onClick={() => {
                const codeVerifier = generateRandomString(64);
                setCodeVerifier(codeVerifier);
                saveCodeVerifierLocally(codeVerifier);
              }}
            >
              Generate New State
            </Button>
          </div>
        </ListGroup.Item>
        <ListGroup.Item>
          <div className="d-flex gap-4 align-items-center">
            <h3>SHA256 Hashed:</h3>
            <div>{hashedCodeVerifier}</div>
          </div>
        </ListGroup.Item>
        <ListGroup.Item>
          <div className="d-flex gap-4 align-items-center">
            <h3>Base64 Encoded:</h3>
            <div>{codeChallenge}</div>
          </div>
        </ListGroup.Item>
        <ListGroup.Item>
          <div className="d-flex gap-4 align-items-center">
            <h3>Final URL:</h3>
            <div>{URL}</div>
          </div>
        </ListGroup.Item>
        <ListGroup.Item>
          <Button variant="success" onClick={performOAuth}>
            Login
          </Button>
        </ListGroup.Item>
        <ListGroup.Item>
          <div className="d-flex gap-4 align-items-center">
            <h3>Code Recieved:</h3>
            <div>{code}</div>
          </div>
        </ListGroup.Item>
        <ListGroup.Item>
          <div className="d-flex gap-4 align-items-center">
            <h3>Response Token:</h3>
            <div>{token}</div>
          </div>
        </ListGroup.Item>
        <ListGroup.Item>
          <div className="d-flex gap-4 align-items-center">
            <h3>Profile Name:</h3>
            {/* @ts-expect-error */}
            <div>{profile && profile.display_name}</div>
          </div>
        </ListGroup.Item>
        <ListGroup.Item>
          <div className="d-flex gap-4 align-items-center">
            <h3>Profile Email:</h3>
            {/* @ts-expect-error */}
            <div>{profile && profile.email}</div>
          </div>
        </ListGroup.Item>
        <ListGroup.Item>
          <div className="d-flex gap-4 align-items-center">
            <h3>Profile Country:</h3>
            {/* @ts-expect-error */}
            <div>{profile && profile.country}</div>
          </div>
        </ListGroup.Item>
      </ListGroup>
    </>
  );
}

export default App;
