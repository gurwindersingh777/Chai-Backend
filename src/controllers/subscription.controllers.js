import mongoose, { isValidObjectId } from "mongoose"
import { User } from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import AsyncHandler from "../utils/AsyncHandler.js";


const toggleSubscription = AsyncHandler(async (req, res) => {
    const { channelId } = req.params
    // TODO: toggle subscription

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "invalid channel id")
    }

    const subscriptionExists = await Subscription.findOne({
        channel: channelId,
        subscriber: req.user._id
    })

    if (subscriptionExists) {
        await Subscription.findByIdAndDelete(subscriptionExists._id);
        return res
            .status(200)
            .json(
                new ApiResponse(200, [], "Unsubscribed successfully")
            )
    }

    const newSubscription = await Subscription.create({
        channel: channelId,
        subscriber: req.user._id
    })

    return res
       .status(200)
       .json(
        new ApiResponse(200,newSubscription,"Subscribed successfully")
       )
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = AsyncHandler(async (req, res) => {
    const { channelId } = req.params

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "invalid channel id")
    }

    const channel = await User.findById(channelId);

    if (!channel) {
        throw new ApiError(400, "Channel does not found")
    }

    const subscribers = await Subscription.find({ channel: channelId })

    if (!subscribers || subscribers.length === 0) {
        return res
            .status(200)
            .json(
                new ApiResponse(200, [], "There is no subsriber yet")
            )
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, subscribers, "Channel subscriber fetched successfully")
        )
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = AsyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "invalid subscriber id")
    }

    const channels = await Subscription.find({ subscriber: subscriberId })

    if (!channels || channels.length === 0) {
        return res
            .status(200)
            .json(
                new ApiResponse(200, [], "There is no subscribed channel yet")
            )
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, channels, "User all subscribed channel fetched successfully")
        )
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}