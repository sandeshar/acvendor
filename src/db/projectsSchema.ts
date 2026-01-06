import mongoose, { Schema, model, models } from 'mongoose';

// Projects Section
const projectsSectionSchema = new Schema({
    title: { type: String, required: true, default: 'Our Engineering Excellence', maxlength: 255 },
    description: { type: String, required: true },
    background_image: { type: String, required: true },
    badge_text: { type: String, default: 'Portfolio', maxlength: 100 },
    // CTA Section
    cta_title: { type: String, default: 'Ready to upgrade your climate control?', maxlength: 255 },
    cta_description: { type: String, default: '' },
    cta_button_text: { type: String, default: 'Contact Our Engineers', maxlength: 100 },
    cta_button_link: { type: String, default: '/contact', maxlength: 255 },
    secondary_cta_text: { type: String, default: 'Download Portfolio', maxlength: 100 },
    secondary_cta_link: { type: String, default: '#', maxlength: 255 },
    // Review / Testimonial
    review_text: { type: String, default: 'The team at Midea AC Solutions delivered exactly what they promised for our hotel renovation. The VRF system is incredibly efficient, and the installation was seamless despite the challenging timeline.', maxlength: 2000 },
    review_author_name: { type: String, default: 'Ram Bahadur Shrestha', maxlength: 255 },
    review_author_title: { type: String, default: 'Operations Manager, Everest Hotel', maxlength: 255 },
    review_author_image: { type: String, default: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDjRnoyWKSCZH8orZ-NT8KIJbxtTO2F0jFKpUyy_yRVD55046YP3KiqqHa47kqMU2LVaZpIMs0U63dzt3REfHl7niuXjBNI92oaRPj9ezDT4C-OR_VFgJKBSUFTVBm0KQpuaKg-mh0OoYs-Z9Ud7VAQq5ZCPb3WuBirbeoL6LqC5V_LYIvMzeFcqAE36SyBmmlYn397XcyoQXRo70FgebmXvdl4ZOsoTkH6bkrffDdetqSbfhd-zefq8Wei_DjBx8DS-il7lBSrTsY' },
    is_active: { type: Number, default: 1, required: true },
}, {
    timestamps: { createdAt: false, updatedAt: 'updatedAt' },
    collection: 'projects_section'
});

export const ProjectsSection = models.ProjectsSection || model('ProjectsSection', projectsSectionSchema);

// Projects
const projectsSchema = new Schema({
    title: { type: String, required: true, maxlength: 255 },
    category: { type: String, required: true, maxlength: 100 },
    location: { type: String, required: true, maxlength: 255 },
    capacity: { type: String, required: true, maxlength: 255 },
    system: { type: String, required: true, maxlength: 255 },
    image: { type: String, required: true },
    image_alt: { type: String, maxlength: 255, default: '' },
    display_order: { type: Number, default: 0 },
    is_active: { type: Boolean, default: true },
}, {
    timestamps: true,
    collection: 'projects'
});

export const Projects = models.Projects || model('Projects', projectsSchema);

// Backward compatibility exports (camelCase for existing API code)
export const projectsSection = ProjectsSection;
export const projects = Projects;
