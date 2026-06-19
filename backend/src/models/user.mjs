import mongoose from 'mongoose';
const { Schema } = mongoose;

const user = new Schema({
    email: {type : String, required : true, unique : true},
    name: {type : String, required : true},
    otp: {type : String},
    otpExpiry: {type : Date},
    surveyAdmin : {type : Boolean, default : false},
}, {timestamps: true});


const UserModel = mongoose.model('User', user);

export default UserModel;