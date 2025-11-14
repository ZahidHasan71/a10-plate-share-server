const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion,ObjectId } = require('mongodb');
const app = express()
const port = 5000

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.send('Server is running!')
})

// XfJR8hk1OAzDfxSK
const uri = "mongodb+srv://plate-share-db:XfJR8hk1OAzDfxSK@cluster0.8rrwwdz.mongodb.net/?appName=Cluster0";

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
      const db = client.db('plate-share-db');
      const foodsCollection = db.collection('foods');
      const usersCollection = db.collection('users');
    // users apis--------------------------
    app.post('/users',async (req, res) => {
        const newUser = req.body;
        const email = req.body.email;
        const query = { email: email }
        const existingUser = await usersCollection.findOne(query);
        if (existingUser) {
            return res.send({ message: 'user already exist' })
        }else{
            const result = await usersCollection.insertOne(newUser);
            res.send(result)
        }
    })
    //  find use for get all data
    //   findOne use for get single data
      app.get('/foods', async (req, res) => {
          const email = req.query.email;
          const query = { }
          if (email) {
              query.email = email;
          }
          const result = await foodsCollection.find(query).toArray();
          res.send(result)
      })
      app.get('/foods/:id',async (req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) }
        const result = await foodsCollection.findOne(query);
        res.send(result)
    })

    app.post('/foods',async (req, res) => {
        const newFood = req.body;
        const result = await foodsCollection.insertOne(newFood);
        res.send(result)
    })
      app.patch('/foods/:id', async(req, res) => { 
          const id = req.params.id;
          const updatedFood = req.body;
          const query = { _id: new ObjectId(id) }
          const update = {
              $set:  updatedFood   
          }
          const result = await foodsCollection.updateOne(query, update);
          res.send(result)
      })
      app.delete('/foods/:id', (req, res) => {
          const id = req.params.id;
          const query = { _id: new ObjectId(id) }
          const result = foodsCollection.deleteOne(query);
          res.send(result)
      })



    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.listen(port, () => {
  console.log(`This app listening on port ${port}`)
})
