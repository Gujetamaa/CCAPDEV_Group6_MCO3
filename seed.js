const express = require('express');
const mongoose = require('mongoose');
const User = require('./Model/user');
const Review = require('./Model/review');
const Comment = require('./Model/comment');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

mongoose.connect('mongodb+srv://julliantalino:Suicidalneko1@nekokami.hcwrogz.mongodb.net/?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true });

// Define a sample user data array
const sampleUsers = [
  { username: 'Ingrid', email: 'Ingrid@dlsu.edu.ph', password: 'ParkJihyo1' },
  { username: 'Jerico', email: 'Jerico@dlsu.edu.ph', password: 'ImNayeon2' },
  // Add more sample users as needed
];

// Define a sample review data array
const sampleReviews = [
  { title: 'Review 1', content: 'Enjoyed the atmosphere.', rating: 4, reviewer: 'Ingrid' },
  { title: 'Review 2', content: 'Will definitely come back.', rating: 5, reviewer: 'Jerico' },
  // Add more sample reviews as needed
];

// Define a sample comment data array
const sampleComments = [
  { text: 'Nice place!', username: 'Ingrid', review: 'Review 1' },
  { text: 'The staff is friendly.', username: 'Jerico', review: 'Review 2' },
  // Add more sample comments as needed
];

// Define a function to seed the database
const seedDatabase = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Review.deleteMany({});
    await Comment.deleteMany({});

    // Insert sample users into the database
    const createdUsers = await User.insertMany(sampleUsers);

    // Insert sample reviews into the database
const createdReviews = await Review.insertMany(sampleReviews.map(review => ({
  ...review,
  reviewer: createdUsers.find(user => user.username === review.reviewer)._id, // Find user by username and get their ObjectId
})));

    // Insert sample comments into the database
    await Comment.insertMany(sampleComments.map(comment => ({
      ...comment,
      author: createdUsers.find(user => user.username === comment.username)._id, // Find user by username and get their ObjectId
      review: createdReviews.find(review => review.title === comment.review)._id, // Find review by title and get its ObjectId
    })));

    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

// Call the seedDatabase function
seedDatabase();

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
