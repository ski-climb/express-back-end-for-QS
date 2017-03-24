const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const Food = require('./lib/models/food')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

app.set('port', process.env.PORT || 3000)
app.locals.title = "Foods CRUD"

// ROOT
app.get('/', (request, response) => {
  response.send(app.locals.title)
})

// SHOW (read)
app.get('/api/foods/:id', (request, response) => {
  const id = request.params.id
  Food.find(id).then((data) => {
    if (!data.rowCount) {
      return response.sendStatus(404)
    }
    response.json(data.rows)
  });
}) // end of SHOW

// INDEX (read)
app.get('/api/foods/', (request, response) => {
  Food.all().then((data) => {
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
    Food.createFood(food.name, food.calories, food.visibility).then((data) => {
      let newFood = data.rows[0]
      response.status(201).json(newFood)
    })
  }
}) // end CREATE

// UPDATE
app.put('/api/foods/:id', (request, response) => {
  const id = request.params.id
  const food = request.body

  Food.update(id, food.name, food.calories, food.visibility)
  .then((data) => {
    if (data.rowCount) {
      Food.find(id).then((data) => {
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

  Food.deleteFood(id).then((data) => {
    if (data.rowCount) {
      response.sendStatus(200)
    } else {
      response.sendStatus(204)
    }
  });
}) // end of DELETE


if (!module.parent) {
  app.listen(app.get('port'), () => {
    console.log(`${app.locals.title} is running on ${app.get('port')}`)
  })
}
module.exports = app
