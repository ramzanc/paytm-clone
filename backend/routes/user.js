const express = require("express")
const zod = require("zod")
const bcrypt = require("bcrypt")
const config = require("config")
const jwt = require("jsonwebtoken")
const { User } = require("../db")

const userRouter = express.Router()

const signupValidation = zod.object({
    username: zod.string().email(),
    password: zod.string(),
    firstName: zod.string(),
    lastName: zod.string()
})

userRouter.post("/signup", async (req, res) => {
    const { success } = signupValidation.safeParse(req.body)

    if (!success) {
        res.status(411).json({
            msg: "Invalid inputs"
        })
    }

    const existingUser = await User.findOne({
        username: req.body.username
    })

    if(existingUser) {
        res.status(411).json({
            msg: "User already exists"
        })
    }

    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(req.body.password, saltRounds)

    const user = await User.create({
        username: req.body.username,
        password: hashedPassword,
        firstName: req.body.firstName,
        lastName: req.body.lastName
    })

    const userId = user._id

    const token = jwt.sign({userId}, config.get("jwtPrivateKey"))

    res.json({
        msg: "User created successfully",
        token: token
    })
})

userRouter.post("/signin", async (req, res) => {
    const user = await User.findOne({
        username: req.body.username
    })

    if(!user) {
        return res.status(404).json({
            msg: "Error while logging in"
        })
    }

    const passwordMatch = await bcrypt.compare(req.body.password, user.password)
    
    if(!passwordMatch) {
        return res.status(404).json({
            msg: "Error while logging in"
        }) 
    }

    const token = jwt.sign({userId: user._id}, config.get("jwtPrivateKey"))
    return res.json({
        token: token
    })

})

module.exports = {
    userRouter
}