import mongoose, { Schema, model, models } from 'mongoose';

// Review Testimonial Services (Many-to-Many relationship)
const reviewTestimonialServicesSchema = new Schema({
    testimonialId: { type: Schema.Types.ObjectId, ref: 'ReviewTestimonials', required: true },
    serviceId: { type: Schema.Types.ObjectId, ref: 'ServicePosts', required: true },
}, {
    timestamps: false,
    collection: 'review_testimonial_services'
});

// Create compound index for the many-to-many relationship
reviewTestimonialServicesSchema.index({ testimonialId: 1, serviceId: 1 }, { unique: true });

export const ReviewTestimonialServices = models.ReviewTestimonialServices || model('ReviewTestimonialServices', reviewTestimonialServicesSchema);

// Backward compatibility exports (camelCase for existing API code)
export const reviewTestimonialServices = ReviewTestimonialServices;
