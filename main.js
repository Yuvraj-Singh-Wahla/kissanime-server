const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
// const { MongoClient, ServerApiVersion } = require('mongodb');
const { addAnime, getAnime, getAllCharactersByAnimeId, addCharacter, addUser, isRegistered, addToWatchList, getWatchList } = require('./functions');
require('dotenv').config();


// db_connect().catch((err) => { console.log(err); });

// async function db_connect() {
//     await mongoose.connect(`mongodb://localhost:27017/kissanime`);

//     console.log("Database connected");



// }

// mongoose.connect('mongodb+srv://test:testp@clusteranime.okv5bh4.mongodb.net/?retryWrites=true&w=majority', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// })
// .then(() => {
//   console.log('Connected to MongoDB Atlas');
// })
// .catch((error) => {
//   console.error('Error connecting to MongoDB Atlas:', error);
// });

// const uri = 'mongodb+srv://test:<testpz>@cluster0.twr0emo.mongodb.net/?retryWrites=true&w=majority'

// MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true }, (err, client) => {
//     if (err) {
//       console.log('Error connecting to MongoDB Atlas:', err);
//     } else {
//       console.log('Connected to MongoDB Atlas successfully!');
//       // Perform database operations here
//       // client.close(); // Close the connection when done
//     }
//   });

mongoose.connect(process.env.uri)
.then(() => {
    console.log("Database Connected");
})
.catch((err) => {
    console.log('Error connecting to MongoDB: ', err);
})

// // Create a MongoClient with a MongoClientOptions object to set the Stable API version
// const client = new MongoClient(uri, {
//   serverApi: {
//     version: ServerApiVersion.v1,
//     strict: true,
//     deprecationErrors: true,
//   }
// });

// async function run() {
//   try {
//     // Connect the client to the server	(optional starting in v4.7)
//     await client.connect();
//     // Send a ping to confirm a successful connection
//     await client.db("admin").command({ ping: 1 });
//     console.log("Pinged your deployment. You successfully connected to MongoDB!");
//   } finally {
//     // Ensures that the client will close when you finish/error
//     await client.close();
//   }
// }
// run().catch(console.dir);


const app = express();
app.use(express.json());
app.use(cors());

app.get('/api/anime/:animeId', async (req, res) => {
    const id = req.params.animeId;
    const response = await getAnime({ _id: id }, { name: 1, para: 1, src: 1, _id: 0 });
    res.json(response);
})

app.get('/api/allAnime', (req, res) => {
    const uri = 'mongodb://localhost:27017';
    const databaseName = 'kissanime';
    const collectionName = 'animes';
    const projection = { name: 1, description: 1, src: 1, _id: 1 };

    getAnime({}, projection)
        .then(documents => {
            res.json(documents);
        })
        .catch(err => {
            console.error(err);
            res.sendStatus(500);
        });
});

app.get('/api/anime/:animeId/characters', getAllCharactersByAnimeId);

app.post('/anime/add', async (req, res) => {
    const { name, description, source, para } = req.body;

    try {
        await addAnime(name, description, source, para);
        res.status(201).json({ message: 'Anime added successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.post('/characters/add', async (req, res) => {
    const { name, description, source, anime } = req.body;

    try {
        await addCharacter(name, description, source, anime);
        res.status(200).json({ message: 'Character added successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.post('/api/user/add', async (req, res) => {
    const { name, email, password, imgSource } = req.body;

    try {
        await addUser(name, email, password, imgSource);
        res.status(200).json({ message: 'User added successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.post('/api/user/validate', async (req, res) => {
    const { email, password } = req.body;

    try {
        const response = await isRegistered(email, password);
        if (response.length>0) {
            res.status(200).json({ message: 'true',_id:response[0]._id });
        }
        else {
            res.status(200).json({ message: 'false' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.post('/api/user/addWatchList',  (req, res) => {
    const { id, anime } = req.body;
    try {
        const response =  addToWatchList(id, anime);
        if (response) {
            res.status(200).json({ message: 'true' });
        }
        else {
            res.status(200).json({ message: 'false' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.post('/api/user/getWatchList', async (req, res) => {
    const { id } = req.body;
    try {
        const response = await getWatchList(id);
        res.status(200).json({response});


    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
})

app.listen(process.env.port);