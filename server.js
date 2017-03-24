const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const Food = require('./lib/models/food')
const FoodsController = require('./lib/controllers/foods-controller')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

app.set('port', process.env.PORT || 3030)

// ROOT
app.get('/', FoodsController.root)

// SHOW (read)
app.get('/api/foods/:id', FoodsController.show)

// INDEX (read)
app.get('/api/foods/', FoodsController.index)

// CREATE
app.post('/api/foods', FoodsController.create)

// UPDATE
app.put('/api/foods/:id', FoodsController.update)

// DELETE
app.delete('/api/foods/:id', FoodsController.destroy)


if (!module.parent) {
  app.listen(app.get('port'), () => {
    console.log(`${app.locals.title} is running on ${app.get('port')}`)
  })
}
module.exports = app
