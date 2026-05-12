const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verify-token');
const Game = require('../models/Game');

// GET all reviews for a game (everyone - no auth needed)
router.get('/:gameId/reviews', async (req, res) => {
  try {
    const game = await Game.findById(req.params.gameId).populate('reviews.author', 'username');
    
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }
    
    res.json(game.reviews);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get reviews' });
  }
});

// CREATE review (logged in users)
router.post('/:gameId/reviews', verifyToken, async (req, res) => {
  try {
    const { gameId } = req.params;
    const { text, starRating } = req.body;

    // Validate input
    if (!text || !starRating) {
      return res.status(400).json({ error: 'Text and star rating are required' });
    }

    if (starRating < 1 || starRating > 5) {
      return res.status(400).json({ error: 'Star rating must be between 1 and 5' });
    }

    // Check if game exists
    const game = await Game.findById(gameId);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    // Create review
    const newReview = {
      text,
      starRating,
      author: req.user._id,
    };

    game.reviews.push(newReview);
    await game.save();
    await game.populate('reviews.author', 'username');

    res.status(201).json(game);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create review' });
  }
});

// UPDATE review (author only)
router.put('/:gameId/reviews/:reviewId', verifyToken, async (req, res) => {
  try {
    const { gameId, reviewId } = req.params;
    const { text, starRating } = req.body;

    const game = await Game.findById(gameId);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    const review = game.reviews.id(reviewId);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    // Check if user is the author
    if (review.author.toString() !== req.user._id) {
      return res.status(403).json({ error: 'Not your review' });
    }

    // Update review
    if (text) review.text = text;
    if (starRating) review.starRating = starRating;

    await game.save();
    await game.populate('reviews.author', 'username');
    res.json(game);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update review' });
  }
});

// DELETE review (author only)
router.delete('/:gameId/reviews/:reviewId', verifyToken, async (req, res) => {
  try {
    const { gameId, reviewId } = req.params;

    const game = await Game.findById(gameId);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    const review = game.reviews.id(reviewId);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    // Check if user is the author
    if (review.author.toString() !== req.user._id) {
      return res.status(403).json({ error: 'Not your review' });
    }

    // Delete review
    game.reviews.id(reviewId).deleteOne();
    await game.save();

    res.json(game);
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete review' });
  }
});

module.exports = router;
