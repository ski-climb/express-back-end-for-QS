const assert = require('chai').assert
const app = require('../server')
const request = require('request')

describe('Server', () => {
  before((done) => {
    this.port = 9876
    this.server = app.listen(this.port, (error, result) => {
      if (error) { return done(error) }
      done()
    })

    this.request = request.defaults({
      baseUrl: 'http://localhost:9876'
    })
  })


  after(() => {
    this.server.close()
  })

  it('exists', () => { 
    assert(app)
  })

  // ROOT
  describe('GET /', () => {
    it('returns 200 status code', (done) => {
      this.request.get('/', (error, response) => {
        if (error) { done(error) }
        assert.equal(response.statusCode, 200)
        done()
      })
    })

    it('returns the name of the application', (done) => {
      this.request.get('/', (error, response) => {
        if (error) { done(error) }
        assert.equal(response.body, 'Foods CRUD')
        done()
      })
    })
  })

  // SHOW (read)
  describe('GET /api/foods/:id', (error, response) => {
    beforeEach(() => {
      app.locals.foods = {
        1: {
          name: "pie",
          calories: 200,
          visibility: "visible"
        }}
    })

    it('returns 404 when resource not found', (done) => {
      this.request.get('/api/foods/nope', (error, response) => {
        if (error) { done(error) }
        assert.equal(response.statusCode, 404)
        done()
      })
    })

    it('returns the food data for the food with that id', (done) => {
      this.request.get('/api/foods/1', (error, response) => {
        if (error) { done(error) }
        assert.include(response.body, "pie")
        assert.include(response.body, 200)
        assert.include(response.body, "visible")
        done()
      })
    })
  }) // end SHOW

  // INDEX (read)
  describe('GET /api/foods', (error, response) => {
    beforeEach(() => {
      app.locals.foods = {
        1: {
          name: "pie",
          calories: 200,
          visibility: "visible"
        },
        2: {
          name: "banana",
          calories: 123,
          visibility: "hidden"
        }
      }
    })
    it('returns the data for all foods', (done) => {
      this.request.get('/api/foods', (error, response) => {
        if (error) { done(error) }
        assert.include(response.body, "pie")
        assert.include(response.body, 200)
        assert.include(response.body, "visible")
        assert.include(response.body, "banana")
        assert.include(response.body, 123)
        assert.include(response.body, "hidden")
        done()
      })
    })
  })

  // CREATE
  describe('POST /api/foods', () => {
    beforeEach(() => {
      app.locals.foods = {}
    })

    it('should return a 201', (done) => {
      this.request.post('/api/foods', (error, response) => {
        if (error) { done(error) }
        assert.equal(response.statusCode, 201)
        done()
      })
    })

    it('should receive and store data', (done) => {
      const food = {
        name: "pie",
        calories: 200,
        visibility: "visible"
      }
      this.request.post('/api/foods', { form: food }, (error, response) => {
        if (error) { done(error) }
        const foodsCount = Object.keys(app.locals.foods).length
        assert.equal(foodsCount, 1)
        done()
      })
    })
  }) // end of CREATE

  // UPDATE
  describe('PUT /api/foods/:id', () => {
    beforeEach(() => {
      app.locals.foods = {
        1: {
          name: "pie",
          calories: 200,
          visibility: "visible"
        }
      }
    })

    it('should return a 200', (done) => {
      this.request.put('/api/foods/1', (error, response) => {
        if (error) { done(error) }
        assert.equal(response.statusCode, 200)
        done()
      })
    })

    it('should return a 404 when the food does not exist', (done) => {
      this.request.put('/api/foods/2', (error, response) => {
        if (error) { done(error) }
        assert.equal(response.statusCode, 404)
        done()
      })
    })

    it('should receive and update the data for the food with the given id', (done) => {
      const food = {
        name: "banana",
        calories: 123,
        visibility: "hidden"
      }
      this.request.put('/api/foods/1', { form: food }, (error, response) => {
        if (error) { done(error) }
        assert.notInclude(response.body, "pie")
        assert.notInclude(response.body, 200)
        assert.notInclude(response.body, "visible")
        assert.include(response.body, "banana")
        assert.include(response.body, 123)
        assert.include(response.body, "hidden")
        done()
      })
    })
  }) // end of UPDATE

  // DELETE
  describe('DELETE /api/foods/:id', () => {
    beforeEach(() => {
      app.locals.foods = {
        1: {
          name: "pie",
          calories: 200,
          visibility: "visible"
        }
      }
    })

    it('deletes the food data for the food with that id', (done) => {
      this.request.delete('/api/foods/1', (error, response) => {
        if (error) { done(error) }
        const foodsCount = Object.keys(app.locals.foods).length
        assert.equal(foodsCount, 0)
        done()
      })
    })
  }) // end DELETE
})
