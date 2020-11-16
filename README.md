# EPUB checker service

## The service

This standalone service exposes the functionality of checking the validity of a provided EPUB file. The API offered is as follows:

- `POST /api/auth`
- `POST /api/epubchecker`

1. As this service is meant to be from many clients, the first endpoint allows clients to acquire their access tokens in order to be able to use the service\*. A call to the `api/auth` endpoint considered valid if it contains the Authorization header with value `Basic base64encoded(clientId:clientSecret)`.  
   The response of a valid call to the `api/auth` will return an `accessToken`\*\* (JWT)
2. A call to the `api/epubchecker` in order to be considered valid should have the `Authorization` property in its headers with value `Bearer <the value of an accessToken provided by this service>`. The property `Content-Type` should be `multipart/form-data` and finally the body should contain the actual EPUB under a form field called `epub`.  
   The response of this endpoint will be a `JSON` object with two properties:

- `outcome`: String with value either `ok` or `not valid`
- `messages`: Array of `message` objects (when an EPUB is not valid, otherwise empty)  
  e.g.

```
{
    outcome:'not valid',
    messages:[
        {
            "ID": "RSC-005",
            "severity": "ERROR",
            "message": "Error while parsing file: attribute \"data-number\" not allowed here; expected attribute \"class\", \"dir\", \"id\", \"lang\", \"style\", \"title\" or \"xml:lang\"",
            "additionalLocations": 88,
            "locations": [
                {
                    "path": "EPUB/text/ch001_split_001.xhtml",
                    "line": 13,
                    "column": 58,
                    "context": null
                },
                {
                    "path": "EPUB/text/ch001_split_001.xhtml",
                    "line": 13,
                    "column": 70,
                    "context": null
                },
            ],
            "suggestion": null
        }
    ]
}
```

\*client's registration required beforehand  
\*\*the life span of an accessToken is 8 hours

## Starting the service

The service is fully dockerized for ease of use for either development or for use in production.

### Development

In the root of the service run `docker-compose up`  
This container includes the actual service as well as a Postgres DB

### Production

In the root of the service run `docker-compose -f docker-compose.production.yml up`
This container contains just the service. An external Postgres DB should be provided.

### Required env variables

```
PUBSWEET_SECRET (e.g. a random string used for hashing)
POSTGRES_USER (required for connection to the db)
POSTGRES_PASSWORD (required for connection to the db)
POSTGRES_HOST (required for connection to the db)
POSTGRES_DB (required for connection to the db)
POSTGRES_PORT (required for connection to the db)
SERVER_PORT (port where the server will be exposed)
NODE_ENV (development or production)
WAIT_SERVICE_PORT (e.g. localhost:5432)
```

All the above are required

## Creating client's credentials

When the service is up by executing `docker exec -it <name_of_the_epubchecker_server_container> yarn create:client`.  
The above will produce a valid pair of clientId and clientSecret

## Validation tool

This service is using the [epubcheck](https://github.com/w3c/epubcheck) validator provided by IDPF. The version of the validator that Editoria uses is 4.2.2.
