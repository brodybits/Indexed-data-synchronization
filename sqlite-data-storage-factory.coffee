sqlite3 = require 'sqlite3'

ADD = 'ADD'
DELETE = 'DELETE'

newSQLiteDataStorageWrapper = (db) ->
  addStore: (storeName, callback) ->
    db.run "CREATE TABLE " + storeName +
           " (change_id INTEGER PRIMARY KEY AUTOINCREMENT, change_type TEXT," +
           " record_key TEXT, index_values TEXT, record_value TEXT)", (errorOrNull) ->
      if (!!errorOrNull)
        callback errorOrNull
      else
        # optimization:
        db.run "CREATE INDEX #{storeName}_KEY_INDEX on #{storeName} (record_key)", (errorOrNull) ->
          # ignore error in this case
          callback null
    return

  addStoreRecord: (storeName, record_key, index_values, record_value, callback) ->
    stored_index_values = if !!index_values
      JSON.stringify index_values
    else
      []

    db.run "INSERT INTO #{storeName} (change_type, record_key, index_values, record_value) VALUES (?,?,?,?)",
           [ADD, record_key, stored_index_values, record_value], callback
    return

  deleteStoreRecord: (storeName, record_key, callback) ->
    db.run "INSERT INTO #{storeName} (change_type, record_key) VALUES (?,?)", [DELETE, record_key], callback
    return

  getStoreRecordValue: (storeName, record_key, callback) ->
    db.all "SELECT change_type, record_value FROM #{storeName} WHERE record_key=?", [record_key], (errorOrNull, maybeRows) ->
      if (!!errorOrNull)
        return callback errorOrNull

      if !!maybeRows and maybeRows.length is 1 and maybeRows[0].change_type is ADD
        callback null, maybeRows[0].record_value

      else
        callback new Error "not found"
    return

  getStoreChanges: (storeName, after, callback) ->
    db.all "SELECT * FROM #{storeName} WHERE change_id>?", [after], (errorOrNull, maybeRows) ->
      if (!!errorOrNull)
        return callback errorOrNull

      changes = []
      for row in maybeRows
        my_index_values = if !!row.index_values and row.index_values.length isnt 0
          JSON.parse(row.index_values)
        else
          []

        changes.push
          change_id: row.change_id
          change_type: row.change_type
          record_key: row.record_key
          index_values: my_index_values
          record_value: row.record_value

      callback null, changes
    return

newSQLiteDataStorage = (dbname, opt_mode) ->
  newSQLiteDataStorageWrapper if !!opt_mode
    new sqlite3.Database(dbname, opt_mode)
  else
    new sqlite3.Database(dbname)

module.exports =
  newSQLiteDataStorage: newSQLiteDataStorage
