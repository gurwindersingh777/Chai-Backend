import mongoose from "mongoose";
import { upload } from "../middlewares/multer.middleware.js";
import { User } from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiRespone from "../utils/ApiResponse.js";
import AsyncHandler from "../utils/AsyncHandler.js";
import { uploadOnCloudinary, deleteOnCloudinary } from "../utils/cloudinary.js"
import jwt from "jsonwebtoken"


const generateAccessAndRefreshToken = async (user_id) => {
  try {
    const user = await User.findById(user_id);

    if (!user) {
      throw new ApiError(400, "User not Found")
    }
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false })

    return { accessToken, refreshToken }
  } catch (error) {
    throw new ApiError(500, "Something went wrong while gernating access and refresh tokens")
  }
}
const registerUser = AsyncHandler(async (req, res) => {
  // Get data from user
  // Validating data
  // Check if user aready exist. 
  //  Get avatar,coverimage-optional // upload file in cloudinary
  //create user entry
  // crete user obj without password,refreshtoken
  // return response

  const { username, fullname, email, password } = req.body

  if (username.trim() === "") throw new ApiError(400, "username is require")
  if (fullname.trim() === "") throw new ApiError(400, "fullname is require")
  if (email.trim() === "") throw new ApiError(400, "email is require")
  if (password.trim() === "") throw new ApiError(400, "password is require")

  const existedUser = await User.findOne({
    $or: [{ username }, { email }]
  })
  if (existedUser) throw new ApiError(400, "User is already exists");

  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverimage?.[0]?.path;

  if (!avatarLocalPath) throw new ApiError(400, "Avatar file is require");
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  if (!avatar) throw new ApiError(400, "Avatar is required");

  let coverimage;
  if (coverImageLocalPath) coverimage = await uploadOnCloudinary(coverImageLocalPath);

  try {
    const user = await User.create({
      fullname,
      username: username.toLowerCase(),
      email,
      password,
      "avatar": avatar.url,
      "coverimage": coverimage?.url || "",
    })

    const createUser = await User.findById(user._id).select(
      "-password -refreshToken"
    )
    if (!createUser) throw new ApiError(500, "Someting went wrong while registering the user")

    return res.status(201).json(
      new ApiRespone(200, createUser, "User Successfully register ")
    )
  } catch (error) {
    console.log("Failed to register a user", error);

    if (avatar) deleteOnCloudinary(avatar.public_id);
    if (coverimage) deleteOnCloudinary(coverimage.public_id);

    throw new ApiError(200, "Error in resgister a user and file deleted from Cloudinary");
  }
})
const loginUser = AsyncHandler(async (req, res) => {


  // Get Data form Fronted
  const { email, password } = req.body;

  // Validate Email and Password
  if ([email, password].some((input) => input.trim() === "")) {
    throw new ApiError(400, "Enter a valid email")
  }

  // Check if user not exists
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(400, "Email does not exists")
  }

  // Match password 
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Password Incorrect")
  }

  // Genrate Refresh and Access token
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  )

  if (!loggedInUser) {
    throw new ApiError(500, "Failded to get logged in user data")
  }

  const options = {
    httpOnly: true,
    secure: false, // true in prod
    sameSite: "lax",
  }

  // return response
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiRespone(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "user Logged in Successfully")
    )
})
const logoutUser = AsyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      }
    },
    { new: true }
  )

  const options = {
    httpOnly: true,
    secure: false, // true in prod
    sameSite: "lax",
  }

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
      new ApiRespone(200, {}, "Logout Successfully")
    )
})
const refreshAccessToken = AsyncHandler(async (req, res) => {

  const incomingRefreshToken = req.cookies.refreshToken;
  if (!incomingRefreshToken) {
    throw new ApiError(401, "Refresh token is required")
  }

  try {
    const decordedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
    const user = await User.findById(decordedToken?._id);
    if (!user) {
      throw new ApiError(404, "invalid refresh token")
    }
    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "invalid refresh token")
    }

    const options = {
      httpOnly: true,
      secure: false, // true in prod
      sameSite: "lax",
    }

    const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshToken(User._id)

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        200,
        { accessToken, refreshToken: newRefreshToken },
        "Access tken refresh successfully"
      )
  } catch (error) {
    throw new ApiError(401, "Unable to generate new access token")
  }
})
const changeCurrentPassword = AsyncHandler(async (req, res) => {

  const { currentPassword, newPassword } = req.body;

  // Validate Data
  if (!currentPassword) {
    throw new ApiError(400, "current password  is required")
  }
  if (!newPassword) {
    throw new ApiError(400, "new password  is required")
  }

  console.log(req?.user?._id);

  // Check if user not exists
  const user = await User.findById(req.user?._id);
  if (!user) {
    throw new ApiError(400, "Email does not exists")
  }

  // Match password 
  const isPasswordValid = await user.isPasswordCorrect(currentPassword);
  if (!isPasswordValid) {
    throw new ApiError(401, "Current Password Incorrect")
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(
      new ApiRespone(200, {}, "Password change successfully")
    )

})
const getCurrentUser = AsyncHandler(async (req, res) => {

  return res
    .status(200)
    .json(
      new ApiRespone(200, req.user, "Current User details")
    )
})
const updateAccountDetails = AsyncHandler(async (req, res) => {
  const { fullname, username } = req.body;

  if (!(fullname.trim() && username.trim())) {
    throw new ApiError(400, "Fullname and username is required")
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullname,
        username
      }
    },
    { new: true }
  ).select(["-password -refreshToken"])


  return res
    .status(200)
    .json(
      new ApiRespone(200, user, "Account detials update successfully")
    )


})
const updateUserAvatar = AsyncHandler(async (req, res) => {

  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required")
  }
  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar.url) {
    throw new ApiError(500, "Failed to upload avatar")
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        avatar: avatar.url
      }
    }, { new: true }
  ).select(["-password -refreshToken"])

  return res
    .status(200)
    .json(
      new ApiRespone(200, user, "Avatar updated successfully")
    )
})
const updateUserCoverImage = AsyncHandler(async (req, res) => {
  const coverimageLocalPath = req.file?.path;

  if (!coverimageLocalPath) {
    throw new ApiError(400, "cover image is required")
  }
  const coverimage = await uploadOnCloudinary(coverimageLocalPath);

  if (!coverimage.url) {
    throw new ApiError(500, "Failed to upload cover image")
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        coverimage: coverimage.url
      }
    }, { new: true }
  ).select("-password -refreshToken")

  return res
    .status(200)
    .json(
      new ApiRespone(200, user, "Cover Image updated successfully")
    )
})
const getUserChannelProfile = AsyncHandler(async (req, res) => {
  const { username } = req.params

  if (!username?.trim()) {
    throw new ApiError(400, "username is missing")
  }

  const channel = await User.aggregate([
    {
      $match: {
        username: username?.toLowerCase()
      }
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers"
      }
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo"
      }
    },
    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers"
        },
        channelsSubscribedToCount: {
          $size: "$subscribedTo"
        },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false
          }
        }
      }
    },
    {
      $project: {
        fullName: 1,
        username: 1,
        subscribersCount: 1,
        channelsSubscribedToCount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1,
        email: 1

      }
    }
  ])

  if (!channel?.length) {
    throw new ApiError(404, "channel does not exists")
  }

  return res
    .status(200)
    .json(
      new ApiRespone(200, channel[0], "User channel fetched successfully")
    )
})
const getWatchHistory = AsyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id)
      }
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullName: 1,
                    username: 1,
                    avatar: 1
                  }
                }
              ]
            }
          },
          {
            $addFields: {
              owner: {
                $first: "$owner"
              }
            }
          }
        ]
      }
    }
  ])

  if (!user) {
    throw new ApiError(400, "User not found")
  }

  return res
    .status(200)
    .json(
      new ApiRespone(200, user[0].watchHistory, "Watch history fetched successfully")
    )
})

export {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory
};