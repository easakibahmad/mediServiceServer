const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();
const port = process.env.PORT || 5000;

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// mongodb connection started
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@firstcluster.3g9daa6.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
async function run() {
  try {
    const serviceCollection = client
      .db("mediService")
      .collection("doctorsServices");

    // services get
    app.get("/doctorsServices", async (req, res) => {
      const query = {};
      const options = await serviceCollection.find(query).toArray();
      res.send(options);
    });
  } finally {
  }
}
run().catch(console.log);

// mongodb connection ended

app.get("/", async (req, res) => {
  res.send("medi service server is running");
});

app.listen(port, () => console.log(`server is running at ${port}`));
