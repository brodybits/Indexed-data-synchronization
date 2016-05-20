# Storage data synchronization

Author: Christopher J. Brody <brodybits@litehelpers.net>

License: ISC OR MIT

I can hereby testify that this project is completely my own work and not subject to agreements with any other parties. In case of code written under direct guidance from sample code the link is given for reference. In case I accept contributions from any others I will require CLA with similar statements. The license may be changed at some point in the future.

## Data stored

Data is stored in key-value format where:
- key is a unique string (should be something like a GUID)
- value is a JSON string

Data with a unique key can be stored and optionally deleted at some point in time. Data for a key can never be changed and a key may not be reused once it is deleted.

FUTURE: It will be possible to add additional index keys to make it easier to find arbitrary records.

Applications can store a large number of arbitrary data records with fields that are used to reference other records. The goal is to support arbitrary nested collections with a higher-level client-side API. Mutable items would be simulated by adding attribute records that can be deleted and "overwritten".

## Storage Approach

Data is committed to a change log table on the server side. There are two types of changes:
- ADD a new key-value record
- DELETE a record for a key

A client keeps a local copy of the data and keeps track of which data has been successfully stored on the server.

## Implementation

The implementation is maintained in CoffeeScript which is compiled by the following command: `npm start`

One or more key-value stores may be stored in a sqlite database using node-sqlite3.

A log table and a key index are CREATEd for each store.

There is a sample Express REST interface in the `express-sample` subdirectory. Note that Express is favored over just using Connect to support PassportJS in the future.

FUTURE TBD: Swappable storage layers possible for SQLite, Postgres, redis, etc.

FUTURE TODO:
- Client-side data synchronization library

NOTICE: This project assumes a recent version of Node.js with a Promise implementation.

## API

CURRENT: Server-side SQLite data storage layer only. See `spec/sqlite-storage-spec.js` for API.

FUTURE:
- Server-side: layers that can be assembled into an Express application with multi-user security
- Client-side: user-friendly 

## Major TODOs

- Document the API/usage
- Check that each key is really unique and that a record for a key is only deleted once
- Automatic testing, with emphasis on: error handling, verify key is really unique, delete for key that is not present or already deleted
- Additional indexed keys
- Subscriptions to store changes (support some kind of a "notification" system)
- Multi-user management
- Limited multi-user shared stores
- REST multi-user security using something like PassportJS
- Periodically cleanup old history
- VACUUM or AUTOVACUUM

## Other TODOs

- Drop store from a database
- Replace CoffeeScript with ES6

## References

- https://github.com/axemclion/IndexedDBShim (inspiration)
- http://www.confluent.io/blog/turning-the-database-inside-out-with-apache-samza/ (inspiration)
