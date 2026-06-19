import mongoose from 'mongoose';
import {v4 as uuidv4} from 'uuid';
const { Schema } = mongoose;

const user = new Schema({
    id : {type : String, required : true, unique : true, default : uuidv4()},
    email: {type : String, required : true, unique : true},
    name: {type : String, required : true},
    otp: {type : String, required : true},
    otpExpiry: {type : Date, required : true},
    surveyAdmin : {type : Boolean, default : false},
}, {timestamps: true});


const UserModel = mongoose.model('User', user);

export default UserModel;