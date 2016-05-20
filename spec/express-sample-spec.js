var factory = require('../sqlite-data-storage-factory.js');

var appFactory = require('../express-sample/express-app-factory.js');

var promisify = require('promisify-node');

var superTest = require('supertest');

describe('express sample app', function() {
  it('super-test express sample app', function(done) {

    var app = appFactory();

    // TEST /get before /add to avoid initial timing issue
    superTest(app)
    .get('/get')
    .set('Content-Type', 'application/json')
    .send({key:'invalid-key'})
    .expect(function(res) {
      expect(res.status).toBe(400);
    })
    .expect(200, function() {

      superTest(app)
      .post('/add')
      .set('Content-Type', 'application/json')
      .send({key:'test-key', value: 'test-value'})
      .expect(function(res) {
        expect(res.status).toBe(200);
      })
      .expect(200, function() {

        superTest(app)
        .post('/add')
        .set('Content-Type', 'application/json')
        .send({key:'second-key', value: 'second-value'})
        .expect(function(res) {
          expect(res.status).toBe(200);
        })
        .expect(200, function() {

          superTest(app)
          .post('/delete')
          .set('Content-Type', 'application/json')
          .send({key:'test-key'})
          .expect(function(res) {
            expect(res.status).toBe(200);
          })
          .expect(200, function() {

            superTest(app)
            .get('/get')
            .set('Content-Type', 'application/json')
            .send({key:'second-key'})
            .expect(function(res) {
              expect(res.status).toBe(200);
              expect(res.text).toBe('second-value');
            })
            .expect(200, function() {

              superTest(app)
              .get('/get')
              .set('Content-Type', 'application/json')
              .send({key:'test-key'})
              .expect(function(res) {
                expect(res.status).toBe(400);
              })
              .expect(200, function() {

                superTest(app)
                .get('/changes')
                .set('Content-Type', 'application/json')
                .send({after: 1})
                .expect(function(res) {
                  expect(res.status).toBe(200);
                  expect(res.text).toBe(
                    '[{"id":2,"key":"second-key","type":"ADD","value":"second-value"},' +
                    '{"id":3,"key":"test-key","type":"DELETE","value":null}]');
                })
                .expect(200, done);

              })

            })

          })

        })

      })

    })

  });
});
