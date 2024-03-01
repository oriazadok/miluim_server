/**
 * This file contain functions of signing
 */

const { DBConnection, connectDB } = require('./DBConnection');


/**
 * Handle signup for recruiters and volunteers
 * @param {*} type 
 * @param {*} formData 
 * @returns Object of the user or null if user exist
 */
async function signup(type, formData) {

  try {

    // Connect to MongoDB Atlas
    const client = await connectDB();

    // Get the auth collection
    const authCollection = client.auth();

    // Query to verify the user does not have already an account
    const query = { email: formData.email, password: formData.password };

    // Find a document that matches the query
    const existingUser = await authCollection.findOne(query);

    // If the user already exists, return without inserting data
    if (existingUser !== null) {
      console.log("User already exists. No data inserted.");
      return null;
    }

    // Insert data into the 'auth' collection
    const newAuth = await authCollection.insertOne({ email: formData.email, password: formData.password, type: type });

    if (newAuth.insertedId) {

      // Get the collection of <type> users
      const users = client.users(type);

      if(users === null) {
        return null;
      }

      // Add the insertedId to the formData
      formData._id = newAuth.insertedId;

      // Delete password of the formData
      delete formData.password;

      // Insert data into the second collection
      const newUser = await users.insertOne(formData);

      if(newUser) {
        
        const newUserData = await users.findOne({_id: newUser.insertedId});
        newUserData.type = type;

        return newUserData;
      }
    }

    // Close the connection to the database
    client.close();

    return null;
    
  } catch (error) {
    console.error('Error:', error);
  }
}
  
/**
 * Handle signin for recruiters and volunteers
 * @param {*} formData 
 * @returns Object of the user or null if user does not have an account
 */
async function signin(formData) {
  try {

    // Connect to MongoDB Atlas
    const client = await connectDB();

    // Get the auth collection
    const authCollection = client.auth();

    // Query to verify authentication
    const query = { email: formData.email, password: formData.password };

    // Find a document that matches the query
    const existingUser = await authCollection.findOne(query);

    // Close the connection to the database
    client.close();

    // Check if the user with the provided credentials exists
    if (existingUser) {

      // Get the collection of <type> users
      const users = client.users(existingUser.type);

      if(users === null) { return null; }

      // Create a query based on the provided formData (assuming email is unique)
      const getUserDataQuery = { _id: existingUser._id };

      // Find a document that matches the query
      const userData = await users.findOne(getUserDataQuery);
      
      // Add the user type
      userData.type = existingUser.type;
      
      return userData;
    }

    // If user does not have an account
    return null;

  } catch (error) {
    console.error('Error:', error);
  }
}

module.exports = { signup, signin };