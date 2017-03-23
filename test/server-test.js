const assert = require('chai').assert
const app = require('../server')
const request = require('request')
const environment = process.env.NODE_ENV || 'development';
const configuration = require('../knexfile')[environment];
const database = require('knex')(configuration);

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
      database.raw(
        'insert into foods (name, calories, visibility, created_at, updated_at) values (?, ?, ?, ?, ?)',
        ['cupcakes', 333, 'visible', new Date, new Date]
      ).then(() => done());
    })

    afterEach((done) => {
      database.raw('truncate foods restart identity')
      .then(() => done());
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
      database.raw(
        'insert into foods (name, calories, visibility, created_at, updated_at) values (?, ?, ?, ?, ?)',
        ['pie', 333, 'visible', new Date, new Date]
      ).then(() => {
      database.raw(
        'insert into foods (name, calories, visibility, created_at, updated_at) values (?, ?, ?, ?, ?)',
        ['cupcakes', 123, 'hidden', new Date, new Date]
      ).then(() => done())
      })
    })

    afterEach((done) => {
      database.raw('truncate foods restart identity')
      .then(() => done());
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
      database.raw('truncate foods restart identity')
      .then(() => done())
    })

    afterEach((done) => {
      database.raw('truncate foods restart identity')
      .then(() => done())
    })

    it('should return a 201', (done) => {
      const food = {
        name: "pie",
        calories: 200,
        visibility: "visible"
      }
      this.request.post('/api/foods', {form: food }, (error, response) => {
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
        var foodsCount = 0
        database.raw('select * from foods')
        .then((data) => {
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
      database.raw(
        'insert into foods (name, calories, visibility, created_at, updated_at) values (?, ?, ?, ?, ?)',
        ['cupcakes', 333, 'visible', new Date, new Date]
      ).then(() => done());
    })

    afterEach((done) => {
      database.raw('truncate foods restart identity')
      .then(() => done());
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

    it('should return a 404 when the food does not exist', (done) => {
      const food = {
        name: "banana",
        calories: 123,
        visibility: "hidden"
      }
      this.request.put('/api/foods/999', {form: food }, (error, response) => {
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
      const id = 1
      var updated_food

      this.request.put('/api/foods/1', { form: food }, (error, response) => {
        if (error) { done(error) }

        let updatedFood = JSON.parse(response.body)[0]

        assert.equal(updatedFood.id, id)
        assert.equal(updatedFood.name, food.name)
        assert.equal(updatedFood.calories, food.calories)
        assert.equal(updatedFood.visibility, food.visibility)
        done()
      })
    })
  }) // end of UPDATE

  // DELETE
  describe('DELETE /api/foods/:id', () => {
    beforeEach((done) => {
      database.raw(
        'insert into foods (name, calories, visibility, created_at, updated_at) values (?, ?, ?, ?, ?)',
        ['cupcakes', 333, 'visible', new Date, new Date]
      ).then(() => done());
    })

    afterEach((done) => {
      database.raw('truncate foods restart identity')
      .then(() => done());
    })

    it('returns a 404 when the given id to delete does not exist', (done) => {
      this.request.delete('/api/foods/999', (error, response) => {
        assert.equal(response.statusCode, 404)
        done()
      })
    })

    it('deletes the food data for the food with that id', (done) => {
      this.request.delete('/api/foods/1', (error, response) => {
        if (error) { done(error) }
        var foodsCount;

        database.raw('select * from foods')
        .then((data) => {
          foodsCount = data.rowCount
        })
        .then(() => assert.equal(foodsCount, 0))
        .then(() => done())
      })
    })
  }) // end DELETE
})
