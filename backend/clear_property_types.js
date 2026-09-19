require('dotenv').config();
const mongoose = require('mongoose');
const BrokerSetting = require('./src/models/BrokerSetting');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');
  const result = await BrokerSetting.updateMany({}, { $set: { propertyTypes: [] } });
  console.log('Update result:', result);
  process.exit(0);
}
run().catch(console.error);
