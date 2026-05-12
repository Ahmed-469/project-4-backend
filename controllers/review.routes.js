const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Game = require('../models/Game');
const User = require('../models/User');     

// Create a new review for a game
router.post('/games/:gameId/reviews', async (req, res) => {
  try {
    const { gameId } = req.params;
    const { content, starRating, authorId } = req.body; 

    // Validate input
    if (!content || !starRating || !authorId) {
      return res.status(400).json({ error: 'Content, star rating, and author ID are required' });
    }   

    // Check if the game exists
    const game = await Game.findBy      
    Id(gameId);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }       
    // Check if the author exists
    const author = await User.findById(authorId);   
    if (!author) {
      return res.status(404).json({ error: 'Author not found' });
    }       
    // Create the review
    const review = new Review({
      content,
      starRating,       

    })
    review.author = author._id;
    await review.save();    
    // Add the review to the game
    game.reviews.push(review._id);
    await game.save();    
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create review' });
  }         
});

module.exports = router;    


        
