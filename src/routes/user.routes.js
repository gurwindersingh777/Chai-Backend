import { Router } from "express";
import { registerUser, logoutUser, loginUser, getCurrentUser, changeCurrentPassword, refreshAccessToken, updateAccountDetails, updateUserCoverImage, getUserChannelProfile, getWatchHistory, updateUserAvatar } from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";
import verifyJWT from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(upload.fields([
  { name: "avatar", maxCount: 1 },
  { name: "coverimage", maxCount: 1 }
]), registerUser);
router.route("/login").post(loginUser);

router.route("/logout").post(verifyJWT, logoutUser);
router.route("refresh-token").post(verifyJWT, refreshAccessToken)
router.route("/change-password").post(verifyJWT, changeCurrentPassword);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/update-account").patch(verifyJWT, updateAccountDetails)
router.route("/update-avatar").post(verifyJWT, upload.single("avatar"), updateUserAvatar)
router.route("/update-coverimage").post(verifyJWT, upload.single("coverimage"), updateUserCoverImage)
router.route("/channel/:username").get(verifyJWT, getUserChannelProfile)
router.route("/history").get(verifyJWT, getWatchHistory)
export default router;

