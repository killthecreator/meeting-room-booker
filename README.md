# Meeting Room Booker

React + TypeScript + Vite app for booking meeting rooms, with **Sign in with Google** (optionally restricted to a Google Workspace domain).

## Google SSO

1. In [Google Cloud Console](https://console.cloud.google.com/apis/credentials) create an **OAuth 2.0 Client ID** (Web application).
2. Add an **Authorized redirect URI**. It must match `GOOGLE_REDIRECT_URI` in `.env` exactly:
   - Dev (Vite proxy): `http://localhost:5173/api/auth/google/callback`
   - Production: `https://your-domain.com/api/auth/google/callback` (or your API origin if different).
3. Copy `.env.example` to `.env` and set:
   - `GOOGLE_REDIRECT_URI`: same URL you added in Google Console (e.g. `http://localhost:5173/api/auth/google/callback` in dev).
   - `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` from the OAuth client.
   - `ALLOWED_GOOGLE_DOMAIN`: your Google Workspace domain (e.g. `company.com`) to allow only that domain; leave empty to allow any Google account.
   - `SESSION_SECRET`: a long random string for signing sessions.
   - `FRONTEND_ORIGIN`: in dev `http://localhost:5173`, in production your app’s origin.
4. Run the backend: `npm run dev:server` (port 3001). Run the frontend: `npm run dev` (port 5173; proxies `/api` to the server).

## Restrict access to a specific network (e.g. office Wi‑Fi)

Browsers cannot tell a web app which Wi‑Fi you’re on. The server can instead allow only IP addresses from your network. When users connect to your office Wi‑Fi, they get an IP in that subnet.

1. Set **`ALLOWED_NETWORK`** in `.env` to your network’s IPv4 CIDR(s), comma-separated:
   - One subnet: `ALLOWED_NETWORK=192.168.1.0/24` (typical home/office: 192.168.1.1–254)
   - Several: `ALLOWED_NETWORK=192.168.1.0/24,10.0.0.0/8`
2. Find your Wi‑Fi’s subnet: on a device connected to that Wi‑Fi, run `ipconfig` (Windows) or `ifconfig` / `ip addr` (Mac/Linux) and note the local IP (e.g. 192.168.1.45). Use that network, e.g. 192.168.1.0/24.
3. If the request comes through a reverse proxy, the server uses the `X-Forwarded-For` header; ensure your proxy is trusted (`trust proxy` is enabled).

Requests from IPs outside the allowed range get **403** and the message: *Access allowed only from the allowed network (e.g. office Wi‑Fi).*

---

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
