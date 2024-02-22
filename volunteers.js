const { DBConnection, connectDB } = require('./DBConnection');
const { ObjectId } = require('mongodb');

async function getVolunteers(query) {

    try {
      // Connect to MongoDB Atlas
      const client = await connectDB();
  
      // Get the collection of users based on their type
      const users = client.users("volunteers");
  
      // Find all documents in the collection
      const volunteersData = await users.find(query || {}).toArray();
  
      // Close the connection to the database
      client.close();
  
      // Return the retrieved data
      return volunteersData;
    } catch (error) {
      console.error('Error:', error);
      return [];
    }
  }


module.exports = { getVolunteers };