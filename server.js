// Import necessary modules
const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const { ObjectId } = require('mongodb');

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

class DBConnection {
  constructor(client) {
    this.client = client;

    this.db = this.client.db("miluim");
  }

  close() {
    this.client.close();
  }

  positions() {
    return db.collection("positions");
  }

  collectionType(type) {
    const types = ["t1"];
    
    if (!types.includes(type)) {
      return null;
    }

    return db.collection(type);
  }

  example() {
    return db.collection("example");
  }
}


// Default route
app.get('/', (req, res) => {
  res.send('Hello World!');
});


// Function to handle signup for recruiters and volunteers
// This function get type and form data and return the object of the user
/**
 * 
 * @param {*} type 
 * @param {*} formData 
 * @returns Object of the user
 */
async function signup(type, formData) {

  try {
    // Connect to MongoDB Atlas
    const client = await MongoClient.connect(mongoConnectionString);

    // Get the database and collection
    const db = client.db("miluim");

    const authCollection = db.collection("auth");

    // Create a query based on the provided formData (assuming email is unique)
    const query = { email: formData.email, password: formData.password };

    // Find a document that matches the query
    const existingUser = await authCollection.findOne(query);

    // If the user already exists, return without inserting data
    if (existingUser !== null) {
      console.log("User already exists. No data inserted.");
      return;
    }

    // Insert data into the 'auth' collection
    const newAuth = await authCollection.insertOne({ email: formData.email, password: formData.password, type: type });

    if (newAuth.insertedId) {
      // Add the insertedId to the formData
      formData._id = newAuth.insertedId;

      // Get the collection for the second collection
      const typeCollection = db.collection(type);

      // Insert data into the second collection
      const newUser = await typeCollection.insertOne(formData);

      if(newUser) {
        
        const userData = await typeCollection.findOne({_id: newUser.insertedId});
        userData.type = type;
        return userData;
      }
    }

    // Close the connection to the database
    client.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

// Function to handle signup for recruiters and volunteers
/**
 * 
 * @param {*} formData 
 * @returns Object of the user
 */
async function signin(formData) {
  try {
    // Connect to MongoDB Atlas
    const client = await MongoClient.connect(mongoConnectionString);

    // Get the database and collection
    const db = client.db("miluim");
    const authCollection = db.collection("auth");

    // Create a query based on the provided formData (assuming email is unique)
    const query = { email: formData.email, password: formData.password };

    // Find a document that matches the query
    const existingUser = await authCollection.findOne(query);

    // Close the connection to the database
    client.close();

    // Check if the user with the provided credentials exists
    if (existingUser) {
      console.log("User exists:", existingUser);

      const typeCollection = db.collection(existingUser.type);

      // Create a query based on the provided formData (assuming email is unique)
      const getUserDataQuery = { _id: existingUser._id };

      // Find a document that matches the query
      const useData = await typeCollection.findOne(getUserDataQuery);
      
      useData.type = existingUser.type;
      
      return useData;
    }

  } catch (error) {
    console.error('Error:', error);
  }
}



/**
 * 
 * @returns Promis<DBConnection> the db
 */
async function connecDB() {
  const client = await MongoClient.connect(mongoConnectionString);

  return DBConnection(client);
}

// Function to add a position to MongoDB Atlas
async function addPosition(position) {

  console.log("position is: ", position);

  try {
    // Connect to MongoDB Atlas
    const client = await MongoClient.connect(mongoConnectionString);

    // Get the database and collection
    const db = client.db("miluim");
    const positionsCollection = db.collection("positions");

    // Insert the form data into the MongoDB collection
    const posId = await positionsCollection.insertOne(position);
    console.log("posId: ", posId);

    const typeCollection = db.collection(position.type);

    let query = { _id: new ObjectId(position.publisherId) };

    
    // Use $push to add the new item to the array field
    let update = {
      $push: { positions: posId.insertedId }
    };
    console.log("query: ", query);
    console.log("update: ", update);
    
    let result = await typeCollection.updateOne(query, update);
    console.log("ressssss: ", result);

    // Close the connection to the database
    client.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

async function getUserData(userData) {

  // console.log("async function getData(userData) {");

  try {
    // Connect to MongoDB Atlas
    const client = await MongoClient.connect(mongoConnectionString);

    // Get the database and collection
    const db = client.db("miluim");
    const typeCollection = db.collection(userData.type);

    // Create a query based on the provided formData (assuming email is unique)
    const query = { _id: new ObjectId(userData._id) };

    // Find a document that matches the query
    const existingUser = await typeCollection.findOne(query);

    // console.log("received data: ", existingUser);

    // Close the connection to the database
    client.close();

    return existingUser;

  } catch (error) {
    console.error('Error:', error);
  }
}

async function getUserPositionsData(positions) {
  console.log("positionssssss: ", positions);

  try {
    // Connect to MongoDB Atlas
    const client = await MongoClient.connect(mongoConnectionString);

    // Get the database and collection
    const db = client.db("miluim");
    const positionsCollection = db.collection("positions");

    // Ensure positions array is not empty
    if (positions.length === 0) {
      return;
    }

    // Query documents with _id values as strings
    // const result = await positionsCollection.find({ _id: { $in: positions } }).toArray();
    const result = []
    for(let i = 0; i < positions.length; i++) {
      const query = { _id: new ObjectId(positions[i]) };

      // Find a document that matches the query
      const existingUser = await positionsCollection.findOne(query);
      result.push(existingUser);

    }
    console.log("result: ", result);

    client.close();

    return result;
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

  // Insert the form data into MongoDB
  const user = await signup("volunteers", formData);

  // Respond to the client
  res.json(user);
});

app.post('/api/signin', async (req, res) => {
  const formData = req.body; // Get the form data from the request body

  // Insert the form data into MongoDB
  const user = await signin(formData);

  // Respond to the client
  res.json(user);
});

// Endpoint to handle adding a position
app.post('/api/addPosition', async (req, res) => {
  const position = req.body; // Get the form data from the request body

  // Insert the form data into MongoDB
  const ans = await addPosition(position);

  // Respond to the client
  res.json({ message: 'success' });
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
