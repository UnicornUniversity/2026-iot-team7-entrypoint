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
  pair when the access token expires.
- Access tokens are short-lived. Refresh tokens are longer-lived, stored hashed in
  `refresh_tokens`, and rotated on every refresh.
- When `/auth/refresh` succeeds, replace both the old access token and old refresh
  token with the new values from the response.

Required environment variables:

```bash
JWT_ACCESS_SECRET=change-me
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
