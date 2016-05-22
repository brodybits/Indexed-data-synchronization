root = @

nextTick = (cb) ->
  setTimeout cb, 0

sampleClientStorageWrapper = (state) ->
  addItem: (record_key, index_values, record_value, callback) ->
    state.items[record_key] = {index_values: index_values, record_value: record_value}
    state.addQ.push record_key
    nextTick -> callback null
    return

  deleteItem: (record_key, callback) ->
    delete state.items[record_key]
    i = state.addQ.indexOf record_key
    if i is -1
      # needs to be sync'd:
      state.deleteQ.push record_key
    else
      # was only added locally, do not sync:
      state.addQ.splice i, 1
    nextTick -> callback null
    return

  getItemValue: (item_key, callback) ->
    i = state.items[item_key]
    if i is undefined
      nextTick -> callback new Error "Key #{item_key} not found"
    else
      nextTick -> callback null, i.record_value
    return

  getItemValuesForIndex: (index, index_value, callback) ->
    values = []
    for itemKey of state.items
      item = state.items[itemKey]
      if index < item.index_values.length and item.index_values[index] is index_value
        values.push item.record_value
    nextTick -> callback null, values
    return

  syncChangesFromServer: (changes, callback) ->
    if changes.length is 0
      return nextTick -> callback new Error "Cannot sync with zero changes"

    for change in changes
      if change.change_type is 'DELETE'
        delete state.items[change.record_key]
      else
        if (state.deleteQ.indexOf change.record_key) is -1
          state.items[change.record_key] =
            index_values: change.index_values
            record_value: change.record_value

    state.after = changes[changes.length-1].change_id

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
        change_type: 'ADD'
        itemKey: addkey
        index_values: state.items[addkey].index_values
        itemValue: state.items[addkey].record_value

    for deletekey in state.deleteQ
      changes.push
        change_type: 'DELETE'
        itemKey: deletekey

    nextTick -> callback null, changes

  clearAddChangeForKey: (item_key, callback) ->
      i = state.addQ.indexOf item_key
      if i isnt -1
        state.addQ.splice i, 1
        nextTick -> callback null
      else
        nextTick -> callback new Error "no add change for item key " + itemKey

  clearDeleteChangeForKey: (itemKey, callback) ->
      i = state.deleteQ.indexOf itemKey
      if i isnt -1
        state.deleteQ.splice i, 1
        nextTick -> callback null
      else
        nextTick -> callback new Error "no delete change for item key " + itemKey

sampleClientStorage = () ->
  sampleClientStorageWrapper
    items: {}
    addQ: []
    deleteQ: []
    after: 0

root.sampleClientStorageFacroty = module.exports =
  sampleClientStorage: sampleClientStorage
