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

    if(position.publisherId === undefined || position.type === undefined) {
      return null;
    }

    try {
  
      // Connect to MongoDB Atlas
      const client = await connectDB();
  
      // Get the positions collection
      const positions = client.positions();
  
      // Insert the form data into the positions collection
      const posId = await positions.insertOne(position);
  
      const users = client.users(position.type);
  
      const query = { _id: new ObjectId(position.publisherId) };
  
      // Use $push to add the new item to the array field
      const update = { $push: { positions: posId.insertedId } };
      // console.log("query: ", query);
      // console.log("update: ", update);
      
      const response = await users.updateOne(query, update);
  
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

    
  
    // Ensure positions array is not empty
    if (positions.length === 0) {
      return [];
    }

    
    try {
  
      // Connect to MongoDB Atlas
      const client = await connectDB();
  
      // Get the positions collection
      const positionsCollection = client.positions();
  
      // Query documents with _id values as strings

      const positionIds = positions.map(positionId => new ObjectId(positionId));

      const query = { _id: { $in: positionIds } };

      console.log("positions: ", positions);
    

      // Find documents that match the query
      const result = await positionsCollection.find(query).toArray();

      console.log("result: ", result);
      
      client.close();
      
      return result;
  
    } catch (error) {
      console.error('Error:', error);
    }
  }

  // async function getPositionsData(positions) {
  
  //   // Ensure positions array is not empty
  //   if (positions.length === 0) {
  //     return [];
  //   }
    
  //   try {
  
  //     // Connect to MongoDB Atlas
  //     const client = await connectDB();
  
  //     // Get the positions collection
  //     const positionsCollection = client.positions();
  
  //     // Query documents with _id values as strings

  //     const positionIds = positions.map(positionId => new ObjectId(positionId));

  //     const query = { _id: { $in: positionIds } };

  //     // Find documents that match the query
  //     const result = await positionsCollection.find(query).toArray();
      
  //     client.close();
      
  //     return result;
  
  //   } catch (error) {
  //     console.error('Error:', error);
  //   }
  // }

  async function filterPositions(filter) {
    try {
        // Connect to MongoDB Atlas
        const client = await connectDB();

        // Get the positions collection
        const positionsCollection = client.positions();

        // Initialize an empty query
        let query = {};

        // If filter is not empty, use it as the query
        if (Object.keys(filter).length !== 0) {
            query = filter;
        }

        // Project only the _id field
        const projection = { _id: 1 };

        console.log("query: ", query);

        // Find documents that match the query and project only the _id field
        const result = await positionsCollection.find(query).project(projection).toArray();
        console.log("result: ", result); // Fix typo here

        client.close();

        // Extract only the IDs from the result array
        const ids = result.map(doc => doc._id);

        return ids;

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
  
      const recruiterCollection = client.users("recruiters");
  
      // Create an update operation to pull the ID from the array field
      const updateOperation = {
        $pull: { positions: objectId },
      };
  
      // Update the document that matches the filter
      const res = await recruiterCollection.updateOne({ _id: new ObjectId(posId.publisherId) }, updateOperation);

      client.close();
  
      return result;
  
    } catch (error) {
      console.error('Error:', error);
    }
  }

  async function insertToArray(_id, publisherId, applayer_Id, field) {
    console.log('Received arguments:', _id, publisherId, applayer_Id);
    const client = await connectDB();
    const positionsCollection = client.positions();
    // console.log(positionsCollection)
    const query = { _id: new ObjectId(_id) };
    const result = await positionsCollection.updateOne(
      query,
      { $push: { [field]: applayer_Id } }
    );

    console.log("result:" ,result);
    client.close();
    return 200;
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
  
      const recruiterCollection = client.users("recruiters");
  
      // Create an update operation to pull the ID from the array field
      const updateOperation = {
        $pull: { positions: objectId },
      };
  
      // Update the document that matches the filter
      const res = await recruiterCollection.updateOne({ _id: new ObjectId(posId.publisherId) }, updateOperation);

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
      console.log("user: ", existingPosition);
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

    // Close the connection to the database
    client.close();

    return result.modifiedCount > 0; // Return true if at least one document was modified
  } catch (error) {
    console.error('Error:', error);
    return false;
  }
}
  

module.exports = { addPosition, getUserPositionsData, filterPositions, deletePosition, editPosition, getPositionData, updatePositionData, insertToArray };