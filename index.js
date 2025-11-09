const express = require('express')
var cors = require('cors')
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express()
const port = 5000

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.send('Server is running')
})


const uri = "mongodb+srv://plate-share-db:EciuDIZ7LkYEwHEH@cluster0.8rrwwdz.mongodb.net/?appName=Cluster0";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    
      await client.connect();
      
      const db = client.db('plate-share-db')
      const foodCollection = db.collection('foods')

      //   ===================food api =================
      app.get('/foods', async(req, res) => {
          const result = await foodCollection.find().toArray()
          res.send(result);
      })



    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.listen(port, () => {
  console.log(`Server is listening on port ${port}`)
})
