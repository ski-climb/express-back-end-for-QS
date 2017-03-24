const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const environment = process.env.NODE_ENV || 'development';
const configuration = require('./knexfile')[environment];
const database = require('knex')(configuration);

function findFoodById(id) {
  return database.raw('select * from foods where id=?', [id])
}

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

app.set('port', process.env.PORT || 3000)
app.locals.title = "Foods CRUD"
app.locals.foodId = 1
app.locals.foods = {
  1: {
    name: "pie",
    calories: 200,
    visibility: "visible"
  },
  2: {
    name: "cake",
    calories: 123,
    visibility: "visible"
  }}


// ROOT
app.get('/', (request, response) => {
  response.send(app.locals.title)
})

// SHOW (read)
app.get('/api/foods/:id', (request, response) => {
  const id = request.params.id
  findFoodById(id).then((data) => {
    if (!data.rowCount) {
      return response.sendStatus(404)
    }
    response.json(data.rows)
  });
}) // end of SHOW

// INDEX (read)
app.get('/api/foods/', (request, response) => {
  database.raw('select * from foods')
  .then((data) => {
    if (!data.rowCount) {
      return response.sendStatus(404)
    }
    response.json(data.rows)
  });
}) // end of INDEX

// CREATE
app.post('/api/foods', (request, response) => {
  const food = request.body

  if (!food) {
    return response.status(422).send({
      error: "No food property provided."
    })
  } else {
    database.raw(
      'insert into foods (name, calories, visibility, created_at, updated_at) values (?, ?, ?, ?, ?) returning *',
      [food.name, food.calories, food.visibility, new Date, new Date]
    ).then((data) => {
      let newFood = data.rows[0]
      response.status(201).json(newFood)
    })
  }
}) // end CREATE

// UPDATE
app.put('/api/foods/:id', (request, response) => {
  const id = request.params.id
  const food = request.body

  database.raw('update foods set name = ?, calories = ?, visibility = ?, updated_at = ? where id=?',
    [food.name, food.calories, food.visibility, new Date, id])
  .then((data) => {
    if (data.rowCount) {
      findFoodById(id).then((data) => {
        return response.sendStatus(200)
      })
    } else {
      return response.sendStatus(204)
    }
  })
}) // end of UPDATE

// DELETE
app.delete('/api/foods/:id', (request, response) => {
  const id = request.params.id

  findFoodById(id).then((data) => {
    if (!data.rowCount) {
      return response.sendStatus(404)
    }
  });

  database.raw('delete from foods where id=?', [id])
  .then((data) => {
    response.status(200).end()
  });
}) // end of DELETE


if (!module.parent) {
  app.listen(app.get('port'), () => {
    console.log(`${app.locals.title} is running on ${app.get('port')}`)
  })
}
module.exports = app
