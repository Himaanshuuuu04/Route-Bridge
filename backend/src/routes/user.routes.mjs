import express from 'express';
import { signIn, signUp, verifyOtp } from '../controllers/user.controller.mjs';

const userRouter = express.Router();

userRouter.post('/signIn', signIn);
userRouter.post('/verifyOtp', verifyOtp);
userRouter.post('/signUp', signUp);

export default userRouter;