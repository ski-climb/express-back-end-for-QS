const express = require('express')
const app = express()
const Food = require('../models/food')

app.locals.title = "Foods CRUD"

function root(request, response) {
  response.send(app.locals.title)
}

function show(request, response) {
  const id = request.params.id
  Food.find(id).then((data) => {
    if (!data.rowCount) {
      return response.sendStatus(404)
    }
    response.json(data.rows[0])
  });
}

function index(request, response) {
  Food.all().then((data) => {
    if (!data.rowCount) {
      return response.sendStatus(404)
    }
    response.json(data.rows)
  });
}

function create(request, response) {
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
}

function update(request, response) {
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
}

function destroy(request, response) {
  const id = request.params.id

  Food.deleteFood(id).then((data) => {
    if (data.rowCount) {
      response.sendStatus(200)
    } else {
      response.sendStatus(204)
    }
  });
}

module.exports = {
  root: root,
  show: show,
  index: index,
  create: create,
  update: update,
  destroy: destroy
}
