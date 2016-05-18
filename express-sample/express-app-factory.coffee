i = require '../index.js'

express = require 'express'
bodyParser = require 'body-parser'

promisify = require 'promisify-node'

start = ->
  MY_DB_NAME = ':memory:'
  MY_STORE_NAME = 'MyStore'

  app = express()
  app.use bodyParser.json()

  db1 = i.newSQLiteDataStorage MY_DB_NAME
  db = promisify db1, undefined, true
  db.addStore MY_STORE_NAME

  app.post '/echoBody', (req, res) ->
    res.send req.body

  app.post '/add', (req, res) ->
    b = req.body
    db.addStoreRecord MY_STORE_NAME, b.key, b.value
    .then ->
      res.status 200
      res.send()
    , (error) ->
      res.status 400
      res.send()

  app.post '/delete', (req, res) ->
    b = req.body
    db.deleteStoreRecord MY_STORE_NAME, b.key
    .then ->
      res.status 200
      res.send()
    , (error) ->
      res.status 400
      res.send()

  app.get '/get', (req, res) ->
    b = req.body
    db.getStoreRecord MY_STORE_NAME, b.key
    .then (value) ->
      res.send value
    , (error) ->
      res.status 400
      res.send()

  app.get '/changes', (req, res) ->
    b = req.body
    db.getStoreChanges MY_STORE_NAME, b.after
    .then (changes) ->
      res.send changes
    , (error) ->
      res.status 400
      res.send()

module.exports = start
