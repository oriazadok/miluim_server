const { MongoClient } = require('mongodb');

// MongoDB Atlas connection string
const mongoConnectionString = 'mongodb+srv://drushim4miluim:mkqDvuArtqrhMi2h@cluster0.jhowezn.mongodb.net/?retryWrites=true&w=majority';



class DBConnection {
    constructor(client) {
        this.client = client;
        this.db = this.client.db("miluim");
    
    }
  
    auth() {
        // Get the database and collection
        return this.db.collection("auth");
    }
  
    users(type) {
        const types = ["recruiters", "volunteers"];
  
        if (!types.includes(type)) {
            return null;
        }
  
        return this.db.collection(type);
    }

    volunteers() {
        return this.db.collection("volunteers");
    }
  
    positions() {

        // Get the database and collection
        return this.db.collection("positions");
    }
  
    close() {
        if (this.client) {
            this.client.close();
        }
    }
  }
  
  /**
  * 
  * @returns Promis<DBConnection> the db
  */
  async function connectDB() {
  
    // Connect to MongoDB Atlas
    const client = await MongoClient.connect(mongoConnectionString);
  
    return new DBConnection(client);
  }
  
  module.exports = { DBConnection, connectDB };  