import express from 'express';
import { signIn, signUp, verifyOtp } from '../controllers/user.controller.mjs';

const router = express.Router();

router.post('/signIn', signIn);
router.post('/verifyOtp', verifyOtp);
router.post('/signUp', signUp);
