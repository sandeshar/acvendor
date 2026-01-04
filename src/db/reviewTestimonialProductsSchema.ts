import mongoose, { Schema, model, models } from 'mongoose';

// Review Testimonial Products (Many-to-Many relationship)
const reviewTestimonialProductsSchema = new Schema({
    testimonialId: { type: Schema.Types.ObjectId, ref: 'ReviewTestimonials', required: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
}, {
    timestamps: false,
    collection: 'review_testimonial_products'
});

// Create compound index for the many-to-many relationship
reviewTestimonialProductsSchema.index({ testimonialId: 1, productId: 1 }, { unique: true });

export const ReviewTestimonialProducts = models.ReviewTestimonialProducts || model('ReviewTestimonialProducts', reviewTestimonialProductsSchema);

// Backward compatibility exports (camelCase for existing API code)
export const reviewTestimonialProducts = ReviewTestimonialProducts;
