// Generated by CoffeeScript 1.10.0
(function() {
  var nextTick, root, sampleClientStorage, sampleClientStorageWrapper;

  root = this;

  nextTick = function(cb) {
    return setTimeout(cb, 0);
  };

  sampleClientStorageWrapper = function(state) {
    return {
      addItem: function(key, value, callback) {
        state.items[key] = value;
        state.addQ.push(key);
        nextTick(function() {
          return callback(null);
        });
      },
      deleteItem: function(key, callback) {
        var i;
        delete state.items[key];
        i = state.addQ.indexOf(key);
        if (i === -1) {
          state.deleteQ.push(key);
        } else {
          state.addQ.splice(i, 1);
        }
        nextTick(function() {
          return callback(null);
        });
      },
      getItem: function(key, callback) {
        var v;
        v = state.items[key];
        if (v === void 0) {
          nextTick(function() {
            return callback(new Error("Key " + key + " not found"));
          });
        } else {
          nextTick(function() {
            return callback(null, v);
          });
        }
      },
      syncChangesFromServer: function(changes, callback) {
        var change, j, len;
        if (changes.length === 0) {
          return nextTick(function() {
            return callback(new Error("Cannot sync with zero changes"));
          });
        }
        for (j = 0, len = changes.length; j < len; j++) {
          change = changes[j];
          if (change.type === 'DELETE') {
            delete state.items[change.key];
          } else {
            if ((state.deleteQ.indexOf(change.key)) === -1) {
              state.items[change.key] = change.value;
            }
          }
        }
        state.after = changes[changes.length - 1].id;
        return nextTick(function() {
          return callback(null);
        });
      },
      getSyncState: function(callback) {
        return nextTick(function() {
          return callback(null, {
            addQ: state.addQ,
            deleteQ: state.deleteQ,
            after: state.after
          });
        });
      },
      getChangesToFlush: function(callback) {
        var addkey, changes, deletekey, j, k, len, len1, ref, ref1;
        changes = [];
        ref = state.addQ;
        for (j = 0, len = ref.length; j < len; j++) {
          addkey = ref[j];
          changes.push({
            type: 'ADD',
            key: addkey,
            value: state.items[addkey]
          });
        }
        ref1 = state.deleteQ;
        for (k = 0, len1 = ref1.length; k < len1; k++) {
          deletekey = ref1[k];
          changes.push({
            type: 'DELETE',
            key: deletekey
          });
        }
        return nextTick(function() {
          return callback(null, changes);
        });
      },
      clearAddChangeForKey: function(key, callback) {
        var i;
        i = state.addQ.indexOf(key);
        if (i !== -1) {
          state.addQ.splice(i, 1);
          return nextTick(function() {
            return callback(null);
          });
        } else {
          return nextTick(function() {
            return callback(new Error("no add change for key " + key));
          });
        }
      },
      clearDeleteChangeForKey: function(key, callback) {
        var i;
        i = state.deleteQ.indexOf(key);
        if (i !== -1) {
          state.deleteQ.splice(i, 1);
          return nextTick(function() {
            return callback(null);
          });
        } else {
          return nextTick(function() {
            return callback(new Error("no add change for key " + key));
          });
        }
      }
    };
  };

  sampleClientStorage = function() {
    return sampleClientStorageWrapper({
      items: {},
      addQ: [],
      deleteQ: [],
      after: 0
    });
  };

  root.sampleClientStorageFacroty = module.exports = {
    sampleClientStorage: sampleClientStorage
  };

}).call(this);
