const express = require('express');
const mongoose = require('mongoose');
const fs = require('fs').promises;
const path = require('path');
const session = require('express-session');  // Add this line
const bcrypt = require('bcrypt'); 
const app = express();
const port = 3000;
const router = express.Router();
const User = require('./Model/user');
const Review = require('./Model/review');
const Comment = require('./Model/comment');
const Establishment = require('./Model/establishment');

// Serve the styles.css file directly
app.get('/styles.css', (req, res) => {
  res.sendFile(path.join(__dirname, 'styles.css'));
});

mongoose.connect('mongodb+srv://julliantalino:Suicidalneko1@nekokami.hcwrogz.mongodb.net/?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB connected');
  })
  .catch((err) => {
    console.error('MongoDB connection error', err);
  });

// Middleware for parsing JSON and handling URL-encoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware
app.use(session({
  secret: 'your-secret-key',
  resave: true,
  saveUninitialized: true
}));

// Serve static files (HTML, CSS, images) from a directory
app.use(express.static('public'));

// Routes
app.use('/', router);


// Homepage route
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/homepage.html');
});

// Home route
router.get('/homepage.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'homepage.html'));
});

// login route
router.get('/login.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

// Login route (POST method)
router.post('/login', async (req, res) => {
  res.sendFile(path.join(__dirname, 'homepage.html'));
});

// Register route
router.get('/register.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'register.html'));
});

// Registration route
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).send('Username or email is already taken');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    req.session.userId = newUser._id;

    res.redirect(`/userprofile/${newUser._id}`);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error during registration');
  }
});

// Createreview route
router.get('/createreview.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'createreview.html'));
});

// Create review (POST method)
router.post('/createreview', async (req, res) => {
  const { establishment, reviewTitle, reviewBody, rating, media } = req.body;

  try {

      if (!establishment || !reviewTitle || !reviewBody || !rating) {
          return res.status(400).send('All fields are required');
      }

      if (!req.session.userId) {
          return res.status(401).send('User not authenticated');
      }

      const reviewerId = req.session.userId;

      const newReview = new Review({
          establishment,
          title: reviewTitle,
          content: reviewBody,
          rating,
          reviewer: reviewerId,
      });

      await newReview.save();

      res.redirect('/success'); 
  } catch (err) {
      console.error(err);
      res.status(500).send('Error creating review');
  }
});

//User Profile route
router.get('/userprofile/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {

    const userProfile = await User.findById(userId);

    if (!userProfile) {
      return res.status(404).send('User profile not found');
    }

    res.render('userprofile', { userProfile });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error retrieving user profile');
  }
});

// About Us route
router.get('/aboutus.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'aboutus.html'));
});

// Establishments route
router.get('/establishments.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'establishments.html'));
});

// Edit review route
router.put('/editreview/:reviewId', async (req, res) => {
  const reviewId = req.params.reviewId;
  const { editedContent } = req.body;

  try {

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).send('Review not found');
    }

    review.content = editedContent;
    await review.save();

    res.redirect(`/reviewdetails/${reviewId}`); 
  } catch (err) {
    console.error(err);
    res.status(500).send('Error editing review');
  }
});

// Write a comment route
app.post('/establishmentowner', async(req, res) => {
  const reviewId = req.params.reviewId;
  const { text, authorId } = req.body; 

  try {

      const review = await Review.findById(reviewId);

      if (!review) {
          return res.status(404).send('Review not found');
      }

      const newComment = new Comment({
          text,
          author: authorId, 
          review: reviewId,
      });

      await newComment.save();

      review.comments.push(newComment);
      await review.save();

      res.redirect(`/review/${reviewId}`); 
  } catch (err) {
      console.error(err);
      res.status(500).send('Error adding comment');
  }
});

// editprofile route
router.get('/editprofile.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'editprofile.html'));
});

const isAuthenticated = (req, res, next) => {
  if (true) {
    next();
  }
};

// Apply the isAuthenticated middleware to routes that require authentication
router.post('/editprofile.html', isAuthenticated, async (req, res) => {
  try {
    const userId = req.session.userId; 

    const { shortDescription, profilePicture } = req.body;

    const updatedUser = await User.findByIdAndUpdate(userId, {
      shortDescription,
      profilePicture,
    }, { new: true }); 

    res.redirect('/homepage.html');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error updating profile');
  }
});

// Establishment Reviews route
router.get('/establishmentreviews/:establishmentId', async (req, res) => {
  const establishmentId = req.params.establishmentId;

  try {
      const establishment = await Establishment.findById(establishmentId);

      if (!establishment) {
          return res.status(404).send('Establishment not found');
      }

      const reviews = await Review.find({ establishment: establishmentId }).populate('reviewer');

      res.render('establishment-reviews', { establishment, reviews });
  } catch (err) {
      console.error(err);
      res.status(500).send('Error fetching establishment reviews');
  }
});

// full- review route
router.get('/full-review.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'full-review.html'));
});

// Render review details including associated comments
router.get('/reviewdetails/:reviewId', async (req, res) => {
  const reviewId = req.params.reviewId;

  try {
      const review = await Review.findById(reviewId).populate('reviewer').populate('comments');

      if (!review) {
          return res.status(404).send('Review not found');
      }

      res.render('review-details', { review });
  } catch (err) {
      console.error(err);
      res.status(500).send('Error fetching review details');
  }
});

// userprofile route
router.get('/userprofile.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'userprofile.html'));
});

// Route to display search results
router.get('/searchresults', async (req, res) => {
  const searchQuery = req.query.q; 

  try {
      // Fetch establishments based on the search query
      const establishments = await Establishment.find({
          $or: [
              { name: { $regex: searchQuery, $options: 'i' } },
              { description: { $regex: searchQuery, $options: 'i' } } 
          ]
      });

      res.render('search-results', { establishments, searchQuery });
  } catch (err) {
      console.error(err);
      res.status(500).send('Error fetching search results');
  }
});

// Edit review route
router.put('/editreview/:reviewId', async (req, res) => {
  const reviewId = req.params.reviewId;
  const { editedContent } = req.body;

  try {
    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).send('Review not found');
    }

    review.content = editedContent;
    await review.save();

    res.redirect(`/reviewdetails/${reviewId}`); 
  } catch (err) {
    console.error(err);
    res.status(500).send('Error editing review');
  }
});


module.exports = router;

// Listen for server connections
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
