import { CLIENT_ID, REDIRECT_URI } from "../../authConfig.ts";

// According to the PKCE standard, a code verifier is a high-entropy
// cryptographic random string with a length between 43 and 128 characters.
// It can contain letters, digits, underscores, periods, hyphens, or tildes.
// We use the window.crypto API to generate a safe random series of number
// to randomly select from the list of valid characters. To simplify
// URL encoding at a later step, we use numbers and letters.
export function generateRandomString(length: number) {
  const validChars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let array = new Uint8Array(length);
  window.crypto.getRandomValues(array);
  array = array.map((x) => {
    return validChars.codePointAt(x % validChars.length) as number;
  });
  const randomState = String.fromCharCode.apply(null, [...array]);
  return randomState;
}

// Once the code verifier has been generated, we must hash it using
// SHA256. This is the value that will be sent within the user
// authorization request. Since our code is running in the browser, we
// don't have access to Node.js crypto libraries and we rely on the
// built in window.crypto API to generate the hash. Finally, we
// encode the hash into Base64 to later embed in the URL.
export async function generateCodeChallenge(codeVerifier: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const digest = await window.crypto.subtle.digest("SHA-256", data);

  return base64encode(digest);
}

function base64encode(arrayBuffer: ArrayBuffer) {
  const array = new Uint8Array(arrayBuffer);
  return btoa(String.fromCharCode.apply(null, [...array]))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function saveCodeVerifierLocally(codeVerifier: string) {
  localStorage.setItem("code_verifier", codeVerifier);
}

export function saveTokenLocally(token: string) {
  localStorage.setItem("access_token", token);
}

export function recallLocalCodeVerifier() {
  return localStorage.getItem("code_verifier");
}

export function recallLocalToken() {
  return localStorage.getItem("access_token");
}

export function generateURL(codeChallenge: string) {
  const state = generateRandomString(16);
  const scope = "user-read-private user-read-email";

  const args = new URLSearchParams({
    response_type: "code",
    client_id: CLIENT_ID,
    scope: scope,
    redirect_uri: REDIRECT_URI,
    state: state,
    code_challenge_method: "S256",
    code_challenge: codeChallenge,
  });

  return "https://accounts.spotify.com/authorize?" + args;
}

export async function getToken(codeVerifier: string, code: string) {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code: code,
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    code_verifier: codeVerifier,
  });

  fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body,
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("HTTP status " + response.status);
      }
      return response.json();
    })
    .then((data) => {
      console.log(data);
      localStorage.setItem("access_token", data.access_token);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

export async function getProfile(accessToken: string) {
  const response = await fetch("https://api.spotify.com/v1/me", {
    headers: {
      Authorization: "Bearer " + accessToken,
    },
  });
  const data = await response.json();
  console.log("Profile Response", data);
  return data;
}
