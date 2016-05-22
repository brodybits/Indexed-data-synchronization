# Indexed data synchronization

Author: Christopher J. Brody <brodybits@litehelpers.net>

License: ISC

I can hereby testify that this project is completely my own work and not subject to agreements with any other parties. In case of code written under direct guidance from sample code the link is given for reference. In case I accept contributions from any others I will require CLA with similar statements. The license may be changed at some point in the future.

Status: EXPERIMENTAL: WIP under development with API subject to change

## Data stored

Data is stored in key-value format along with optional index items. The key must be a globally unique string such as GUID, each indx item is a string, and the value is a JSON string.

Data with a unique key can be stored and optionally deleted at some point in time. Data for a key can never be changed and a key may not be reused once it is deleted.

Applications can store a large number of arbitrary data records with fields that are used to reference other records. The goal is to support multiple arbitrary nested collections with a higher-level client-side API. Mutable items would be simulated by adding attribute records that can be "overwritten" (delete the old and add the new).

## Storage Approach

Data is committed to a change log table on the server side. There are two types of changes:
- ADD a new key-value record
- DELETE a record for a key

A client keeps a local copy of the data and keeps track of which data has been successfully stored on the server.

## Implementation

The implementation is maintained in CoffeeScript which is compiled by the following command: `npm start`

One or more indexed key-value stores may be stored in a sqlite database using node-sqlite3.

A log table is CREATEd for each store.

There is a sample Express REST interface in the `express-sample` subdirectory. Note that Express is favored over just using Connect to support use with PassportJS.

FUTURE TBD: Swappable storage layers possible for SQLite, Postgres, redis, etc.

NOTICE: This project assumes a recent version of Node.js with a Promise implementation.

## API

Server-side:
- SQLite data storage layer: see `spec/sqlite-storage-spec.js` for API.
- Sample Express application

Client-side:
- data synchronization client factory with sample client-side storage stub, see `spec/client-synchronization-spec.js` for API
- TODO: sample client-side AJAX proxy

## Major TODOs

- Client-side storage using SQLite plugin/Web SQL/IndexedDB with failure-safe transactions
- Fix server-side to use failure-safe transactions (BEGIN/COMMIT/ROLLBACK)
- Document the API/usage
- Improve factory API consistency
- Improve/further testing of two-way client/server data synchronization
- Check that each key is really unique and that a record for a key is only deleted once
- More automatic testing, with emphasis on: error handling, verify key is really unique, delete for key that is not present or already deleted
- Distinguish temporary errors vs permanent errors during add/delete/sync
- Subscriptions to store changes (support some kind of a "notification" system)
- Periodic cleanup of old change history
- VACUUM or AUTOVACUUM

## Future TBD

May be in a higher-layer API library:
- Automatic conversion between Javascript value object and stored JSON string value
- Multi-user management
- Limited multi-user shared stores
- REST multi-user security using something like PassportJS
- Server-side data clustering

## Other FUTURE TBD

- Swappable storage layers possible for SQLite, Postgres, redis, etc.
- Replace CoffeeScript with ES5/ES6

## Other TODOs

- Drop store from a database

## References

Sources of inspiration:
- https://github.com/axemclion/IndexedDBShim
- http://www.confluent.io/blog/turning-the-database-inside-out-with-apache-samza/
- https://en.wikipedia.org/wiki/Internet_Message_Access_Protocol
