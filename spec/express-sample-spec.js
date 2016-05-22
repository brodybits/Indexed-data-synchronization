var factory = require('../sqlite-data-storage-factory.js');

var appFactory = require('../express-sample/express-app-factory.js');

var promisify = require('promisify-node');

var superTest = require('supertest');

describe('express sample app', function() {
  it('super-test express sample app', function(done) {

    var db = factory.newSQLiteDataStorage(':memory:');
    expect(db).toBeDefined

    var app = appFactory(db);

    superTest(app)
    .post('/echoBody')
    .set('Content-Type', 'application/json')
    .send({a:1})
    .expect(function(res) {
      expect(res.status).toBe(200);
      expect(res.text).toBe('{"a":1}');
    })
    .expect(200, function() {

      db.addStore('MyStore', function(errorOrNull) {
        expect(errorOrNull).toBe(null);
        if (!!errorOrNull) return done();

        superTest(app)
        .post('/addStoreRecord')
        .set('Content-Type', 'application/json')
        .send({storeName: 'MyStore', key:'test-key', value: 'test-value'})
        .expect(function(res) {
          expect(res.status).toBe(200);
        })
        .expect(200, function() {

          superTest(app)
          .post('/addStoreRecord')
          .set('Content-Type', 'application/json')
          .send({storeName: 'MyStore', key:'second-key', value: 'second-value'})
          .expect(function(res) {
            expect(res.status).toBe(200);
          })
          .expect(200, function() {

            superTest(app)
            .post('/deleteStoreRecord')
            .set('Content-Type', 'application/json')
            .send({storeName: 'MyStore', key:'test-key'})
            .expect(function(res) {
              expect(res.status).toBe(200);
            })
            .expect(200, function() {

              superTest(app)
              .post('/getStoreRecordValue')
              .set('Content-Type', 'application/json')
              .send({storeName: 'MyStore', key:'second-key'})
              .expect(function(res) {
                expect(res.status).toBe(200);
                expect(res.text).toBe('second-value');
              })
              .expect(200, function() {

                superTest(app)
                .post('/getStoreRecordValue')
                .set('Content-Type', 'application/json')
                .send({storeName: 'MyStore', key:'test-key'})
                .expect(function(res) {
                  expect(res.status).toBe(400);
                })
                .expect(200, function() {

                  superTest(app)
                  .post('/getStoreChanges')
                  .set('Content-Type', 'application/json')
                  .send({storeName: 'MyStore', after: 1})
                  .expect(function(res) {
                    expect(res.status).toBe(200);
                    expect(res.text).toBe(
                      '[{"change_id":2,"change_type":"ADD","record_key":"second-key","record_value":"second-value"},' +
                      '{"change_id":3,"change_type":"DELETE","record_key":"test-key","record_value":null}]');
                  })
                  .expect(200, done);

                })

              })

            })

          })

        })

      })

    })

  });
});
