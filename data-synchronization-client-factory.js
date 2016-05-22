// Generated by CoffeeScript 1.10.0
(function() {
  var flush, flushChanges, newClient, root, selfSync;

  root = this;

  flushChanges = function(changes, clientStorage, serverProxy, callback) {
    var change;
    if (changes.length === 0) {
      return callback(null);
    } else {
      change = changes.shift();
      if (change.change_type === 'DELETE') {
        return serverProxy.deleteItem(change.itemKey, function(errorOrNull) {
          if (!!errorOrNull) {
            return callback(errorOrNull);
          }
          return clientStorage.clearDeleteChangeForKey(change.itemKey, function(errorOrNull) {
            if (!!errorOrNull) {
              return callback(errorOrNull);
            }
            return flushChanges(changes, clientStorage, serverProxy, callback);
          });
        });
      } else {
        return serverProxy.addItem(change.itemKey, change.itemValue, function(errorOrNull) {
          if (!!errorOrNull) {
            return callback(errorOrNull);
          }
          return clientStorage.clearAddChangeForKey(change.itemKey, function(errorOrNull) {
            if (!!errorOrNull) {
              return callback(errorOrNull);
            }
            return flushChanges(changes, clientStorage, serverProxy, callback);
          });
        });
      }
    }
  };

  flush = function(clientStorage, serverProxy, callback) {
    return clientStorage.getChangesToFlush(function(errorOrNull, maybeChangesToFlush) {
      var changes;
      if (!!errorOrNull) {
        return callback(errorOrNull);
      }
      changes = maybeChangesToFlush;
      return flushChanges(changes, clientStorage, serverProxy, callback);
    });
  };

  selfSync = function(clientStorage, serverProxy, callback) {
    return clientStorage.getSyncState(function(errorOrNull, maybeSyncState) {
      if (!!errorOrNull) {
        return callback(errorOrNull);
      }
      return serverProxy.getChanges(maybeSyncState.after, function(errorOrNull, maybeChanges) {
        if (!!errorOrNull) {
          return callback(errorOrNull);
        }
        if (!maybeChanges || maybeChanges.length === 0) {
          return flush(clientStorage, serverProxy, callback);
        } else {
          return clientStorage.syncChangesFromServer(maybeChanges, function(error) {
            return flush(clientStorage, serverProxy, callback);
          });
        }
      });
    });
  };

  newClient = function(clientStorage, serverProxy) {
    return {
      addItem: function(itemKey, itemValue, callback) {
        return clientStorage.addItem(itemKey, itemValue, function(errorOrNull) {
          if (!!errorOrNull) {
            return callback(errorOrNull);
          }
          return selfSync(clientStorage, serverProxy, function(error_ignored) {
            return callback(null);
          });
        });
      },
      deleteItem: function(itemKey, callback) {
        return clientStorage.deleteItem(itemKey, function(errorOrNull) {
          if (!!errorOrNull) {
            return callback(errorOrNull);
          }
          return selfSync(clientStorage, serverProxy, function(error_ignored) {
            return callback(null);
          });
        });
      },
      getItemValue: clientStorage.getItemValue,
      sync: function(callback) {
        return selfSync(clientStorage, serverProxy, callback);
      }
    };
  };

  root.dataSynchronizationClientFactory = module.exports = {
    newClient: newClient
  };

}).call(this);
