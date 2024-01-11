const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const fs = require('fs/promises');

const app = express();
const port = 3001;

const mongoConnectionString = 'mongodb+srv://oriazadok:sz3ucFQwxqx5Avk@cluster0.feaagjf.mongodb.net/?retryWrites=true&w=majority';
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST'],
}));
app.options('/api/signup', cors());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

async function retrieveDataFromAtlas() {
  try {
    // Connect to MongoDB Atlas
    const client = await MongoClient.connect(mongoConnectionString, { useNewUrlParser: true, useUnifiedTopology: true });

    // Get the database and collection
    const db = client.db("sample_analytics"); // Change to your actual database name
    const collection = db.collection("accounts");

    // Retrieve data from the collection
    const retrievedData = await collection.find({}).toArray();

    // Log the retrieved data
    console.log('Retrieved Data:', retrievedData);

    // Close the connection to the database
    client.close();
  } catch (error) {
    console.error('Error:', error);
  }
}
// retrieveDataFromAtlas();
async function insertDataToAtlas(dataToInsert) {
  try {
    // Connect to MongoDB Atlas
    const client = await MongoClient.connect(mongoConnectionString, { useNewUrlParser: true, useUnifiedTopology: true });

    // Get the database and collection
    const db = client.db("miluim");
    const collection = db.collection("accounts");

    // await collection.deleteMany({});

    // Read data from the JSON file
    // const jsonData = await fs.readFile('/home/oriaz/Desktop/generate/data_profiles.json', 'utf-8');
    // const dataToInsert = JSON.parse(jsonData);

    // await collection.deleteMany({});

    // let i = 0;
    // // Loop through the dataToInsert array and insert each object into the collection
    // for (const data of dataToInsert) {
      await collection.insertOne(data);
      // console.log(i++)
    // }
    

    // Close the connection to the database
    client.close();
  } catch (error) {
    console.error('Error:', error);
  }
}


// insertDataToAtlas();

async function signup(type, formData) {
  try {
    // Connect to MongoDB Atlas
    const client = await MongoClient.connect(mongoConnectionString);


    // Get the database and collection
    const db = client.db("miluim");
    const collection = db.collection(type);

    // Insert the form data into the MongoDB collection
    await collection.insertOne(formData);

    // Close the connection to the database
    client.close();
  } catch (error) {
    console.error('Error:', error);
  }
}



app.post('/api/signup_recruiter', async (req, res) => {
  const formData = req.body; // Get the form data from the request body

  console.log("form data: ", formData);

  // Perform any additional validation or processing if needed

  // Insert the form data into MongoDB
  await signup("recruiters", formData);

  // Respond to the client
  res.json({ message: 'Signup successful' });
});

app.post('/api/signup_volunteer', async (req, res) => {
  const formData = req.body; // Get the form data from the request body

  console.log("form data: ", formData);

  // Perform any additional validation or processing if needed

  // Insert the form data into MongoDB
  await signup("volunteers", formData);

  // Respond to the client
  res.json({ message: 'Signup successful' });
});


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});