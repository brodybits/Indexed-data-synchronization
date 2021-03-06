var factory = require('../sqlite-data-storage-factory.js');

var promisify = require('promisify-node');

describe('basic sqlite storage', function() {
  it('basic sqlite storage functions', function(done) {
    expect(factory.newSQLiteDataStorage).toBeDefined();

    var db = factory.newSQLiteDataStorage(':memory:');
    expect(db).toBeDefined();

    db.addStore('MyStore', function(errorOrNull) {
      expect(errorOrNull).toBe(null);
      if (!!errorOrNull) return done();

      db.addStoreRecord('MyStore', 'first-key', '', 'first-value', function(errorOrNull) {
        expect(errorOrNull).toBe(null);
        if (!!errorOrNull) return done();

        db.addStoreRecord('MyStore', 'second-key', '', 'second-value', function(errorOrNull) {
          expect(errorOrNull).toBe(null);
          if (!!errorOrNull) return done();

          db.deleteStoreRecord('MyStore', 'first-key', function(errorOrNull) {
            expect(errorOrNull).toBe(null);
            if (!!errorOrNull) return done();

            db.getStoreRecordValue('MyStore', 'second-key', function(errorOrNull, maybeValue) {
              expect(errorOrNull).toBe(null);
              if (!!errorOrNull) return done();

              expect(maybeValue).toBeDefined();
              expect(maybeValue).toBe('second-value');

              db.getStoreRecordValue('MyStore', 'first-key', function(errorOrNull, maybeValue) {
                expect(errorOrNull).toBeDefined();
                expect(errorOrNull).not.toBe(null);
                expect(!!errorOrNull).toBe(true);
                expect(maybeValue).not.toBeDefined();

                db.getStoreRecordValue('MyStore', 'invalid-key', function(errorOrNull, maybeValue) {
                  expect(errorOrNull).toBeDefined();
                  expect(errorOrNull).not.toBe(null);
                  expect(!!errorOrNull).toBe(true);
                  expect(maybeValue).not.toBeDefined();

                  // For client-side refresh request:
                  db.getStoreChanges('MyStore', 1, function(errorOrNull, maybeChanges) {
                    expect(errorOrNull).toBe(null);
                    if (!!errorOrNull) return done();

                    // EXPECTED RESULT:
                    expect(maybeChanges).toBeDefined();
                    expect(maybeChanges.length).toBe(2);
                    expect(maybeChanges[0].change_id).toBe(2);
                    expect(maybeChanges[0].change_type).toBe('ADD');
                    expect(maybeChanges[0].record_key).toBe('second-key');
                    expect(maybeChanges[0].record_value).toBe('second-value');
                    expect(maybeChanges[1].change_id).toBe(3);
                    expect(maybeChanges[1].change_type).toBe('DELETE');
                    expect(maybeChanges[1].record_key).toBe('first-key');

                    done();
                  });
                });
              });
            });
          });
        });
      });
    });
  });
});

describe('basic sqlite storage promisify-ed', function() {
  it('basic sqlite storage promisify functions', function(done) {
    var dbOrig = factory.newSQLiteDataStorage(':memory:');
    expect(dbOrig).toBeDefined();

    // Promisify the sqlite data storage object without mutating the original:
    var db = promisify(dbOrig, undefined, true);
    expect(db).toBeDefined();

    db.addStore('MyStore').then(function() {
      return db.addStoreRecord('MyStore', 'first-key', '', 'first-value');
    }).then(function() {
      return db.addStoreRecord('MyStore', 'second-key', '', 'second-value');

    }).then(function() {
      return db.deleteStoreRecord('MyStore', 'first-key');

    }).then(function() {
      return db.getStoreRecordValue('MyStore', 'second-key');
    }).then(function(value) {
      expect(value).toBe('second-value');

    }).then(null, function(error) {
      // UNEXPECTED ERROR:
      expect(false).toBe(true);
      expect(JSON.stringify(error)).toBe('--');
      done();

    }).then(function() {
      return db.getStoreRecordValue('MyStore', 'first-key');
    }).then(function(value) {
      // NOT EXPECTED:
      expect(false).toBe(true);
    }, function(error) {
      // EXPECTED RESULT:
      expect(true).toBe(true);
      return Promise.resolve();

    }).then(function() {
      return db.getStoreRecordValue('MyStore', 'invalid-key');
    }).then(function(value) {
      // NOT EXPECTED:
      expect(false).toBe(true);
    }, function(error) {
      // EXPECTED RESULT:
      expect(true).toBe(true);
      return Promise.resolve();

    }).then(function() {
      return db.getStoreChanges('MyStore', 1);
    }).then(function(changes) {
      // EXPECTED RESULT:
      expect(changes).toBeDefined();
      expect(changes.length).toBe(2);
      expect(changes[0].change_id).toBe(2);
      expect(changes[0].change_type).toBe('ADD');
      expect(changes[0].record_key).toBe('second-key');
      expect(changes[0].record_value).toBe('second-value');
      expect(changes[1].change_id).toBe(3);
      expect(changes[1].change_type).toBe('DELETE');
      expect(changes[1].record_key).toBe('first-key');

    }, function(error) {
      // UNEXPECTED ERROR:
      expect(false).toBe(true);
      expect(JSON.stringify(error)).toBe('--');
      done();

    }).then(done);
  });
});
