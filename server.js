// Import necessary modules
const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');

// Initialize Express app
const app = express();
const port = 3001;

// MongoDB Atlas connection string
const mongoConnectionString = 'mongodb+srv://oriazadok:sz3ucFQwxqx5Avk@cluster0.feaagjf.mongodb.net/?retryWrites=true&w=majority';

// Middleware to parse JSON data and enable CORS
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST'],
}));
app.options('/api/signup', cors());


// Default route
app.get('/', (req, res) => {
  res.send('Hello World!');
});


// Function to handle signup for recruiters and volunteers
async function signup(type, formData) {
  try {
    // Connect to MongoDB Atlas
    const client = await MongoClient.connect(mongoConnectionString);

    // Get the database and collection
    const db = client.db("miluim");

    const collection = db.collection("auth");

    // Create a query based on the provided formData (assuming email is unique)
    const query = { email: formData.email, password: formData.password };

    // Find a document that matches the query
    const existingUser = await collection.findOne(query);

    // If the user already exists, return without inserting data
    if (existingUser !== null) {
      console.log("User already exists. No data inserted.");
      return;
    }

    // Insert data into the 'auth' collection
    const auth = await collection.insertOne({ email: formData.email, password: formData.password, type: type });

    
    // Extract the insertedId from the 'auth' collection result
    const insertedId = auth.insertedId;
    console.log("auth is: ", auth.insertedId);

    if (insertedId) {
      // Add the insertedId to the formData
      formData._id = insertedId;

      // Get the collection for the second collection
      const secondCollection = db.collection(type);

      // Insert data into the second collection
      await secondCollection.insertOne(formData);
      const response = {_id: auth.insertedId, type: type}

      return response;
    }

    // Close the connection to the database
    client.close();
  } catch (error) {
    console.error('Error:', error);
  }
}




// Function to handle signup for recruiters and volunteers
async function signin(formData) {
  try {
    // Connect to MongoDB Atlas
    const client = await MongoClient.connect(mongoConnectionString);

    // Get the database and collection
    const db = client.db("miluim");
    const collection = db.collection("auth");

    // Create a query based on the provided formData (assuming email is unique)
    const query = { email: formData.email, password: formData.password };

    // Find a document that matches the query
    const existingUser = await collection.findOne(query);

    // Close the connection to the database
    client.close();

    // Check if the user with the provided credentials exists
    if (existingUser) {
      console.log("User exists:", existingUser);

      const response = {_id: existingUser._id, type: existingUser.type}
      
      return response;
      // Perform additional actions or return a response as needed
    }

  } catch (error) {
    console.error('Error:', error);
  }
}


// Function to add a position to MongoDB Atlas
async function addPosition(position) {
  try {
    // Connect to MongoDB Atlas
    const client = await MongoClient.connect(mongoConnectionString);

    // Get the database and collection
    const db = client.db("miluim");
    const collection = db.collection("positions");

    // Insert the form data into the MongoDB collection
    await collection.insertOne(position);

    // Close the connection to the database
    client.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

// Endpoint to handle recruiter signup
app.post('/api/signup_recruiter', async (req, res) => {
  const formData = req.body; // Get the form data from the request body

  // Insert the form data into MongoDB
  const user = await signup("recruiters", formData);

  // Respond to the client
  res.json(user);
});

// Endpoint to handle volunteer signup
app.post('/api/signup_volunteer', async (req, res) => {
  const formData = req.body; // Get the form data from the request body

  console.log("form data: ", formData);

  // Insert the form data into MongoDB
  const user = await signup("volunteers", formData);

  // Respond to the client
  res.json(user);
});

app.post('/api/signin', async (req, res) => {
  const formData = req.body; // Get the form data from the request body

  console.log("form data: ", formData);

  // Insert the form data into MongoDB
  const user = await signin(formData);
  console.log("user: ", user);

  // Respond to the client
  res.json(user);
});

// Endpoint to handle adding a position
app.post('/api/addPosition', async (req, res) => {
  const position = req.body; // Get the form data from the request body

  console.log("form data: ", position);

  // Perform any additional validation or processing if needed

  // Insert the form data into MongoDB
  const ans = await addPosition(position);

  // Respond to the client
  res.json({ message: 'success' });
});

// Endpoint to retrieve volunteers' data
app.get('/api/volunteers', async (req, res) => {
  try {

    const client = await MongoClient.connect(mongoConnectionString);
    const db = client.db("miluim");
    const collection = db.collection("volunteers");

    const volunteersData = await collection.find({}).toArray();
    console.log("volll: ", volunteersData);

    // Close the connection to the database
    client.close();

    res.send(volunteersData);
  } catch (error) {
    console.error('Error:', error);
    throw error; // Propagate the error
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
