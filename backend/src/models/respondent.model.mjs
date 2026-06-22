import mongoose from 'mongoose';
const { Schema } = mongoose;

const respondentSchema = new Schema({
    email: { type: String },
    demographics: {
        age: { type: Number },
        gender: { type: String },
        country: { type: String },
        // Add more fields as needed
    },
    fraudScore: { type: Number, default: 0 },
    history: {
        started: { type: Number, default: 0 },
        completed: { type: Number, default: 0 },
        screenedOut: { type: Number, default: 0 }
    }
}, { timestamps: true });

const RespondentModel = mongoose.model('Respondent', respondentSchema);
export default RespondentModel;
