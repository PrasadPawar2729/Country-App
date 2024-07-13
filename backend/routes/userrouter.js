const express = require('express');
const userRouter = express.Router();
const bcryptjs = require('bcrypt');
const jwt = require('jsonwebtoken');
const { UserModel } = require('../model/usermodel');
const { CountryModel } = require('../model/coutryModel');
const { auth } = require('../middleware/auth')
require('dotenv').config()
// User Registration
userRouter.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcryptjs.genSalt(10);
    const hp = await bcryptjs.hash(password, salt);

    // Create new user
    const User = new UserModel({ name, email, password: hp });
    await User.save();

    return  res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error(error);
    return  res.status(500).json({ message: 'Failed to register user' });
  }
});

// User Login
userRouter.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Compare passwords
    const ischeck = await bcryptjs.compare(password, user.password);
    if (!ischeck) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY);

    return res.status(200).json({
      token });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ err:error.message, message: 'Failed to log in' });
  }
});

userRouter.post('/:userId/favorites',auth, async (req, res) => {
    const { userId } = req.params;
    const { countryId } = req.body;
  
    try {
      const user = await UserModel.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      const country = await CountryModel.findById({_id:countryId});
      if (!country) {
        return res.status(404).json({ message: 'Country not found' });
      }
  
      user.favorites.push(countryId);
      await user.save();
  
      return  res.status(201).json({ message: 'Country added to favorites successfully' });
    } catch (error) {
      console.error(error);
      return  res.status(500).json({ message: 'Failed to add country to favorites' });
    }
  });

  userRouter.get('/:userId/favorites',auth, async (req, res) => {
    const { userId } = req.params;
  
    try {
      const user = await UserModel.findById(userId).populate('favorites');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      return  res.json(user.favorites);
    } catch (error) {
      console.error(error);
     return res.status(500).json({ message: 'Failed to retrieve favorites' });
    }
  });
  userRouter.post('/:userId/search-history',auth, async (req, res) => {
    const { userId } = req.params;
    const { searchQuery } = req.body;
  
    try {
      const user = await UserModel.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      user.searchHistory.push(searchQuery);
      if (user.searchHistory.length > 5) {
        user.searchHistory.shift(); 
      }
      await user.save();
  
      res.json({ message: 'Search query added to history successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to add search query to history' });
    }
  });
  userRouter.get('/:userId/search-history',auth, async (req, res) => {
    const { userId } = req.params;
  
    try {
      const user = await UserModel.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      res.json(user.searchHistory.slice(-5).reverse());
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to retrieve search history' });
    }
  });
module.exports = {userRouter};