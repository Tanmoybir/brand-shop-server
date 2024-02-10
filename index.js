const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.xmlybhe.mongodb.net/?retryWrites=true&w=majority`;


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
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const brandsCollection = client.db('brandsDB').collection('brands');
    const myCartCollection = client.db('brandsDB').collection('myCarts');



    app.get('/brands', async (req, res) => {
      let queryObj = {}
      const brand_name = req.query.brand_name
      // console.log(brand_name);
      if (brand_name) {
        queryObj.brand_name = brand_name
      }
      const cursor = brandsCollection.find(queryObj);
      const result = await cursor.toArray();
      res.send(result);
    })

    app.get('/brands/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await brandsCollection.findOne(query);
      res.send(result)
    })

    app.post('/brands', async (req, res) => {
      const newProducts = req.body;
      // console.log(newProducts);
      const result = await brandsCollection.insertOne(newProducts);
      res.send(result);
    })

    app.put('/brands/:id', async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const filter = { _id: new ObjectId(id) }
      const product = req.body
      console.log(product);
      const options = { upsert: true };
      const updateProduct = {
        $set: {
          image: product.image,
          details_image: product.details_image,
          productName: product.productName,
          brand_name: product.brand_name,
          type: product.type,
          price: product.price,
          description: product.description,
          rating: product.rating
        }
      }
      const result = await brandsCollection.updateOne(filter, updateProduct, options)
      res.send(result)

    })

    app.get('/myCarts', async (req, res) => {
      // let query = {}
      // const queryEmail = res.query.email
      // if (queryEmail) {
      //   query.email = queryEmail
      // }
      const cursor = myCartCollection.find()
      const result = await cursor.toArray()
      res.send(result)
    })

    app.post('/myCarts', async (req, res) => {
      const myProducts = req.body
      const result = await myCartCollection.insertOne(myProducts)
      res.send(result)
    })

    app.delete('/myCart/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await myCartCollection.deleteOne(query)
      res.send(result)
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


app.get('/', (req, res) => {
  res.send('Hello World')
})

app.listen(port, () => {
  console.log(`server is running on port: ${port}`);
})