const { MongoClient } = require("mongodb");

class MessageQueue {
  constructor(url, dbName, collectionName) {
    this.url = url;
    this.dbName = dbName;
    this.collectionName = collectionName;
  }

  async connect() {
    this.client = new MongoClient(this.url, { useNewUrlParser: true, useUnifiedTopology: true });
    await this.client.connect();
    this.db = this.client.db(this.dbName);
    this.collection = this.db.collection(this.collectionName);
  }

  async enqueue(message) {
    await this.collection.insertOne(message);
  }

  async dequeue() {
    const message = await this.collection.findOneAndDelete({}, { sort: { _id: 1 } });
    return message.value;
  }

  async listen(callback) {
    const changeStream = this.collection.watch();
    changeStream.on('change', async (change) => {
      if (change.operationType === 'insert') {
        const message = change.fullDocument;
        await callback(message);
      }
    });
  }

  async close() {
    await this.client.close();
  }
}

module.exports = MessageQueue;
