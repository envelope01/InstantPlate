const mongoose = require('mongoose');

const mongoURI = "mongodb://localhost:27017/InstantPlate";

const connectToMongo = () => {
    mongoose.connect(mongoURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }).then(() => {
        console.log("Connected to MongoDB successfully");
    }).catch(err => {
        console.error("Failed to connect to MongoDB", err);
    });
}

module.exports = connectToMongo;