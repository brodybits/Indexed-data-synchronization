factory = require '../sqlite-data-storage-factory.js'

express = require 'express'
bodyParser = require 'body-parser'

promisify = require 'promisify-node'

start = (serverdb) ->
  app = express()
  app.use bodyParser.json()

  db = promisify serverdb, undefined, true

  # Installation/connectivity test function:
  app.post '/echoBody', (req, res) ->
    res.send req.body

  app.post '/addStoreRecord', (req, res) ->
    b = req.body
    db.addStoreRecord b.storeName, b.key, b.index_values, b.value
    .then ->
      res.status 200
      res.send()
    , (error) ->
      res.status 400
      res.send()

  app.post '/deleteStoreRecord', (req, res) ->
    b = req.body
    db.deleteStoreRecord b.storeName, b.key
    .then ->
      res.status 200
      res.send()
    , (error) ->
      res.status 400
      res.send()

  # XXX FUTURE TBD: Use GET with URL parameters instead
  app.post '/getStoreRecordValue', (req, res) ->
    b = req.body
    db.getStoreRecordValue b.storeName, b.key
    .then (value) ->
      res.send value
    , (error) ->
      res.status 400
      res.send()

  # XXX FUTURE TBD: Use GET with URL parameters instead
  app.post '/getStoreChanges', (req, res) ->
    b = req.body
    db.getStoreChanges b.storeName, b.after
    .then (changes) ->
      res.send changes
    , (error) ->
      res.status 400
      res.send()

module.exports = start
