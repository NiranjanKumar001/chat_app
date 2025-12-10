import express from "express"
const router=express.Router()
import * as controllers from '../controllers/user.controllers.js'
import { getCurrentUser } from '../controllers/currentUser.controller.js'
import isauthenticated from '../middleware/isAuthenticated.middleware.js'

router.get('/trial',(req,res)=>{
    res.send("this one is user routes testing...")
})
//user registeration...routes....
router.post('/register',controllers.register)

//user login route.....
router.post('/login',controllers.login)

//user routes for logout....
router.post('/logout',isauthenticated,controllers.logout)

//dummy func testing for authentication purpose....
router.get('/demo',isauthenticated,controllers.demo)

//getting all user except the authenticated user...
router.get('/getall',isauthenticated,controllers.getalluserexceptAuth)

//get current user
router.get('/current', isauthenticated, getCurrentUser)

export default router