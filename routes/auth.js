const router = require("express").Router();
const { body, validationResult } = require('express-validator');
const User = require("../db/User");

router.get('/', (req, res) => {
    res.send("Hello Authjs")
})

router.post("/register",

    // バリデーションチェック
    body("email").isEmail(),
    body("password").isLength({ min: 6 }),
    (req, res) => {
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
    }
)

module.exports = router;