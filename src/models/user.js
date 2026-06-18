import mongoose from 'mongoose';
import {v4 as uuidv4} from 'uuid';
const { Schema } = mongoose;

const user = new Schema({
    id : {type : String, required : true, unique : true, default : uuidv4()},
    email: {type : String, required : true, unique : true},
    phone: {type : String, required : true},
    name: {type : String, required : true},
    password : {type : String, required : true},
    location: {type : String},
    surveyAdmin : {type : Boolean, default : false},
    active : {type : Boolean, default : true}
}, {timestamps: true});


const UserModel = mongoose.model('User', user);

export default UserModel;