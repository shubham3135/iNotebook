const express = require("express");
const User = require("../models/User");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetchUser = require("../middleware/fetchUser");

const JWT_SECRET = 'shubhamkanotebookapp';

// Route 1: Create a user using: POST "/api/auth/createUser" . Doesn't require Auth
router.post(
    "/createUser",
    [
        body("name", "Enter a valid name").isLength({ min: 3 }),
        body("email", "Enter a valid email").isEmail(),
        body("password", "Password must be of atleast 5 characters").isLength({
            min: 5,
        }),
    ],
    async (req, res) => {
        let success = false;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            success = false;
            return res.status(400).json({success, errors: errors.array() });
        }

        //check whether the user with this email already exists
        try {
            let user = await User.findOne({ email: req.body.email });
            if (user) {
                success = false;
                return res
                    .status(400)
                    .json({success,  error: "Sorry a user with this email already exists" });
            }
            const salt = await bcrypt.genSalt(10);
            const secPass = await bcrypt.hash(req.body.password, salt);
            user = await User.create({
                name: req.body.name,
                email: req.body.email,
                password: secPass,
            });
            const data = {
                user:{
                    id: user.id
                }
            }
            const authtoken = jwt.sign(data, JWT_SECRET);
            success = true;
            res.json({ success,
                authtoken
            });
        } catch (error) {
            console.log(error.message);
            success = false
            res.status(500).send("Some error occured");
        }
        //   .then(user => res.json(user)).catch(err=>{console.log(err); res.json({error: "Please enter a unique value for email", message: err.message})});
    }
);

// Route 2: Authentication a user using: POST "/api/auth/login" . Doesn't require Auth
router.post(
    "/login",
    [
        body("email", "Enter a valid email").isEmail(),
        body("password", "Password cannot be blank").exists(),
    ],
    async (req, res) => {
        let success = false;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            success = false
            return res.status(400).json({success, errors: errors.array() });
        }

        //check whether the user with this email already exists
        try {
            const {email, password} = req.body;
            let user = await User.findOne({email});
            if(!user){
                success = false;
                return res.status(400).json({success, error: "Please try to login with correct credentials"});
            }
            const passwordCompare = await bcrypt.compare(password, user.password);
            if(!passwordCompare){
                success = false;
                return res.status(400).json({success, error: "Please try to login with correct credentials"});
            }
            const data = {
                user:{
                    id: user.id
                }
            }
            const authtoken = jwt.sign(data, JWT_SECRET);
            success = true;
            res.json({ success,
                authtoken
            });
        } catch (error) {
            console.log(error.message);
            success = false;
            res.status(500).send("Internal Server Error");
        }
        //   .then(user => res.json(user)).catch(err=>{console.log(err); res.json({error: "Please enter a unique value for email", message: err.message})});
    }
);


// Route 3: Get logged in user detail using : POST "/api/auth/getuser" . Login required
router.post(
    "/getuser",
    fetchUser,
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const userId = req.user.id;
            const user = await User.findById(userId).select("-password");
            res.send(user); 
        } catch (error) {
            console.log(error.message);
            res.status(500).send("Internal Server Error");
        }
        //   .then(user => res.json(user)).catch(err=>{console.log(err); res.json({error: "Please enter a unique value for email", message: err.message})});
    }
);


module.exports = router;