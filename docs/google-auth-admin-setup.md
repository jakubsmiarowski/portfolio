# Google Auth setup dla `/admin`

Ten projekt używa Better Auth + Google OAuth do logowania do panelu admin.

## 1) Utwórz projekt w Google Cloud

1. Wejdź do [Google Cloud Console](https://console.cloud.google.com/).
2. Wybierz istniejący projekt albo kliknij `Select a project` -> `New Project`.
3. Zapisz nazwę projektu i upewnij się, że ten projekt jest aktywny w górnym pasku.

## 2) Skonfiguruj OAuth consent screen

1. Wejdź w `APIs & Services` -> `OAuth consent screen`.
2. Wybierz `External` (typowe dla prywatnej strony/portfolio).
3. Uzupełnij:
   - App name
   - User support email
   - Developer contact email
4. Zapisz ekran zgód.
5. Jeśli aplikacja jest w trybie testowym, dodaj konta admina jako `Test users`.

## 3) Utwórz OAuth Client ID (Web application)

1. Wejdź w `APIs & Services` -> `Credentials`.
2. Kliknij `Create Credentials` -> `OAuth client ID`.
3. `Application type`: `Web application`.
4. Ustaw `Authorized JavaScript origins`:
   - `http://localhost:3000`
   - `https://twoja-domena.pl`
5. Ustaw `Authorized redirect URIs`:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://twoja-domena.pl/api/auth/callback/google`
6. Zapisz i skopiuj `Client ID` oraz `Client Secret`.

Uwaga: redirect URI musi być identyczny co do protokołu (`http/https`), domeny, portu i ścieżki.

## 4) Ustaw zmienne środowiskowe aplikacji

W środowisku aplikacji (lokalnie i produkcyjnie) ustaw:

```env
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
BETTER_AUTH_URL=http://localhost:3000
OWNER_EMAILS=twoj.email@gmail.com
ADMIN_ISSUE_SECRET=losowy-dlugi-sekret
```

`OWNER_EMAILS` może mieć wiele adresów, rozdzielonych przecinkami.

## 5) Ustaw ten sam sekret w Convex

`ADMIN_ISSUE_SECRET` musi być taki sam po stronie aplikacji i Convexa.

```bash
npx convex env set ADMIN_ISSUE_SECRET "losowy-dlugi-sekret"
```

## 6) Weryfikacja

1. Uruchom aplikację (`pnpm dev`) i wejdź na `/admin`.
2. Gdy nie jesteś zalogowany, powinien pojawić się wyśrodkowany przycisk `Zaloguj przez Google`.
3. Zaloguj konto z `OWNER_EMAILS`:
   - dostęp do zakładek admina powinien działać.
4. Zaloguj konto spoza allowlisty:
   - powinien pojawić się ekran `Brak dostępu`.

## Najczęstsze błędy

- `redirect_uri_mismatch`
  - Sprawdź dokładnie URI callbacka w Google Cloud i `BETTER_AUTH_URL`.
- Ekran ostrzeżenia o niezweryfikowanej aplikacji
  - Dla trybu testowego dodaj konto do `Test users`.
- `Brak dostępu` mimo poprawnego logowania
  - Sprawdź `OWNER_EMAILS` (format, przecinki, literówki).
