# Teamboard Socket Service

**teamboard-io** is a [socket.io](http://socket.io) based service for
Teamboard to enable real-time communication and collaboration.

## Dependencies

**teamboard-io** depends on [teamboard-api](https://github.com/N4SJAMK/teamboard-api)
to be installed and running. Please refer to the API's README on how to install
and run it. This service depends on having a [redis](http://redis.io) up and
running to be used as a `MemoryStore`.

## Installation

Install with npm:
```
npm install N4SJAMK/teamboard-io
```

### Setup

If you are running this locally for development purposes, `NODE_ENV` must be set
to `development`. If `NODE_ENV` is not set, it defaults to `development`.

If you set `NODE_ENV` to `production`, you must provide the additional
environmental variables:

- `API_URL` corresponding to a running instance of `teamboard-api`.
- `REDIS_HOST` and `REDIS_PORT` corresponding to a running instance of `redis`.

You can also specify `PORT` in which the service will then reside, defaults to
`9001`.

### Running

Run with:
```
npm start
```

## Testing

Run tests with:
```
npm test
```
