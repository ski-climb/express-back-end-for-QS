const assert = require('chai').assert
const app = require('../server')
const request = require('request')
const Food = require('../lib/models/food')

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
    beforeEach((done) => {
      Food.createFood('cupcakes', 333, 'visible').then(() => done());
    })

    afterEach((done) => {
      Food.destroyAll().then(() => done());
    })

    it('returns 404 when resource not found', (done) => {
      this.request.get('/api/foods/999', (error, response) => {
        if (error) { done(error) }
        assert.equal(response.statusCode, 404)
        done()
      })
    })

    it('returns the food data for the food with that id', (done) => {
      const id = 1
      const food = {
        name: 'cupcakes',
        calories: 333,
        visibility: 'visible',
      }
      this.request.get('/api/foods/1', (error, response) => {
        if (error) { done(error) }

        let parsedFood = JSON.parse(response.body)[0]

        assert.equal(parsedFood.id, id)
        assert.equal(parsedFood.name, food.name)
        assert.equal(parsedFood.calories, food.calories)
        assert.equal(parsedFood.visibility, food.visibility)
        done()
      })
    })
  }) // end SHOW

  // INDEX (read)
  describe('GET /api/foods', (error, response) => {
    beforeEach((done) => {
      Food.createFood('pie', 333, 'visible').then(() => {
      Food.createFood('cupcakes', 123, 'hidden').then(() => done())
      })
    })

    afterEach((done) => {
      Food.destroyAll().then(() => done());
    })

    it('returns the data for all foods', (done) => {
      this.request.get('/api/foods', (error, response) => {
        if (error) { done(error) }
        let parsedFoods = JSON.parse(response.body)

        assert.equal(parsedFoods[0].name, "pie")
        assert.equal(parsedFoods[0].calories, 333)
        assert.equal(parsedFoods[0].visibility, "visible")
        assert.equal(parsedFoods[1].name, "cupcakes")
        assert.equal(parsedFoods[1].calories, 123)
        assert.equal(parsedFoods[1].visibility, "hidden")
        done()
      })
    })
  })

  // CREATE
  describe('POST /api/foods', () => {
    beforeEach((done) => {
      Food.destroyAll().then(() => done())
    })

    afterEach((done) => {
      Food.destroyAll().then(() => done())
    })

    it('should return a 201', (done) => {
      const food = {
        name: "pie",
        calories: 200,
        visibility: "visible"
      }
      this.request.post('/api/foods', {form: food }, (error, response) => {
        if (error) { done(error) }

        Food.findByName(food.name).then((data) => {
          assert.equal(data.rowCount, 1)
          assert.equal(response.statusCode, 201)
        })
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
        var foodsCount = 0
        Food.all().then((data) => {
          foodsCount = data.rowCount
        })
        .then(() => assert.equal(foodsCount, 1))
        .then(() => done())
      })
    })
  }) // end of CREATE

  // UPDATE
  describe('PUT /api/foods/:id', () => {
    beforeEach((done) => {
      Food.createFood('cupcakes', 333, 'visible').then(() => done());
    })

    afterEach((done) => {
      Food.destroyAll().then(() => done());
    })

    it('should return a 200', (done) => {
      const food = {
        name: "banana",
        calories: 123,
        visibility: "hidden"
      }
      this.request.put('/api/foods/1', {form: food }, (error, response) => {
        if (error) { done(error) }
        assert.equal(response.statusCode, 200)
        done()
      })
    })

    it('should return a 204 when the food does not exist', (done) => {
      const food = {
        name: "banana",
        calories: 123,
        visibility: "hidden"
      }
      this.request.put('/api/foods/999', {form: food }, (error, response) => {
        if (error) { done(error) }
        assert.equal(response.statusCode, 204)
        done()
      })
    })

    it('should receive and update the data for the food with the given id', (done) => {
      const food = {
        name: "banana",
        calories: 123,
        visibility: "hidden"
      }
      const id = 1
      var updatedFood

      this.request.put('/api/foods/1', { form: food }, (error, response) => {
        if (error) { done(error) }
        assert.equal(response.statusCode, 200)

        Food.find(id).then((data) => {
          updatedFood = data.rows[0]
          assert.equal(updatedFood.id, id)
          assert.equal(updatedFood.name, food.name)
          assert.equal(updatedFood.calories, food.calories)
          assert.equal(updatedFood.visibility, food.visibility)
        }).then(() => done())
      })
    })
  }) // end of UPDATE

  // DELETE
  describe('DELETE /api/foods/:id', () => {
    beforeEach((done) => {
      Food.createFood('cupcakes', 333, 'visible').then(() => done());
    })

    afterEach((done) => {
      Food.destroyAll().then(() => done());
    })

    it('returns a 204 when the given id to delete does not exist', (done) => {
      this.request.delete('/api/foods/999', (error, response) => {
        assert.equal(response.statusCode, 204)
        done()
      })
    })

    it('deletes the food data for the food with that id', (done) => {
      this.request.delete('/api/foods/1', (error, response) => {
        if (error) { done(error) }
        var foodsCount;

        Food.all().then((data) => {
          foodsCount = data.rowCount
        })
        .then(() => assert.equal(foodsCount, 0))
        .then(() => done())
      })
    })
  }) // end DELETE
})
