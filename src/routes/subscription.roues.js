import { Router } from 'express';
import verifyJWT from '../middlewares/auth.middleware.js';
import { getSubscribedChannels, getUserChannelSubscribers, toggleSubscription } from '../controllers/subscription.controllers.js';

const router = Router();

router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/c/:channelId").post(toggleSubscription).get(getUserChannelSubscribers);
router.route("/u/:subscriberId").get(getSubscribedChannels);       // List subscribers of channel

export default router