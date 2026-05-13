const router = require("express").Router()
const verifyToken = require("../middleware/verify-token")
const Game = require("../models/Game")

// GET all games
router.get("/", async (req, res) => {
  try {
    const games = await Game.find().populate("author")
    res.json(games)
  }
  catch (err) {
    res.status(500).json(err)
  }
})

// GET single game
router.get("/:gameId", async (req, res) => {
  try {
    const game = await Game.findById(req.params.gameId).populate("reviews.author", "username")

    if (!game) return res.status(404).json({ message: "Game not found" })

    res.json(game)
  }
  catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// CREATE game (owner only)
router.post("/", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "owner") {
      return res.status(403).json({ message: "Owner only" })
    }

    req.body.author = req.user._id

    const game = await Game.create(req.body)
    res.status(201).json(game)
  }
  catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// UPDATE game
router.put("/:gameId", verifyToken, async (req, res) => {
  try {

    const updatedGame = await Game.findOneAndUpdate(
      {
        _id: req.params.gameId,
        author: req.user._id,
      },
      req.body,
      { new: true }
    )

    if (!updatedGame) {
      return res.status(404).json({
        message: "Game not found",
      })
    }
    res.json(updatedGame)
  }
  catch (err) {
    res.status(500).json(err)
  }
})

// DELETE game
router.delete("/:gameId", verifyToken, async (req, res) => {
  try {
    const deletedGame = await Game.findOneAndDelete({
      _id: req.params.gameId,
      author: req.user._id,
    })
    if (!deletedGame) {
      return res.status(404).json({
        message: "Game not found",
      })
    }
    res.json(deletedGame)
  }
  catch (err) {
    res.status(500).json(err)
  }
})

module.exports = router