require('dotenv').config()
const express = require('express')
const cors = require('cors')
const app = express()
const port = process.env.PORT || 5000
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');



app.use(cors())
app.use(express.json())

// quizDB
// jauINy4u3IMEt2xv
app.get('/', (req, res) => {
    res.send('Hello World!')
})

const uri = `mongodb+srv://${process.env.QUIZ_USER}:${process.env.QUIZ_PASS}@cluster0.nc6s3b6.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);
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

        const answerCollection = client.db('quizDB').collection('answer')
        const questionCollection = client.db('quizDB').collection('questions')
        const usersCollection = client.db('quizDB').collection('users')

        app.patch('/api/v1/makeAdmin/:id', async (req, res) => {
            const id = req.params.id
            const filter = { _id: new ObjectId(id) }
            const upadatUser = {
                $set: {
                    role: 'admin'
                }
            }
            const result = await usersCollection.updateOne(filter, upadatUser)
            res.send(result)
        })

        app.get('/api/v1/getIsAdmin/:email', async (req, res) => {
            const email = req.params.email
            const query = { email: email }
            const user = await usersCollection.findOne(query)
            let admin = false
            if (user) {
                admin = user?.role === 'admin'
            }
            res.send({ admin })
        })
        app.get('/api/v1/getQuestion', async (req, res) => {
            const result = await questionCollection.find().toArray()
            res.send(result)
        })


        // get users
        app.get('/api/v1/getUsers', async (req, res) => {
            const result = await usersCollection.find().toArray()
            res.send(result)
        })
        app.get('/api/v1/getAnswer/:email', async (req, res) => {
            const email = req.params.email
            const query = { email: email }
            const result = await answerCollection.find(query).toArray()
            res.send(result)
        })

        app.post('/api/v1/answerCreate', async (req, res) => {
            const answer = req.body
            const result = await answerCollection.insertOne(answer)
            console.log(result);
            res.send(result)
        })

        app.post('/api/v1/createUser', async (req, res) => {
            const user = req.body
            const result = await usersCollection.insertOne(user)
            console.log(result);
            res.send(result)
        })
        app.post('/api/v1/questionCreate', async (req, res) => {
            const answer = req.body
            const result = await questionCollection.insertOne(answer)
            console.log(result);
            res.send(result)
        })

        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {

        // await client.close();
    }
}
run().catch(console.dir);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})