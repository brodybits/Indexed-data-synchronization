root = @

flushChanges = (changes, clientStorage, serverProxy, callback) ->
  if changes.length is 0
    callback null
  else
    change = changes.shift()
    if change.type is 'DELETE'
      serverProxy.deleteItem change.key, (errorOrNull) ->
        if !!errorOrNull then return callback errorOrNull
        clientStorage.clearDeleteChangeForKey change.key, (errorOrNull) ->
          if !!errorOrNull then return callback errorOrNull
          flushChanges changes, clientStorage, serverProxy, callback

    else
      serverProxy.addItem change.key, change.value, (errorOrNull) ->
        if !!errorOrNull then return callback errorOrNull
        clientStorage.clearAddChangeForKey change.key, (errorOrNull) ->
          if !!errorOrNull then return callback errorOrNull
          flushChanges changes, clientStorage, serverProxy, callback

# FUTURE TBD: If changes are made during flush, should they be included as well?

flush = (clientStorage, serverProxy, callback) ->
  clientStorage.getChangesToFlush (errorOrNull, maybeChangesToFlush) ->
    if !!errorOrNull then return callback errorOrNull
    changes = maybeChangesToFlush
    flushChanges changes, clientStorage, serverProxy, callback

selfSync = (clientStorage, serverProxy, callback) ->
  clientStorage.getSyncState (errorOrNull, maybeSyncState) ->
    if !!errorOrNull then return callback errorOrNull

    serverProxy.getChanges maybeSyncState.after, (errorOrNull, maybeChanges) ->
      if !!errorOrNull then return callback errorOrNull

      if !maybeChanges || maybeChanges.length is 0
        flush clientStorage, serverProxy, callback
      else
        clientStorage.syncChangesFromServer maybeChanges, (error) ->
          flush clientStorage, serverProxy, callback

newClient = (clientStorage, serverProxy) ->
  addItem: (key, value, callback) ->
    clientStorage.addItem key, value, (errorOrNull) ->
      if !!errorOrNull then return callback errorOrNull

      selfSync clientStorage, serverProxy, (error_ignored) ->
        callback null

  deleteItem: (key, callback) ->
    clientStorage.deleteItem key, (errorOrNull) ->
      if !!errorOrNull then return callback errorOrNull

      selfSync clientStorage, serverProxy, (error_ignored) ->
        callback null

  getItem: clientStorage.getItem

  sync: (callback) ->
    selfSync clientStorage, serverProxy, callback

root.dataSynchronizationClientFactory = module.exports =
  newClient: newClient
