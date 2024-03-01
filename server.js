// Import necessary modules
const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const { ObjectId } = require('mongodb');

const { DBConnection, connectDB } = require('./DBConnection');
const { signup, signin } = require('./signing');
const { addPosition, getUserPositionsData, deletePosition, editPosition, updatePositionData, getPositionData } = require('./positions');
const { getVolunteers } = require('./volunteers');

// const fs = require('fs');

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



// async function readJsonFile() {
//   try {
//     // Read the content of the file
//     const fileContent = fs.readFileSync("/home/oriaz/Desktop/generate/volunteers.json", 'utf-8');

//     // Parse the content as JSON
//     const jsonData = JSON.parse(fileContent);

//     for(let i = 0; i < jsonData.length; i++) {
//       await signup("volunteers", jsonData[i]);
//     }
    
//   } catch (error) {
//     console.error(`Error reading JSON file: ${error.message}`);
//     return null;
//   }
// }

// readJsonFile();

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
  
  // Respond to the client
  res.json(user);
});

app.post('/api/signin', async (req, res) => {
  const formData = req.body; // Get the form data from the request body

  // Insert the form data into MongoDB
  const user = await signin(formData);

  console.log("user: ", user);

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
  
  if(response) {
    res.json(response);
  }
  // Respond to the client
  res.status(404);
});

// Endpoint to handle delete a position
app.post('/api/deletePosition', async (req, res) => {
  const position = req.body; // Get the form data from the request body

  // Insert the form data into MongoDB
  const response = await deletePosition(position);
  // console.log("ressssop: ", response);

  if(response) {
    res.json(response);
  }
  // Respond to the client
  res.status(404);
});

// Endpoint to handle edit a position
app.post('/api/editPosition', async (req, res) => {
  const position = req.body; // Get the form data from the request body

  // Insert the form data into MongoDB
  const response = await editPosition(position);
  // console.log("ressssop: ", response);

  if(response) {
    res.json(response);
  }
  // Respond to the client
  res.status(404);
});

// Endpoint to handle updating position data
app.post('/api/updatePositionData', async (req, res) => {
  const positionData = req.body; // Get the position data from the request body

  // Update position data in the database
  const success = await updatePositionData(positionData);

  // If update is successful, return the updated position data
  if (success) {
    // const updatedPosition = await getPositionData(positionData);
    res.status(200).json("good");
  } else {
    res.status(500).json({ success: false, message: 'Failed to update position data' });
  }
});

// Endpoint to handle updating position data
app.post('/api/getPositionData', async (req, res) => {
  const positionData = req.body; // Get the position data from the request body


  // If update is successful, return the updated position data
  const updatedPosition = await getPositionData(positionData);
  res.json(updatedPosition); 
});


app.post('/api/getUserPositionsData', async (req, res) => {
  const positions = req.body; // Get the form data from the request body

  // Insert the form data into MongoDB
  const poses = await getUserPositionsData(positions);

  // Respond to the client
  res.json(poses);
})

// Function to update user data in the database
async function updateUserData(userData) {
  if (!userData._id || !userData.updatedUserData) {
    return false;
  }

  try {
    // Connect to MongoDB Atlas
    const client = await connectDB();

    // Get the collection of users based on their type
    const users = client.users(userData.type);

    // Create a query to find the user by their ID
    const query = { _id: new ObjectId(userData._id) };

    // Exclude the _id field from the update operation
    delete userData.updatedUserData._id;

    // Create an update object with the new user data
    const update = { $set: userData.updatedUserData };

    // Perform the update operation
    const result = await users.updateOne(query, update);

    // Close the connection to the database
    client.close();

    return result.modifiedCount > 0; // Return true if at least one document was modified
  } catch (error) {
    console.error('Error:', error);
    return false;
  }
}



// Endpoint to handle updating user data
app.post('/api/updateUserData', async (req, res) => {
  const userData = req.body; // Get the user data from the request body

  // Update user data in the database
  const success = await updateUserData(userData);

  // If update is successful, return the updated user data
  if (success) {
    const updatedUser = await getUserData(userData);
    res.json(updatedUser);
  } else {
    res.status(500).json({ success: false, message: 'Failed to update user data' });
  }
});

// Endpoint to handle updating user data
app.post('/api/getUserData', async (req, res) => {
  const userData = req.body; // Get the user data from the request body

  // If update is successful, return the updated user data
  const updatedUser = await getUserData(userData);
  res.json(updatedUser);
});


// Endpoint to retrieve volunteers' data
app.post('/api/volunteers', async (req, res) => {
  try {

    const query = req.body;
    const volunteerss = await getVolunteers(query);

    res.json(volunteerss);

  } catch (error) {
    console.error('Error:', error);
    throw error; // Propagate the error
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
