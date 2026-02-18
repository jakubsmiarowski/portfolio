# Spotify Widget Setup Guide (Convex)

This guide explains how to get:
- `SPOTIFY_CLIENT_ID`
- `SPOTIFY_CLIENT_SECRET`
- `SPOTIFY_REFRESH_TOKEN`

for the Convex-powered now-playing widget:
- query: `spotifyNowPlaying.getPublic`
- action: `spotifyNowPlaying.refresh`

## 1. Create a Spotify App

1. Open [Spotify Developer Dashboard](https://developer.spotify.com/dashboard).
2. Create a new app (or open an existing one).
3. In app settings, copy:
   - Client ID -> `SPOTIFY_CLIENT_ID`
   - Client Secret -> `SPOTIFY_CLIENT_SECRET`
4. Add this redirect URI:
   - `http://127.0.0.1:8888/callback`
5. Save settings.

Important:
- Redirect URI must match exactly in all steps.
- Use `127.0.0.1` (not `localhost`) to avoid redirect validation problems.
- If app is in Development mode, add your Spotify account in app Users Management.

## 2. Request Authorization Code

Open this URL in your browser (replace `YOUR_CLIENT_ID`):

```text
https://accounts.spotify.com/authorize?response_type=code&client_id=YOUR_CLIENT_ID&scope=user-read-currently-playing%20user-read-recently-played&redirect_uri=http%3A%2F%2F127.0.0.1%3A8888%2Fcallback&state=portfolio-widget&show_dialog=true
```

After accepting consent, you will be redirected to:

```text
http://127.0.0.1:8888/callback?code=...&state=portfolio-widget
```

Copy the `code` query parameter.

## 3. Exchange Code for Refresh Token

Run:

```bash
CLIENT_ID="YOUR_CLIENT_ID"
CLIENT_SECRET="YOUR_CLIENT_SECRET"
REDIRECT_URI="http://127.0.0.1:8888/callback"
CODE="PASTE_CODE_HERE"

BASIC_AUTH=$(printf '%s:%s' "$CLIENT_ID" "$CLIENT_SECRET" | base64 | tr -d '\n')

curl -sS -X POST "https://accounts.spotify.com/api/token" \
  -H "Authorization: Basic $BASIC_AUTH" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data-urlencode "grant_type=authorization_code" \
  --data-urlencode "code=$CODE" \
  --data-urlencode "redirect_uri=$REDIRECT_URI"
```

From the JSON response, copy:
- `refresh_token` -> `SPOTIFY_REFRESH_TOKEN`

Note: keep this refresh token secret.

## 4. Set Convex Environment Variables

Set Spotify secrets in Convex (this is where the refresh action runs):

```bash
npx convex env set SPOTIFY_CLIENT_ID YOUR_CLIENT_ID
npx convex env set SPOTIFY_CLIENT_SECRET YOUR_CLIENT_SECRET
npx convex env set SPOTIFY_REFRESH_TOKEN YOUR_REFRESH_TOKEN
```

Optional check:

```bash
npx convex env list
```

## 5. Run Convex + App

In one terminal:

```bash
npx convex dev
```

In another terminal:

```bash
pnpm dev
```

## 6. Verify

1. Open the homepage and confirm the now-playing widget renders track data.
2. Start/stop playback in Spotify and wait for widget refresh.
3. Expected states:
   - `status: "playing"` when playback is active
   - `status: "idle"` with most recently played track when nothing is currently playing
   - `status: "unavailable"` on auth/config/API issues

## 7. Troubleshooting

- `invalid_grant`
  - Code expired, already used, or redirect URI mismatch.
- `invalid_client`
  - Wrong client id/client secret pair.
- Widget stays `unavailable`
  - Missing Convex env vars, wrong refresh token, or missing scopes.
- 403/empty player data
  - User/app permissions or account restrictions; confirm app mode and allowlist.
- No refresh token returned
  - Re-run authorization with `show_dialog=true`.

## Reference Docs

- [Spotify Authorization Code Flow](https://developer.spotify.com/documentation/web-api/tutorials/code-flow/)
- [Spotify Refreshing Tokens](https://developer.spotify.com/documentation/web-api/tutorials/refreshing-tokens)
- [Spotify Scopes](https://developer.spotify.com/documentation/web-api/concepts/scopes)
- [Spotify Redirect URI Rules](https://developer.spotify.com/documentation/web-api/concepts/redirect_uri)
