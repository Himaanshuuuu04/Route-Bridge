import mongoose from 'mongoose';
const { Schema } = mongoose;

const surveySchema = new Schema({
    ipAddress: { type: String, required: true },
    status: { type: String, required: true, enum: ['Security Term', 'Quota Full', 'Terminate', "Complete"], default: 'Terminate' },
    pid: { type: String, required: true },
    uid: { type: String, required: true }

}
, { timestamps: true });


const SurveyModel = mongoose.model('Survey', surveySchema);
export default SurveyModel;