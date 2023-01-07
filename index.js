import express from "express";
import cors from 'cors'
import "dotenv/config";
import { MongoClient, ServerApiVersion, ObjectId } from 'mongodb'
const app = express()
const port = process.env.PORT || 5000;
import Stripe from 'stripe'
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@pathshala.teib2db.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect()

        const coursesCollection = client.db('pathshala').collection('courses');
        const flatsCollection = client.db('basakoi').collection('flats');
        const reviewsCollection = client.db('basakoi').collection('reviews');

        app.get('/courses', async (req, res) => {
            const query = {}
            const cursor = coursesCollection.find(query)
            const services = await cursor.toArray()
            res.send(services);
        })

        app.get('/courses/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const service = await coursesCollection.findOne(query);
            res.send(service)
        })

        app.get('/flats', async (req, res) => {
            let query = {}
            if (req.query.category.includes('all')) {
                query = {}
            }
            else {
                query = { category: req.query.category }
            }
            const cursor = flatsCollection.find(query)
            const flats = await cursor.toArray()
            res.send(flats)
        })

        app.get('/flats/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const service = await flatsCollection.findOne(query);
            res.send(service)
        })

        app.post("/create-payment-intent", async (req, res) => {
            const { price } = req.body;
            const amount = price
            const paymentIntent = await stripe.paymentIntents.create({
                amount,
                currency: "usd",
                payment_method_types: ['card'],
            });

            res.send({
                clientSecret: paymentIntent.client_secret,
            });
        });

        app.post('/reviews', async (req, res) => {
            const review = req.body
            const result = await reviewsCollection.insertOne(review)
            res.send(result)
        })

        app.get('/reviews', async (req, res) => {
            const result = await reviewsCollection.find().toArray()
            res.send(result.reverse())
        })

    }
    finally {

    }
}

run().catch(console.dir)

app.get('/', (req, res) => {
    res.send('Hello From Pathshala server')
})

app.listen(port, () => {
    console.log(port);
})