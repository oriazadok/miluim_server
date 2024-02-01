/**
 * This file contains functions that handles request related to positions
 */

const { DBConnection, connectDB } = require('./DBConnection');
const { ObjectId } = require('mongodb');

/**
 * Add a position to the positions collection and its id to the publisher recruiter
 * @param {*} position 
 * @returns Id of the position or null if there an error
 */
async function addPosition(position) {

    console.log("position is: ", position);

    console.log("position is: ", position);
    console.log("position is: ", position);

  
    if(position.publisherId === undefined || position.type === undefined) {
      return null;
    }

    console.log("position is not undefined");
  
    try {
  
      // Connect to MongoDB Atlas
      const client = await connectDB();
  
      // Get the positions collection
      const positions = client.positions();
  
      // Insert the form data into the positions collection
      const posId = await positions.insertOne(position);
      console.log("posId: ", posId);
  
      const users = client.users(position.type);
  
      const query = { _id: new ObjectId(position.publisherId) };
  
      // Use $push to add the new item to the array field
      const update = { $push: { positions: posId.insertedId } };
      // console.log("query: ", query);
      // console.log("update: ", update);
      
      const response = await users.updateOne(query, update);
      console.log("response of addPosition is: ", response);
  
      // Close the connection to the database
      client.close();
  
      if(response) {
        return response;
      }
  
      return null;
  
    } catch (error) {
      console.error('Error:', error);
    }
  }
  
  

  /**
   * 
   * @param {*} positions 
   * @returns An array of the positions objects
   */
  async function getUserPositionsData(positions) {
  
    console.log("positionssssss: ", positions);
    
    // Ensure positions array is not empty
    if (positions.length === 0) {
      return [];
    }

    console.log("posses is not empty");
    
    try {
  
      // Connect to MongoDB Atlas
      const client = await connectDB();
  
      // Get the positions collection
      const positionsCollection = client.positions();
  
      // Query documents with _id values as strings

      const positionIds = positions.map(positionId => new ObjectId(positionId));

      const query = { _id: { $in: positionIds } };

      // Find documents that match the query
      const result = await positionsCollection.find(query).toArray();
      console.log("result: ", result);
      
      client.close();
      
      console.log("result: ", result);
  
      return result;
  
    } catch (error) {
      console.error('Error:', error);
    }
  }


module.exports = { addPosition, getUserPositionsData };