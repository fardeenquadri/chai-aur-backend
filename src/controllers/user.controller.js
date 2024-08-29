import { asyncHandler } from '../utils/asyncHandler.js';
import {apiError} from '../utils/apiError.js'
import { User } from '../models/user.model.js'
import {uploadOnCloudinary} from  '../utils/cloudinary.js'
import { apiResponse } from '../utils/apiResponse.js'

const registerUser = asyncHandler (async (req, res) => {

    //get user details from frontend
    //validation - not empty
    //check if user already exists: username, email
    //check for images, check for avatar
    //upload to cloudinary, avatar 
    //create user object - create entry in db
    //remove password and refresh token field from response
    //check for user creation
    //return response

    const {fullname, username, email, password} = req.body
    console.log("Email: ", email);

    if (
        [fullname, username, email, password].some((fields) => 
        fields?.trim() === "")
    ) {
        throw new apiError(400, "All fields are required")
    }
    
    const existedUser = User.findOne({
        $or: [{ username }, { email }]
    })
    if(existedUser){
        throw new apiError(409, 'Username or Email already exist')
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;
    if (!avatarLocalPath) {
        throw new apiError(400, 'Avatar file is required')
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    if (!avatar) {
        throw new apiError(400, 'Avatar file is required')
    }

    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || '',
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(_id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new apiError(500, 'Something went wrong while registering the user')
    }

    return res.status(201).json(
        new apiResponse(200, createdUser, 'User registered successfully')
    )

})

export {registerUser}