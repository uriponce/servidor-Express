import mongoose from 'mongoose';

async function connectDB(uri) {
  await mongoose.connect(uri);
  console.log('MongoDB conectado');
}

export default connectDB;
