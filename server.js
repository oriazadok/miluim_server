// Import necessary modules
const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const { ObjectId } = require('mongodb');

const { DBConnection, connectDB } = require('./DBConnection');
const { signup, signin } = require('./signing');
const { addPosition, getUserPositionsData } = require('./positions')

// Initialize Express app
const app = express(); 

const port = 3001;

// Middleware to parse JSON data and enable CORS
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST'],
}));
app.options('/api/signup', cors());







/**
   * 
   * @param {*} userData 
   * @returns Object of the user or null if there an error
   */
async function getUserData(userData) {
  
  if(userData.type === undefined || userData._id === undefined) {
    return null;
  }

  try {

    // Connect to MongoDB Atlas
    const client = await connectDB();

    // Get the collection of <type> users
    const users = client.users(userData.type);

    // Create a query based on the provided formData (assuming email is unique)
    const query = { _id: new ObjectId(userData._id) };

    // Find a document that matches the query
    const existingUser = await users.findOne(query);

    // Close the connection to the database
    client.close();

    if(existingUser) {
      console.log("user dqeqc: ", existingUser);
      existingUser.type = userData.type;

      return existingUser;
    }

    return null;

    
  } catch (error) {
    console.error('Error:', error);
  }PositionsPositions
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

  // Insert the form data into MongoDB
  const user = await signup("volunteers", formData);
  console.log("userrrrr: ", user);

  // Respond to the client
  res.json(user);
});

app.post('/api/signin', async (req, res) => {
  const formData = req.body; // Get the form data from the request body

  // Insert the form data into MongoDB
  const user = await signin(formData);

  console.log("user is: ", user);
  

  if(user) {
    // Respond to the client
    res.json(user);
  } else {
    // Respond to the client
    res.json(null);
  }

  
});

// Endpoint to handle adding a position
app.post('/api/addPosition', async (req, res) => {
  const position = req.body; // Get the form data from the request body

  // Insert the form data into MongoDB
  const response = await addPosition(position);
  console.log("ressssop: ", response);

  if(response) {
    res.json(response);
  }
  // Respond to the client
  res.status(404);
});

app.post('/api/getUserData', async (req, res) => {
  const userData = req.body; // Get the form data from the request body

  console.log("getUserData: ", userData);

  // Insert the form data into MongoDB
  const response = await getUserData(userData);

  // Respond to the client
  res.json(response);
});

app.post('/api/getUserPositionsData', async (req, res) => {
  const positions = req.body; // Get the form data from the request body

  // Insert the form data into MongoDB
  const ans = await getUserPositionsData(positions);
  console.log("ans: ", ans);

  // Respond to the client
  res.json(ans);
})



// Endpoint to retrieve volunteers' data
app.get('/api/volunteers', async (req, res) => {
  try {

    const client = await MongoClient.connect(mongoConnectionString);
    const db = client.db("miluim");
    const collection = db.collection("volunteers");

    const volunteersData = await collection.find({}).toArray();
    // console.log("volll: ", volunteersData);

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

