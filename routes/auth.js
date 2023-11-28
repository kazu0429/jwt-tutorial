const router = require("express").Router();
const { body, validationResult } = require('express-validator');
const User = require("../db/User");
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");

require('dotenv').config();

router.get('/', (req, res) => {
    res.send("Hello Authjs")
})

router.post("/register",

    // バリデーションチェック
    body("email").isEmail(),
    body("password").isLength({ min: 6 }),
    async (req, res) => {
        const email = req.body.email;
        const password = req.body.password;

        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({errors:errors.array()})
        }
        
        // DBにユーザーが存在しているか
        const user = User.find((user) => user.email === email);
        if(user){
            return res.status(400).json([
                {
                    message:"すでにそのユーザーは存在しています。"
                }
            ])
        }

        // パスワードのハッシュ化
        let hashedPassword = await bcrypt.hash(password, 10);
        // console.log(hashedPassword)

        // db保存
        User.push({
            email,
            password:hashedPassword
        })
        
        // JWT発行
        const token = jwt.sign(
            {
                email,
            },
            process.env.SECRET_KEY,
            {
                expiresIn:"24h",
            }
        )

        return res.json({
            token:token,
        });
    }
)

// ログイン用API
router.post("/login", async(req, res) => {
    const { email, password } = req.body;

    const user = User.find((user) => user.email === email);
    if(!user){
        return res.status(400).json([
            {
                message:"そのユーザーは存在していません"
            }
        ])
    }

    // パスワードの復号と照合
    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch) {
        return res.status(400).json([
            {
                message:"パスワードが異なります。"
            }
        ])
    }
    
    // JWT発行
    const token = await jwt.sign(
        {
            email,
        },
        process.env.SECRET_KEY,
        {
            expiresIn:"24h",
        }
    )

    return res.json({
        token:token,
    });
})

// DB確認api
router.get("/allUsers", (req, res) => {
    return res.json(User);
})

module.exports = router;