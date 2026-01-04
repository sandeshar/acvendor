import mongoose, { Schema, model, models } from 'mongoose';

// Review Testimonials
const reviewTestimonialsSchema = new Schema({
    url: { type: String, required: true, maxlength: 512 },
    name: { type: String, required: true, maxlength: 256 },
    role: { type: String, required: true, maxlength: 256 },
    content: { type: String, required: true, maxlength: 65535 },
    rating: { type: Number, required: true },
    service: { type: Schema.Types.ObjectId, ref: 'ServicePosts' },
    link: { type: String, required: true, default: 'homepage', maxlength: 256 },
    date: { type: Date, default: Date.now, required: true },
}, {
    timestamps: false,
    collection: 'review_testimonials'
});

export const ReviewTestimonials = models.ReviewTestimonials || model('ReviewTestimonials', reviewTestimonialsSchema);

// Backward compatibility exports (camelCase for existing API code)
export const reviewTestimonials = ReviewTestimonials;
