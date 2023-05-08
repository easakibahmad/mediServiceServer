const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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
    const bookingsCollection = client.db("mediService").collection("bookings");
    const newsCollection = client
      .db("mediService")
      .collection("newsCollection");
    const infoCollection = client
      .db("mediService")
      .collection("infoCollection");
    const doctorsCollection = client
      .db("mediService")
      .collection("doctorsDetails");

    app.get("/doctorsDetails", async (req, res) => {
      const query = {};
      const doctors = await doctorsCollection.find(query).toArray();
      res.send(doctors);
    });
    app.get("/news", async (req, res) => {
      const query = {};
      const news = await newsCollection.find(query).toArray();
      res.send(news);
    });
    app.get("/news/:id", async (req, res) => {
      const id = req.params.id;
      const objectOne = new ObjectId(id);
      const query = { _id: objectOne };
      const cursor = newsCollection.find(query);

      const oneFile = await cursor.toArray();

      res.send(oneFile);
    });

    app.get("/info", async (req, res) => {
      const query = {};
      const info = await infoCollection.find(query).toArray();
      res.send(info);
    });
    app.get("/info/:id", async (req, res) => {
      const id = req.params.id;
      const objectOne = new ObjectId(id);
      const query = { _id: objectOne };
      const cursor = infoCollection.find(query);

      const oneFile = await cursor.toArray();

      res.send(oneFile);
    });

    // services get
    app.get("/doctorsServices", async (req, res) => {
      const date = req.query.date;
      // console.log(date);
      const query = {};
      const options = await serviceCollection.find(query).toArray();
      const bookingQuery = { appointmentDate: date };
      const alreadyBooked = await bookingsCollection
        .find(bookingQuery)
        .toArray();

      options.forEach((option) => {
        const optionBooked = alreadyBooked.filter(
          (book) => book.treatment === option.name
        );
        const booksSlot = optionBooked.map((book) => book.slot);
        const remainingSlots = option.slots.filter(
          (slot) => !booksSlot.includes(slot)
        );
        option.slots = remainingSlots;
        // console.log(optionBooked);
      });

      res.send(options);

      // booking post in database
      app.post("/bookings", async (req, res) => {
        const booking = req.body;

        const query = {
          appointmentDate: booking.appointmentDate,
          email: booking.email,
          treatment: booking.treatment,
        };
        const alreadyBooked = await bookingsCollection.find(query).toArray();

        if (alreadyBooked.length) {
          const message = `you already have a booking on ${booking.appointmentDate}`;
          return res.send({ acknowledged: false, message });
        }

        const result = await bookingsCollection.insertOne(booking);
        res.send(result);
      });
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
