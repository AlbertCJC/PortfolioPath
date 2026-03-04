import { MongoClient } from 'mongodb';

async function run() {
  const client = new MongoClient("mongodb+srv://Albert172:Albert172.@cluster0.dpzsajd.mongodb.net/portfolio?appName=Cluster0");
  try {
    await client.connect();
    const db = client.db("test_db");
    const col = db.collection("test_col");
    await col.insertOne({ githubId: "123", val: 1 });
    const res = await col.findOneAndUpdate({ githubId: "123" }, { $set: { val: 2 } }, { returnDocument: 'after' });
    console.log(res);
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
}
run();
