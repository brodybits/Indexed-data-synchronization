var dataStorageFactory = require('../sqlite-data-storage-factory.js');

var clientFactory = require('../data-synchronization-client-factory.js');
var sampleClientStorageFactory = require('../sample-data-synchronization-client-storage-factory.js');

describe('basic synchronization client', function() {
  it('basic synchronization client functions', function(done) {
    expect(clientFactory).toBeDefined();
    expect(clientFactory.newClient).toBeDefined();

    expect(dataStorageFactory.newSQLiteDataStorage).toBeDefined();

    var server = dataStorageFactory.newSQLiteDataStorage(':memory:');
    expect(server).toBeDefined();

    var isOnline = true;

    var myServerProxy = {
      addItem: function(key, index_values, value, callback) {
        if (!isOnline) return callback(new Error("offline"));
        server.addStoreRecord('MyStore', key, index_values, value, callback);
      },
      deleteItem: function(key, callback) {
        if (!isOnline) return callback(new Error("offline"));
        server.deleteStoreRecord('MyStore', key, callback);
      },
      getChanges: function(after, callback) {
        if (!isOnline) return callback(new Error("offline"));
        server.getStoreChanges('MyStore', after, callback);
      }
    };

    var client = clientFactory.newClient(sampleClientStorageFactory.sampleClientStorage(), myServerProxy);
    expect(client).toBeDefined();

    server.addStore('MyStore', function(errorOrNull) {
      expect(errorOrNull).toBe(null);
      if (!!errorOrNull) return done();

      client.addItem('first-key', ['first-index0', 'first-index1'], 'first-value', function(errorOrNull) {
        expect(errorOrNull).toBe(null);
        if (!!errorOrNull) return done();

        client.getItemValue('first-key', function(errorOrNull, maybeValue) {
          expect(errorOrNull).toBe(null);
          if (!!errorOrNull) return done();

          expect(maybeValue).toBeDefined();
          expect(maybeValue).toBe('first-value');

          server.getStoreChanges('MyStore', 0, function(errorOrNull, maybeChanges) {
            expect(errorOrNull).toBe(null);
            if (!!errorOrNull) return done();

            expect(maybeChanges).toBeDefined();
            expect(maybeChanges.length).toBe(1);
            expect(maybeChanges[0].change_id).toBe(1);
            expect(maybeChanges[0].change_type).toBe('ADD');
            expect(maybeChanges[0].record_key).toBe('first-key');
            expect(maybeChanges[0].record_value).toBe('first-value');

            isOnline = false;

            client.addItem('second-key', ['second-index0', 'second-index1'], 'second-value', function(errorOrNull) {
              expect(errorOrNull).toBe(null);
              if (!!errorOrNull) return done();

              server.getStoreChanges('MyStore', 0, function(errorOrNull, maybeChanges) {
                expect(errorOrNull).toBe(null);
                if (!!errorOrNull) return done();

                // no new store changes:
                expect(maybeChanges).toBeDefined();
                expect(maybeChanges.length).toBe(1);
                expect(maybeChanges[0].change_id).toBe(1);
                expect(maybeChanges[0].change_type).toBe('ADD');
                expect(maybeChanges[0].record_key).toBe('first-key');
                expect(maybeChanges[0].record_value).toBe('first-value');

                isOnline = true;

                client.deleteItem('first-key', function(errorOrNull) {
                  expect(errorOrNull).toBe(null);
                  if (!!errorOrNull) return done();

                  // Inject change from another source:
                  server.addStoreRecord('MyStore', 'third-key', ['third-index0','third-index1'], 'third-value', function(errorOrNull) {
                    expect(errorOrNull).toBe(null);
                    if (!!errorOrNull) return done();

                    server.getStoreChanges('MyStore', 0, function(errorOrNull, maybeChanges) {
                      expect(errorOrNull).toBe(null);
                      if (!!errorOrNull) return done();

                      expect(maybeChanges).toBeDefined();
                      expect(maybeChanges.length).toBe(4);
                      expect(maybeChanges[0].change_id).toBe(1);
                      expect(maybeChanges[0].change_type).toBe('ADD');
                      expect(maybeChanges[0].record_key).toBe('first-key');
                      expect(maybeChanges[0].record_value).toBe('first-value');
                      expect(maybeChanges[1].change_id).toBe(2);
                      expect(maybeChanges[1].change_type).toBe('ADD');
                      expect(maybeChanges[1].record_key).toBe('second-key');
                      expect(maybeChanges[1].record_value).toBe('second-value');
                      expect(maybeChanges[2].change_id).toBe(3);
                      expect(maybeChanges[2].change_type).toBe('DELETE');
                      expect(maybeChanges[2].record_key).toBe('first-key');
                      expect(maybeChanges[3].change_id).toBe(4);
                      expect(maybeChanges[3].change_type).toBe('ADD');
                      expect(maybeChanges[3].record_key).toBe('third-key');
                      expect(maybeChanges[3].record_value).toBe('third-value');

                      client.getItemValue('second-key', function(errorOrNull, maybeValue) {
                        expect(errorOrNull).toBe(null);
                        if (!!errorOrNull) return done();

                        expect(maybeValue).toBeDefined();
                        expect(maybeValue).toBe('second-value');

                        client.getItemValue('first-key', function(errorOrNull, maybeValue) {
                          expect(errorOrNull).toBeDefined();
                          expect(errorOrNull).not.toBe(null);
                          expect(!!errorOrNull).toBe(true);
                          expect(maybeValue).not.toBeDefined();

                          client.getItemValue('invalid-key', function(errorOrNull, maybeValue) {
                            expect(errorOrNull).toBeDefined();
                            expect(errorOrNull).not.toBe(null);
                            expect(!!errorOrNull).toBe(true);
                            expect(maybeValue).not.toBeDefined();

                            client.sync(function(errorOrNull, maybeValue) {
                              expect(errorOrNull).toBe(null);
                              if (!!errorOrNull) return done();

                              client.getItemValue('third-key', function(errorOrNull, maybeValue) {
                                expect(errorOrNull).toBe(null);
                                if (!!errorOrNull) return done();

                                expect(maybeValue).toBeDefined();
                                expect(maybeValue).toBe('third-value');

                                client.getItemValuesForIndex(1, 'second-index1', function(errorOrNull, maybeValues) {
                                  expect(maybeValues).toBeDefined();
                                  expect(maybeValues.length).toBe(1);
                                  expect(maybeValues[0]).toBe('second-value');

                                  client.getItemValuesForIndex(1, 'third-index1', function(errorOrNull, maybeValues) {
                                    expect(maybeValues).toBeDefined();
                                    expect(maybeValues.length).toBe(1);
                                    expect(maybeValues[0]).toBe('third-value');

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
              });
            });
          });
        });
      });
    });

  });
});
