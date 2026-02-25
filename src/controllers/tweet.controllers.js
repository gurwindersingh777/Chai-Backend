import mongoose, { isValidObjectId } from "mongoose"
import { Tweet } from "../models/tweet.model.js"
import { User } from "../models/user.model.js"
import ApiError from "../utils/ApiError.js";
import ApiRespone from "../utils/ApiResponse.js";
import AsyncHandler from "../utils/AsyncHandler.js";

const createTweet = AsyncHandler(async (req, res) => {
  //TODO: create tweet
  const { content } = req.body
  if (!content) {
    throw new ApiError(400, "Content is required")
  }

  const tweet = await Tweet.create({
    content,
    owner: req.user._id
  })

  if (!tweet) {
    throw new ApiError(400, "Failed to create tweet")
  }

  return res
    .status(201)
    .json(
      new ApiRespone(201, tweet, "Tweet created successfully")
    )
})

const getUserTweets = AsyncHandler(async (req, res) => {
  // TODO: get user tweets
})

const updateTweet = AsyncHandler(async (req, res) => {
  //TODO: update tweet
  const { tweetId } = req.params
  const { content } = req.body

  if (!content) {
    throw new ApiError(400, "Content is required")
  }

  const tweet = await Tweet.findById(tweetId);

  if (!tweet) {
    throw new ApiError(404, "Tweed not found")
  }

  const updatedTweet = await Tweet.findByIdAndUpdate(
    tweetId,
    { content },
    { new: true }
  )

  if (!updatedTweet) {
    throw new ApiError(400, "Failed to upadte tweet")
  }

  return res
    .status(200)
    .json(
      new ApiRespone(200, updatedTweet, "Tweet upadted successfully")
    )
})

const deleteTweet = AsyncHandler(async (req, res) => {
  //TODO: delete tweet
  const { tweetId } = req.params

  await Tweet.findByIdAndDelete(tweetId)

  return res
    .status(200)
    .json(
      new ApiRespone(200, [], "Tweet deleted successfully")
    )
})

export {
  createTweet,
  getUserTweets,
  updateTweet,
  deleteTweet
}