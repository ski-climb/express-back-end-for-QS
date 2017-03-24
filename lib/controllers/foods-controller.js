const express = require('express')
const app = express()

app.locals.title = "Foods CRUD"

function root(request, response) {
  response.send(app.locals.title)
}

module.exports = {
  root: root
}
