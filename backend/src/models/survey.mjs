import { Timestamp } from 'mongodb';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
const { Schema } = mongoose;

const surveySchema = new Schema({
    id: { type: String, required: true, unique: true, default: uuidv4() },
    ipAddress: { type: String, required: true },
    status: { type: String, required: true, enum: ['Security Term', 'Quota Full', 'Terminate', "Complete"], default: 'Terminate' },
    pid: { type: String, required: true },
    uid: { type: String, required: true }

}
, { timestamps: true });


const SurveyModel = mongoose.model('Survey', surveySchema);
export default SurveyModel;