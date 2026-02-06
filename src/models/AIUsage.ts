import mongoose from 'mongoose';

const AIUsageSchema = new mongoose.Schema({
    timestamp: {
        type: Date,
        default: Date.now,
    },
    model: {
        type: String,
        required: true,
    },
    promptTokenCount: {
        type: Number,
        required: true,
    },
    candidatesTokenCount: {
        type: Number,
        required: true,
    },
    thoughtsTokenCount: {
        type: Number,
        default: 0,
    },
    totalTokenCount: {
        type: Number,
        required: true,
    },
    inputCost: {
        type: Number,
        required: true,
    },
    outputCost: {
        type: Number,
        required: true,
    },
    totalCost: {
        type: Number,
        required: true,
    },
    clientEmail: {
        type: String, // Optional: to link usage to a specific user/lead
    },
});

export default mongoose.models.AIUsage || mongoose.model('AIUsage', AIUsageSchema);
