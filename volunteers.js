const { DBConnection, connectDB } = require('./DBConnection');
const { ObjectId } = require('mongodb');

async function getVolunteers(query) {
  try {
    // Connect to MongoDB Atlas
    const client = await connectDB();

    // Get the collection of users based on their type
    const users = client.users("volunteers");

    // Convert ageFrom and ageTo to numbers
    const ageFrom = parseInt(query.ageFrom);
    const ageTo = parseInt(query.ageTo);

    // Initialize filter criteria
    let filterCriteria = {};

    // Add region, service, rovai, and profile to the filterCriteria if they exist in the query
    if (query.region) filterCriteria.region = query.region;
    if (query.service) filterCriteria.service = query.service;
    if (query.rovai) filterCriteria.rovai = { $gte: query.rovai };
    if (query.profile) filterCriteria.profile = { $gte: query.profile };

    // If ageFrom and ageTo are valid numbers, add age range to the filter criteria
    if (!isNaN(ageFrom) && !isNaN(ageTo)) {
      filterCriteria.age = { $gte: ageFrom, $lte: ageTo }
    }
  
    else {
      if (!isNaN(ageFrom)) {
        filterCriteria.age = { 
          $gte: ageFrom
         };
      }
      if (!isNaN(ageTo)) {
        filterCriteria.age = {
          $lte: ageTo 
        };
      }
    }
    

    console.log("filterCriteria: ", filterCriteria)

    // Find documents based on the filterCriteria
    const volunteersData = await users.find(filterCriteria).toArray();

    console.log("volunteersData: ", volunteersData);

    // Close the connection to the database
    client.close();

    // Return the retrieved data
    return volunteersData;
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
}

async function getVolunteersbyId(volunteersIds) {

  // Ensure positions array is not empty
  if (volunteersIds.length === 0) {
    return [];
  }

  try {
    // Connect to MongoDB Atlas
    const client = await connectDB();

    // Get the collection of users based on their type
    const users = client.users("volunteers");

    const positionIds = volunteersIds.map(positionId => new ObjectId(positionId));

    const query = { _id: { $in: positionIds } };


    // Find documents that match the query
    const result = await users.find(query).toArray();
    console.log("result: ", result);

    // Close the connection to the database
    client.close();

    // Return the retrieved data
    return result;
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
}



module.exports = { getVolunteers, getVolunteersbyId };