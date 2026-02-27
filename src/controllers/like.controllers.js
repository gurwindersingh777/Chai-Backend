import mongoose, { isValidObjectId } from "mongoose"
import { Like } from "../models/like.model.js"
import ApiError from "../utils/ApiError.js";
import ApiRespone from "../utils/ApiResponse.js";
import AsyncHandler from "../utils/AsyncHandler.js";
import { Video } from "../models/video.model.js";
import { Comment } from "../models/comment.model.js";
import { Tweet } from "../models/tweet.model.js";

const toggleVideoLike = AsyncHandler(async (req, res) => {
  const { videoId } = req.params
  //TODO: toggle like on video
  if (!videoId) {
    throw new ApiError(400, "videoId is required")
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(400, "Video not found")
  }

  const alreadyLiked = await Like.findOneAndDelete({ video: videoId, likeBy: req.user._id });

  if (alreadyLiked) {
    return res
      .status(200)
      .json(
        new ApiRespone(200, true, "Video Unliked successfully")
      )
  }

  const like = await Like.create({ likeBy: req.user._id, video: videoId })
  return res
    .status(201)
    .json(
      new ApiRespone(201, like, "Video liked successfully")
    )

})

const toggleCommentLike = AsyncHandler(async (req, res) => {
  const { commentId } = req.params
  //TODO: toggle like on comment
  if (!commentId) {
    throw new ApiError(400, "commentId is required")
  }

  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new ApiError(400, "comment not found")
  }

  const alreadyLiked = await Like.findOneAndDelete({ comment: commentId, likeBy: req.user._id });

  if (alreadyLiked) {
    return res
      .status(200)
      .json(
        new ApiRespone(200, true, "Comment Unliked successfully")
      )
  }

  const like = await Like.create({ likeBy: req.user._id, comment: commentId })
  return res
    .status(201)
    .json(
      new ApiRespone(201, like, "Comment liked successfully")
    )

})

const toggleTweetLike = AsyncHandler(async (req, res) => {
  const { tweetId } = req.params
  //TODO: toggle like on tweet
  if (!tweetId) {
    throw new ApiError(400, "tweetId is required")
  }

  const tweet = await Tweet.findById(tweetId);

  if (!tweet) {
    throw new ApiError(400, "tweet not found")
  }

  const alreadyLiked = await Like.findOneAndDelete({ tweet: tweetId, likeBy: req.user._id });

  if (alreadyLiked) {
    return res
      .status(200)
      .json(
        new ApiRespone(200, true, "Tweet Unliked successfully")
      )
  }

  const like = await Like.create({ likeBy: req.user._id, tweet: tweetId })
  return res
    .status(201)
    .json(
      new ApiRespone(201, like, "Tweet liked successfully")
    )
}
)

const getLikedVideos = AsyncHandler(async (req, res) => {
  //TODO: get all liked videos

  const allLikedVideos = await Like.find({ likeBy: req.user._id, video: { $exists: true } })

  if (allLikedVideos.length === 0) {
    return res.status(200).json(
      new ApiRespone(200, [], "No videos found")
    );
  }

  return res
    .status(200)
    .json(
      new ApiRespone(200, allLikedVideos, "User liked videos fetched successfully")
    )
})

export {
  toggleCommentLike,
  toggleTweetLike,
  toggleVideoLike,
  getLikedVideos
}