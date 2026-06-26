import express from 'express';
import { signIn, verifyOtp, logout, getMe, getUsers, toggleAdminStatus, addUser, deleteUser } from '../controllers/user.controller.mjs';
import authMiddleware from '../middleware/auth.middleware.mjs';
import adminMiddleware from '../middleware/admin.middleware.mjs';

const userRouter = express.Router();

userRouter.post('/signIn', signIn);
userRouter.post('/verifyOtp', verifyOtp);
userRouter.post('/logout', logout);
userRouter.get('/me', authMiddleware, getMe);

// Admin routes for managing users
userRouter.get('/admin/users', authMiddleware, adminMiddleware, getUsers);
userRouter.put('/admin/users/:id/toggle-admin', authMiddleware, adminMiddleware, toggleAdminStatus);
userRouter.post('/admin/users', authMiddleware, adminMiddleware, addUser);
userRouter.delete('/admin/users/:id', authMiddleware, adminMiddleware, deleteUser);

export default userRouter;