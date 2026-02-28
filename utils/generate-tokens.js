import { ApiError } from "./ApiError.js";

export const generateTokens = async (user) => {
  if (!user) {
    throw new ApiError(401, "User not found for token generation");
  }

  try {
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Failed to generate authentication tokens");
  }
};