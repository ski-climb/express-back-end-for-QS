const Food = require('./lib/models/food')

  
Food.deleteFood(7).then((data) => {
  console.log(data)
    process.exit();
});

