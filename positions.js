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

  async function filterPositions(filter) {
    try {
      // Connect to MongoDB Atlas
      const client = await connectDB();
  
      // Get the positions collection
      const positionsCollection = client.positions();
      // console.log("positions: ", positionsCollection); -- test 
      // Query documents with _id values as strings
      const query = filter;


      console.log("query: ", query);
  
      // Find documents that match the query
      const result = await positionsCollection.find(query).toArray();

      // console.log("result: ", result);
      
      client.close();
  
      return result;
  
    } catch (error) {
      console.error('Error:', error);
    }
  }

  async function deletePosition(posId) {
    try {
      // Connect to MongoDB Atlas
      const client = await connectDB();
  
      // Get the positions collection
      const positionsCollection = client.positions();
  
      // Convert the provided posId to a MongoDB ObjectID
      const objectId = new ObjectId(posId._id);
  
      // Create a filter to find the document with the specified ID
      const filter = { _id: objectId };
  
      // Delete the document that matches the filter
      const result = await positionsCollection.deleteOne(filter);
  
      console.log("result is: ", result);
  
      // Check the result for success
      if (result.deletedCount === 1) {
        console.log(`Position with ID ${posId._id} deleted successfully.`);
      } else {
        console.log(`Position with ID ${posId._id} not found.`);
      }
  
      const recruiterCollection = client.users("recruiters");
  
      // Create an update operation to pull the ID from the array field
      const updateOperation = {
        $pull: { positions: objectId },
      };
  
      // Update the document that matches the filter
      const res = await recruiterCollection.updateOne({ _id: new ObjectId(posId.publisherId) }, updateOperation);

      console.log("res: ", res);
      
      client.close();
  
      return result;
  
    } catch (error) {
      console.error('Error:', error);
    }
  }


  async function editPosition(posId, updatedData) {
    try {
      // Connect to MongoDB Atlas
      const client = await connectDB();
  
      // Get the positions collection
      const positionsCollection = client.positions();
  
      // Convert the provided posId to a MongoDB ObjectID
      const objectId = new ObjectId(posId._id);
  
      // Create a filter to find the document with the specified ID
      const filter = { _id: objectId };
  
      // Delete the document that matches the filter
      const result = await positionsCollection.deleteOne(filter);
  
      console.log("result is: ", result);
  
      // Check the result for success
      if (result.deletedCount === 1) {
        console.log(`Position with ID ${posId._id} deleted successfully.`);
      } else {
        console.log(`Position with ID ${posId._id} not found.`);
      }
  
      const recruiterCollection = client.users("recruiters");
  
      // Create an update operation to pull the ID from the array field
      const updateOperation = {
        $pull: { positions: objectId },
      };
  
      // Update the document that matches the filter
      const res = await recruiterCollection.updateOne({ _id: new ObjectId(posId.publisherId) }, updateOperation);

      console.log("res: ", res);
      
      client.close();
  
      return result;
  
    } catch (error) {
      console.error('Error:', error);
    }
  }

/**
   * 
   * @param {*} positionData 
   * @returns Object of the user or null if there an error
   */
async function getPositionData(positionData) {
  
  if(positionData.type === undefined || positionData._id === undefined) {
    return null;
  }

  try {

    // Connect to MongoDB Atlas
    const client = await connectDB();

    // Get the collection of <type> positions
    const positions = client.positions(positionData.type);

    // Create a query based on the provided formData (assuming email is unique)
    const query = { _id: new ObjectId(positionData._id) };

    // Find a document that matches the query
    const existingPosition = await positions.findOne(query);

    // Close the connection to the database
    client.close();

    if(existingUser) {
      console.log("user dqeqc: ", existingPosition);
      existingPosition.type = positionData.type;

      return existingPosition;
    }

    return null;

    
  } catch (error) {
    console.error('Error:', error);
  }PositionsPositions
}


  // Function to update position data in the database
async function updatePositionData(positionData) {
  // console.log("positionData.updatePositionData: ", positionData.updatePositionData);
  if (!positionData._id || !positionData.updatedPositionData) {
    return false;
  }

  try {
    // Connect to MongoDB Atlas
    const client = await connectDB();

    // Get the collection of positions based on their type
    const positions = client.positions(positionData.type);

    // Create a query to find the position by their ID
    const query = { _id: new ObjectId(positionData._id) };

    // Exclude the _id field from the update operation
    // delete positionData.updatePositionData._id;

    // Create an update object with the new position data
    const update = { $set: positionData.updatedPositionData };

    // Perform the update operation
    const result = await positions.updateOne(query, update);

    console.log("result isss: ", result);
    
    // Close the connection to the database
    client.close();

    return result.modifiedCount > 0; // Return true if at least one document was modified
  } catch (error) {
    console.error('Error:', error);
    return false;
  }
}
  

module.exports = { addPosition, getUserPositionsData, filterPositions, deletePosition, editPosition, getPositionData, updatePositionData };