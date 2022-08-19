import express from "express";
import cors from 'cors'
import "dotenv/config";
import { MongoClient, ServerApiVersion, ObjectId } from 'mongodb'
const app = express()
const port = process.env.PORT || 5000;

app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@pathshala.teib2db.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{
        await client.connect()

        const coursesCollection = client.db('pathshala').collection('courses');

        app.get('/courses', async (req, res) => {
            const query = {}
            const cursor = coursesCollection.find(query)
            const services = await cursor.toArray()
            res.send(services);
        })

        app.get('/courses/:id', async (req, res) =>{
            const id = req.params.id
            const query = {_id : ObjectId(id)}
            const service = await coursesCollection.findOne(query);
            res.send(service)
        })

    }
    finally{

    }
}

run().catch(console.dir)

app.get('/', (req, res) => {
    res.send('Hello From Pathshala server')
})

app.listen(port, () => {
    console.log(port);
})