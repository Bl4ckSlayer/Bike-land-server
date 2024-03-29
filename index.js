const express = require("express");
const cors = require("cors");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();

app.use(cors());
app.use(express.json());

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  const token = authHeader.split[1];
  jwt.verify(token, process.env.SECRET_ACCESS_TOKEN, (err, decoded) => {
    if (err) {
      return res.status(403).send({ message: "Forbidden access" });
    }

    req.decoded = decoded;
    next();
  });
}

const uri = `mongodb+srv://${process.env.user}:${process.env.password}@cluster0.ubkg8.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
async function run() {
  try {
    await client.connect();
    const bikeCollection = client.db("assignment-11").collection("inventory");

    // get users
    app.get("/inventory", async (req, res) => {
      const query = {};
      const cursor = bikeCollection.find(query);
      const users = await cursor.toArray();
      res.send(users);
    });
    app.get("/inventory/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await bikeCollection.findOne(query);
      res.send(result);
    });
    app.put("/inventory/:id", async (req, res) => {
      const id = req.params.id;
      const newItem = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          name: newItem.name,
          description: newItem.description,
          price: newItem.price,
          img: newItem.img,
          supplierName: newItem.supplierName,
          quantity: newItem.quantity,
        },
      };
      const result = await bikeCollection.updateOne(
        filter,
        updatedDoc,
        options
      );
      res.send(result);
    });

    app.delete("/inventory/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await bikeCollection.deleteOne(query);
      res.send(result);
    });

    app.get("/mybikes", verifyJWT, async (req, res) => {
      const reqEmail = req.decoded.email;
      const email = req.query.email;
      if (email === reqEmail) {
        const query = { email: email };
        const cursor = bikeCollection.find(query);
        const myItems = await cursor.toArray();
        res.send(myItems);
      } else {
        res.status(403).send({ message: "Forbidden access" });
      }
    });

    app.post("/inventory", async (req, res) => {
      const newCar = req.body;
      const result = await bikeCollection.insertOne(newCar);
      res.send(result);
    });

    app.post("/login", async (req, res) => {
      const user = req.body;
      const accessToken = jwt.sign(user, process.env.SECRET_ACCESS_TOKEN, {
        expiresIn: "1d",
      });
      res.send({ accessToken });
    });
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Server Is Running..");
});

app.listen(port, () => {
  console.log("Listening.. to port 5000");
});
