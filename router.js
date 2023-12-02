const express = require('express');
const router = express.Router();
const Comment = require('./Model/comment');
const Review = require('./Model/review');
const User = require('./Model/user');


router.get('/', async function(req, res) {
  res.render('homapage'); 

});
// Route to get all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route to create a new user
router.post('/users', async (req, res) => {
  const user = new User({
    // Assuming the request body contains username, email, and password
    username: req.body.username,
    email: req.body.email,
    password: req.body.password
  });
  try {
    const newUser = await user.save();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Route to get all reviews
router.get('/review', async (req, res) => {
  try {
    const reviews = await Review.find();
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route to create a new review
router.post('/review', async (req, res) => {
  const review = new Review({
    // Assuming the request body contains title, content, rating, and reviewer
    title: req.body.title,
    content: req.body.content,
    rating: req.body.rating,
    reviewer: req.body.reviewer
  });
  try {
    const newReview = await review.save();
    res.status(201).json(newReview);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Route to get all comments
router.get('/comment', async (req, res) => {
  try {
    const comments = await Comment.find();
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route to create a new comment
router.post('/comment', async (req, res) => {
  const comment = new Comment({
    // Assuming the request body contains text, author, and review
    text: req.body.text,
    author: req.body.author,
    review: req.body.review
  });
  try {
    const newComment = await comment.save();
    res.status(201).json(newComment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
