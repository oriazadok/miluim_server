const express = require('express');

const app = express();
const port = 3000;

const { MongoClient } = require('mongodb');
const mongoConnectionString ='mongodb+srv://oriazadok:sz3ucFQwxqx5Avk@cluster0.feaagjf.mongodb.net/?retryWrites=true&w=majority';


async function retrieveDataFromAtlas() {
  try {
    // Connect to MongoDB Atlas
    const client = await MongoClient.connect(mongoConnectionString, { useNewUrlParser: true, useUnifiedTopology: true });

    // Get the database and collection
    const db = client.db("sample_analytics"); // Change to your actual database name
    const collection = db.collection("accounts");

    // Retrieve data from the collection
    const retrievedData = await collection.find({}).toArray();

    // Log the retrieved data
    console.log('Retrieved Data:', retrievedData);

    // Close the connection to the database
    client.close();
  } catch (error) {
    console.error('Error:', error);
  }
}
// retrieveDataFromAtlas();
async function insertDataToAtlas(dataToInsert) {
  try {
    // Connect to MongoDB Atlas
    const client = await MongoClient.connect(mongoConnectionString, { useNewUrlParser: true, useUnifiedTopology: true });

    // Get the database and collection
    const db = client.db("my_database");
    const collection = db.collection("my_collection");

    const result = await collection.deleteMany({});
    // console.log(`${result.deletedCount} documents deleted.`);

    // Loop through the dataToInsert array and insert each object into the collection
    for (const data of dataToInsert) {
      // Convert the date to ISO format using moment.js
      data.date = moment(data.date, 'YYYY MMM DD').toISOString();

      // Insert the data object into the collection
      await collection.insertOne(data);
      // console.log('Data inserted successfully:', data);
    }

    // Close the connection to the database
    client.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});