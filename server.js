const express = require('express')
const app = express()
const bodyParser = require('body-parser')

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
  const food = app.locals.foods[id]

  if (!food) { return response.sendStatus(404) }

  response.send(food)
}) // end of SHOW

// INDEX (read)
app.get('/api/foods/', (request, response) => {
  const foods = app.locals.foods

  response.send(foods)
}) // end of INDEX

// CREATE
app.post('/api/foods', (request, response) => {
  const id = Date.now()
  const food = request.body

  if (!food) {
    return response.status(422).send({
      error: "No food property provided."
    })
  }
  app.locals.foods[id] = food
  response.status(201).json({
    id, food
  })
  response.status(201).end()
}) // end CREATE

// UPDATE
app.put('/api/foods/:id', (request, response) => {
  const id = request.params.id
  const food = request.body

  if (!app.locals.foods[id]) { return response.sendStatus(404) }
  if (!food) {
    return response.status(422).send({
      error: "No food property provided."
    })
  }

  app.locals.foods[id] = food
  response.status(200).json({
    id, food
  })
})

// DELETE
app.delete('/api/foods/:id', (request, response) => {
  const id = request.params.id
  delete app.locals.foods[id]
  response.status(200).end()
}) // end of DELETE


if (!module.parent) {
  app.listen(app.get('port'), () => {
    console.log(`${app.locals.title} is running on ${app.get('port')}`)
  })
}
module.exports = app
