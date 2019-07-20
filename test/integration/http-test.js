let path = require('path')
let tiny = require('tiny-json-http')
let test = require('tape')
let sandbox = require('../../src')
let {http} = require('../../src')

let client
test('env', t=> {
  t.plan(2)
  t.ok(sandbox, 'got sandbox')
  t.ok(http, 'got http')
  // set the default port
  process.env.PORT = 3333
})

/**
 * Test sandbox http in isolation
 */
test('http.start', t=> {
  t.plan(1)
  // move to test/mock
  process.chdir(path.join(__dirname, 'mock', 'normal'))
  client = http.start(function() {
    t.ok(true, '@http mounted')
  })
})

test('get /', t=> {
  t.plan(2)
  tiny.get({
    url: 'http://localhost:3333/'
  }, function _got(err, data) {
    if (err) t.fail(err)
    else {
      t.ok(true, 'got /')
      t.ok(data.body.startsWith('Hello world!'), 'is hello world')
      console.log({data})
    }
  })
})

// TODO possibly some POST/PUT/PATCH/DELETE tests?

test('http.close', t=> {
  t.plan(1)
  client.close()
  t.ok(true, 'http connection closed')
})

/**
 * Test loading index without defining get /
 */
test('http.start', t=> {
  t.plan(1)
  process.chdir(path.join(__dirname, 'mock', 'no-index'))
  client = http.start(function() {
    t.ok(true, '@http mounted')
  })
})

test('get / without defining get /', t=> {
  t.plan(1)
  tiny.get({
    url: 'http://localhost:3333/'
  }, function _got(err, data) {
    if (err) {
      t.equals(err.statusCode, 502, 'Got 502 for missing function')
    }
    else t.fail(data)
  })
})

test('http.close', t=> {
  t.plan(1)
  client.close()
  t.ok(true, 'http connection closed')
})

/**
 * Test to ensure sandbox loads without defining @http
 */
let end
test('sandbox.start', t=> {
  t.plan(1)
  process.chdir(path.join(__dirname, 'mock', 'no-http'))
  sandbox.start({}, function(err, close) {
    if (err) t.fail(err)
    else {
      end = close
      t.ok(true, 'sandbox started')
    }
  })
})

test('get / without defining @http', t=> {
  t.plan(1)
  tiny.get({
    url: 'http://localhost:3333/'
  }, function _got(err, data) {
    if (err) {
      t.equals(err.code, 'ECONNREFUSED', 'Connection refused')
    }
    else t.fail(data)
  })
})

test('sandbox.close', t=> {
  t.plan(1)
  end()
  t.ok(true, 'http connection closed')
})