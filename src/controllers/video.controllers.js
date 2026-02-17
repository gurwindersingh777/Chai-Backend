import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import asyncHandler from "../utils/AsyncHandler.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
  //TODO: get all videos based on query, sort, pagination


})

// DONE
const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body
  // TODO: get video, upload to cloudinary, create video

  if (!title) {
    throw new ApiError(400, "Title is required")
  }

  const videoFilePath = req.files?.videoFile?.[0]?.path;
  const thumbnailPath = req.files?.thumbnail?.[0]?.path;

  if (!videoFilePath) {
    throw new ApiError(400, "Video file is required")
  }

  const videoFile = await uploadOnCloudinary(videoFilePath);
  const thumbnail = await uploadOnCloudinary(thumbnailPath);

  if (!videoFile) {
    throw new ApiError(500, "Failed to upload video")
  }


  const video = await Video.create({
    title: title,
    description: description || "",
    videoFile: videoFile?.url,
    thumbnail: thumbnail?.url || "",
    duration: videoFile?.duration,
    owner: res.user
  });

  if (!video) {
    throw new ApiError(500, "Failed to upload video")
  }

  return res
    .status(200)
    .json(
      new ApiResponse(201, video, "Video publish successfully")
    )

})

// DONE
const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params
  //TODO: get video by id

  if (!videoId) {
    throw new ApiError(400, "Video id is required")
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(500, "Failed to get video")
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, video, "Video fetched successfully")
    )

})

// DONE
const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params
  //TODO: update video details like title, description, thumbnail
  if (!videoId) {
    throw new ApiError(400, "Video id is required")
  }

  const { title, description } = req.body

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(400, "Video not found")
  }

  if (title) video.title = title;

  if (description) video.description = description;

  const thumbnailPath = req.file?.path;

  if (thumbnailPath) {
    const thumbnail = await uploadOnCloudinary(thumbnailPath);
    video.thumbnail = thumbnail.url

  }

  await video.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(
      new ApiResponse(200, video, "Video upadted successfully")
    )
})

// DONE
const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params
  //TODO: delete video
  if (!videoId) {
    throw new ApiError(400, "Video id is required")
  }

  await Video.findByIdAndDelete(videoId);

  return res
    .status(200)
    .json(
      new ApiResponse(200, "Video Deleted successfully")
    )

})

// DONE 
const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params

  if (!videoId) {
    throw new ApiError(400, "Video id is required")
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError("Video not found")
  }

  if (video.isPublished === true) {
    video.isPublished = false;
  }
  else {
    video.isPublished = true;
  }

  await video.save({ validateBeforeSave: false })

  return res
    .status(200)
    .json(
      new ApiResponse(200, video, "Publish status updated successfully")
    )
})

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus
}