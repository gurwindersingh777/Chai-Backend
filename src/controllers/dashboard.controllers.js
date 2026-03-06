import mongoose from "mongoose"
import { Video } from "../models/video.model.js"
import { Subscription } from "../models/subscription.model.js"
import { Like } from "../models/like.model.js"
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import AsyncHandler from "../utils/AsyncHandler.js";

const getChannelStats = AsyncHandler(async (req, res) => {
  // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
  const videosStat = await Video.aggregate(
    [
      {
        $match: { owner: req.user._id }
      },
      {
        $group: {
          _id: "$owner",
          totalviews: { $sum: "$views" },
          totalVideos: { $sum: 1 }
        }
      }
    ]
  )

  const videos = await Video.find({ owner: req.user._id }).select("_id")

  const likesCount = await Like.aggregate([
    {
      $match: { video: { $in: videos.map(video => video._id) } }
    },
    {
      $count: "totalLikes"
    }
  ])

  const totalSubscriber = await Subscription.aggregate([
    {
      $match: { channel: req.user._id }
    },
    {
      $group: {
        _id: "$channel",
        totalSubsciber: {
          $sum: 1
        }
      }
    }
  ])

  return res
    .status(200)
    .json(
      new ApiResponse(200, {
        videosStats: { totalviews: videosStat[0]?.totalviews, totalVideos: videosStat[0]?.totalVideos },
        totalLikes: likesCount[0]?.totalLikes,
        totalSubscribers: totalSubscriber[0]?.totalSubsciber
      }, "User stats fetched successfully")
    )

})

const getChannelVideos = AsyncHandler(async (req, res) => {
  // TODO: Get all the videos uploaded by the channel

  const videos = await Video.find({ owner: req.user._id })

  if (!videos || videos.length === 0) {
    return res
      .status(200)
      .json(
        new ApiResponse(200, [], "There is no videos")
      )
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, videos, "User videos fetched successfully")
    )
})

export {
  getChannelStats,
  getChannelVideos
}