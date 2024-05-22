const { connect } = require('mongoose');

const connectDB = async () => {
  try {
    await connect(`mongodb+srv://javedhussaindev:JyUhYSqBPOvg4oJO@cluster0.miqiots.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`)
      .then((data) => {
        console.log(`connected to mongodb database: ${data.connection.host}`);
      });
  } catch (error) {
    console.log('error connecting to the database');
    console.log(error);
  }
}

module.exports = connectDB;
