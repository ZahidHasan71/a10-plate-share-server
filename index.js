const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = 5000;

// Middlewares
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Server is running!');
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.8rrwwdz.mongodb.net/?appName=Cluster0`;

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
    const requestsCollection = db.collection('requests');
    const usersCollection = db.collection('users');

    // ===================== Users API =====================
    app.post('/users', async (req, res) => {
      const newUser = req.body;
      const email = newUser.email;
      if (!email) return res.status(400).send({ message: 'Email is required' });

      const existingUser = await usersCollection.findOne({ email });
      if (existingUser) {
        return res.send({ message: 'user already exist', insertedId: null });
      } else {
        const result = await usersCollection.insertOne(newUser);
        res.send(result);
      }
    });

    // ===================== Featured Foods =====================
    app.get('/featured-foods', async (req, res) => {
      const cursor = foodsCollection
        .find({ foodStatus: "available" })
        .sort({ quantity: -1 })
        .limit(6);
      const result = await cursor.toArray();
      res.send(result);
    });

    // ===================== Foods API =====================
    app.get('/foods', async (req, res) => {
      const email = req.query.email;
      const search = req.query.search;
      const query = {};

      if (email) {
        query.userEmail = email; 
      }

      if (search) {
        query.foodName = { $regex: search, $options: 'i' };
      }

      const result = await foodsCollection.find(query).toArray();
      res.send(result);
    });

    app.get('/foods/:id', async (req, res) => {
      const id = req.params.id;
      const result = await foodsCollection.findOne({ _id: new ObjectId(id) });
      res.send(result);
    });
      
    app.get('/foods', async (req, res) => {
        const search = req.query.search;
        const query = {};
        if (search) {
            query.foodName = { $regex: search, $options: 'i' };
        }
        const result = await foodsCollection.find(query).toArray();
        res.send(result);
    });


    app.post('/foods', async (req, res) => {
      const newFood = req.body;
      const result = await foodsCollection.insertOne(newFood);
      res.send(result);
    });

    app.patch('/foods/:id', async (req, res) => {
      const id = req.params.id;
      const updatedFood = req.body;
      const result = await foodsCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updatedFood }
      );
      res.send(result);
    });

    app.delete('/foods/:id', async (req, res) => {
      const id = req.params.id;
      const result = await foodsCollection.deleteOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    // ===================== Requests API =====================
    app.post('/requests', async (req, res) => {
      const newRequest = req.body;
      const result = await requestsCollection.insertOne(newRequest);
      res.send(result);
    });

    app.get('/requests', async (req, res) => {
      const requesterEmail = req.query.email;
      const donatorEmail = req.query.donatorEmail;
      const query = {};

      if (requesterEmail) {
        query.requesterEmail = requesterEmail;
      } else if (donatorEmail) {
        query.donatorEmail = donatorEmail;
      }

      const result = await requestsCollection.find(query).toArray();
      res.send(result);
    });

    app.get('/foods/requests/:foodId', async (req, res) => {
      const foodId = req.params.foodId;
      const result = await requestsCollection.find({ food: foodId }).toArray();
      res.send(result);
    });

    app.patch('/requests/:id', async (req, res) => {
      const id = req.params.id;
      const updatedStatus = req.body;
      const result = await requestsCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updatedStatus }
      );
      res.send(result);
    });

    app.delete('/requests/:id', async (req, res) => {
      const id = req.params.id;
      const result = await requestsCollection.deleteOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log("✅ Connected to MongoDB!");
  } finally {
    // await client.close(); // Optional for production
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`🚀 Server listening on port ${port}`);
});