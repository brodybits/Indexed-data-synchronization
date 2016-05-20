root = @

nextTick = (cb) ->
  setTimeout cb, 0

sampleClientStorageWrapper = (state) ->
  addItem: (key, value, callback) ->
    state.items[key] = value
    state.addQ.push key
    nextTick -> callback null
    return

  deleteItem: (key, callback) ->
    delete state.items[key]
    i = state.addQ.indexOf key
    if i is -1
      # needs to be sync'd:
      state.deleteQ.push key
    else
      # was only added locally, do not sync:
      state.addQ.splice i, 1
    nextTick -> callback null
    return

  getItem: (key, callback) ->
    v = state.items[key]
    if v is undefined
      nextTick -> callback new Error "Key #{key} not found"
    else
      nextTick -> callback null, v
    return

  syncChangesFromServer: (changes, callback) ->
    if changes.length is 0
      return nextTick -> callback new Error "Cannot sync with zero changes"

    for change in changes
      if change.type is 'DELETE'
        delete state.items[change.key]
      else
        if (state.deleteQ.indexOf change.key) is -1
          state.items[change.key] = change.value

    state.after = changes[changes.length-1].id

    nextTick -> callback null

  getSyncState: (callback) ->
    nextTick ->
      callback null,
        addQ: state.addQ
        deleteQ: state.deleteQ
        after: state.after

  getChangesToFlush: (callback) ->
    changes = []
    for addkey in state.addQ
      changes.push
        type: 'ADD'
        key: addkey
        value: state.items[addkey]

    for deletekey in state.deleteQ
      changes.push
        type: 'DELETE'
        key: deletekey

    nextTick -> callback null, changes

  clearAddChangeForKey: (key, callback) ->
      i = state.addQ.indexOf key
      if i isnt -1
        state.addQ.splice i, 1
        nextTick -> callback null
      else
        nextTick -> callback new Error "no add change for key " + key

  clearDeleteChangeForKey: (key, callback) ->
      i = state.deleteQ.indexOf key
      if i isnt -1
        state.deleteQ.splice i, 1
        nextTick -> callback null
      else
        nextTick -> callback new Error "no add change for key " + key

sampleClientStorage = () ->
  sampleClientStorageWrapper
    items: {}
    addQ: []
    deleteQ: []
    after: 0

root.sampleClientStorageFacroty = module.exports =
  sampleClientStorage: sampleClientStorage
