## Project setup

```bash
$ npm install
```

## Auth setup

The auth endpoints accept `users.email` as the login identifier, while tokens and
credentials are still linked to the stable `users.id`. Registration creates a new
row in `users` and then stores the password hash in `auth_credentials`:

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`

Register body:

```json
{
    "name": "",
    "surname": "",
    "username": "",
    "roleId": "role-id",
    "email": "",
    "password": ""
}
```

Login body:

```json
{
    "email": "",
    "password": ""
}
```

Token usage:

- `accessToken` is used for normal protected API requests. Send it as a bearer
  token:

```bash
Authorization: Bearer <accessToken>
```

- `refreshToken` is used only with `POST /api/v1/auth/refresh` to get a new token
  pair when the `accessToken` expires.
- `Access tokens` are short-lived. `Refresh tokens` are longer-lived, stored hashed in
  `refresh_tokens`, and rotated on every refresh.
- When `/auth/refresh` succeeds, replace both the old access token and old refresh
  token with the new values from the response.

## Swagger API docs

Swagger UI is available after starting the server:

```text
https://localhost:3000/api/docs
```

To call protected endpoints from Swagger:

1. Use `POST /api/v1/auth/register` or `POST /api/v1/auth/login`.
2. Copy the `accessToken` from the response.
3. Click the `Authorize` button at the top of Swagger UI.
4. Paste the token as:

```text
Bearer <accessToken>
```

5. Submit the authorization dialog, then call protected endpoints from the docs.

## Required environment variables:

```bash
SUPABASE_URL=change-me
SUPABASE_KEY=change-me-too
JWT_ACCESS_SECRET=change-me-too
JWT_REFRESH_SECRET=change-me-too
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=30d
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

```bash
$ fly deploy
```
