const express = require('express')
const app = express()
var cors = require('cors')
const port = 5000

app.use(cors())

app.get('/', (req, res) => {
  res.send('Server is running')
})


app.listen(port, () => {
  console.log(`Server is listening on port ${port}`)
})
