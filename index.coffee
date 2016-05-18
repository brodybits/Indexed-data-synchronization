sqlite3 = require 'sqlite3'

ADD = 'ADD'
DELETE = 'DELETE'

newSQLiteDataStorageWrapper = (db) ->
  addStore: (storeName, callback) ->
    db.run "CREATE TABLE #{storeName} (id INTEGER PRIMARY KEY AUTOINCREMENT, key TEXT, type TEXT, value TEXT)", (errorOrNull) =>
      if (!!errorOrNull)
        callback errorOrNull
      else
        # optimization:
        db.run "CREATE INDEX #{storeName}_KEY_INDEX on #{storeName} (key)", (errorOrNull) ->
          # ignore error in this case
          callback null
    return

  addStoreRecord: (storeName, key, value, callback) ->
    db.run "INSERT INTO #{storeName} (key, type, value) VALUES (?,?,?)", [key, ADD, value], callback
    return

  deleteStoreRecord: (storeName, key, callback) ->
    db.run "INSERT INTO #{storeName} (key, type) VALUES (?,?)", [key, DELETE], callback
    return

  getStoreRecord: (storeName, key, callback) ->
    db.all "SELECT type, value FROM #{storeName} WHERE key=?", [key], (errorOrNull, maybeRows) ->
      if (!!errorOrNull)
        return callback errorOrNull

      if !!maybeRows and maybeRows.length is 1 and maybeRows[0].type is ADD
        callback null, maybeRows[0].value

      else
        callback new Error "not found"
    return

  getStoreChanges: (storeName, after, callback) ->
    db.all "SELECT * FROM #{storeName} WHERE id>?", [after], callback

newSQLiteDataStorage = (dbname, opt_mode) ->
  newSQLiteDataStorageWrapper if !!opt_mode
    new sqlite3.Database(dbname, opt_mode)
  else
    new sqlite3.Database(dbname)

# XXX TODO:
module.exports =
  newSQLiteDataStorage: (dbname, opt_mode) -> newSQLiteDataStorage dbname, opt_mode
