factory = require '../sqlite-data-storage-factory.js'

express = require 'express'
bodyParser = require 'body-parser'

promisify = require 'promisify-node'

DEFAULT_DB_NAME = ':memory:'
DEFAULT_STORE_NAME = 'MyStore'

start = (dbname = DEFAULT_DB_NAME, storeName = DEFAULT_STORE_NAME) ->
  app = express()
  app.use bodyParser.json()

  db1 = factory.newSQLiteDataStorage dbname
  db = promisify db1, undefined, true
  db.addStore storeName

  app.post '/echoBody', (req, res) ->
    res.send req.body

  app.post '/add', (req, res) ->
    b = req.body
    db.addStoreRecord storeName, b.key, b.value
    .then ->
      res.status 200
      res.send()
    , (error) ->
      res.status 400
      res.send()

  app.post '/delete', (req, res) ->
    b = req.body
    db.deleteStoreRecord storeName, b.key
    .then ->
      res.status 200
      res.send()
    , (error) ->
      res.status 400
      res.send()

  app.get '/get', (req, res) ->
    b = req.body
    db.getStoreRecord storeName, b.key
    .then (value) ->
      res.send value
    , (error) ->
      res.status 400
      res.send()

  app.get '/changes', (req, res) ->
    b = req.body
    db.getStoreChanges storeName, b.after
    .then (changes) ->
      res.send changes
    , (error) ->
      res.status 400
      res.send()

module.exports = start
