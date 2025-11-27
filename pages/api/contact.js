import { MongoClient } from 'mongodb';

async function handler(req, res) {
  if (req.method === 'POST') {
    const { email, name, message } = req.body;

    if (
      !email ||
      !email.includes('@') ||
      !name ||
      name.trim() === '' ||
      !message ||
      message.trim() === ''
    ) {
      res.status(422).json({ message: 'Invalid input.' });
      return;
    }

    const newMessage = {
      email,
      name,
      message,
    };

    // Check that required environment variables are present
    const required = [
      'mongodb_username',
      'mongodb_password',
      'mongodb_clustername',
      'mongodb_database',
    ];

    const missing = required.filter((k) => !process.env[k]);
    if (missing.length > 0) {
      console.error('Missing required env vars for DB connection:', missing);
      res
        .status(500)
        .json({ message: `Server misconfigured: missing env vars: ${missing.join(', ')}` });
      return;
    }

    // Build connection string (Atlas cluster host uses a cluster-specific suffix)
    const connectionString = `mongodb+srv://${process.env.mongodb_username}:${process.env.mongodb_password}@${process.env.mongodb_clustername}.2oabl2v.mongodb.net/?appName=${process.env.mongodb_clustername}/&retryWrites=true&w=majority`;

    // Reuse client when possible (helps in dev / serverless environments)
    let client = global._mongoClient;
    try {
      if (!client) {
        client = await MongoClient.connect(connectionString);
        // keep the connected client on the global object so we reuse across hot reloads
        global._mongoClient = client;
      }
    } catch (error) {
      console.error('Mongo connection error:', error?.message || error);
      res.status(500).json({ message: 'Could not connect to database. Check credentials / network access.' });
      return;
    }

    const db = client.db(process.env.mongodb_database);

    try {
      const result = await db.collection('messages').insertOne(newMessage);
      newMessage.id = result.insertedId;
    } catch (error) {
      console.error('DB insert error:', error?.message || error);
      // Do not close global client here — reusing across requests is preferred
      res.status(500).json({ message: 'Storing message failed!' });
      return;
    }

    res.status(201).json({ message: 'Successfully stored message!', message: newMessage });
  }
}

export default handler;
