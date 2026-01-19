import  AsyncHandler  from "../utils/AsyncHandler.js";
import  ApiResponse  from "../utils/ApiResponse.js";


const healthcheck = AsyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, "OK", "Health Check Passed"))
})

export default  healthcheck