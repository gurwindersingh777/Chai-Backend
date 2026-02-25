import mongoose from "mongoose"
import { Comment } from "../models/comment.model.js"
import ApiError from "../utils/ApiError.js";
import ApiRespone from "../utils/ApiResponse.js";
import AsyncHandler from "../utils/AsyncHandler.js";

const getVideoComments = AsyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params
  const { page = 1, limit = 10 } = req.query

  const pageNumber = Number(page)
  const limitNumber = Number(limit)
  console.log(videoId);
  

  const skip = (pageNumber - 1) * limitNumber;

  const comments = await Comment.aggregate([
    {
      $match: {
        video: new mongoose.Types.ObjectId(videoId)
      }
    },
    {
      $skip: skip
    },
    {
      $limit: limitNumber
    }
  ])

  if (comments.length === 0) {
    return res
      .status(200)
      .json(
        new Response(200, [], "No comments")
      )
  }

  return res
    .status(200)
    .json(
      new ApiRespone(200, comments, "Comments fetched successfully")
    )
})

const addComment = AsyncHandler(async (req, res) => {
  // TODO: add a comment to a video
  const { videoId } = req.params
  const { content } = req.body

  if (!videoId) {
    throw new ApiError(400, "Video id is required")
  }

  if (!content) {
    throw new ApiError(400, "Comment content is required")
  }

  const comment = await Comment.create({
    content: content,
    owner: req.user._id,
    video: videoId
  })

  if (!comment) {
    throw new ApiError(400, "Failed to add comment")
  }

  return res
    .status(201)
    .json(
      new ApiRespone(201, comment, "Comment added successfully")
    )


})

const updateComment = AsyncHandler(async (req, res) => {
  // TODO: update a comment
  const { commentId } = req.params
  const { content } = req.body

  if (!content) {
    throw new ApiError(400, "Content is required");
  }

  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new ApiError(404, "Comment does not found");
  }

  const updatedComment = await Comment.findByIdAndUpdate(commentId,
    { content },
    { new: true }
  )

  if (!updatedComment) {
    throw new ApiError(400, "Failed to update comment")
  }

  return res
    .status(200)
    .json(
      new ApiRespone(200, updatedComment, "Comment updated successfully")
    )

})

const deleteComment = AsyncHandler(async (req, res) => {
  // TODO: delete a comment
  const { commentId } = req.params

  await Comment.findByIdAndDelete(commentId);

  return res
    .status(200)
    .json(
      new ApiRespone(200, {}, "Comment deleted Successfully")
    )
})

export {
  getVideoComments,
  addComment,
  updateComment,
  deleteComment
}