import mongoose, { Schema, model, models } from 'mongoose';

// Navbar Items
const navbarItemsSchema = new Schema({
    label: { type: String, required: true, maxlength: 100 },
    href: { type: String, required: true, maxlength: 255 },
    order: { type: Number, default: 0, required: true },
    // Use ObjectId for parent references to support current seeding and DB ids
    parent_id: { type: Schema.Types.ObjectId, ref: 'NavbarItems', default: null },
    is_button: { type: Number, default: 0, required: true }, // 0 = link, 1 = button
    is_dropdown: { type: Number, default: 0, required: true }, // 0 = normal, 1 = dropdown that contains children
    is_active: { type: Number, default: 1, required: true }, // 0 = hidden, 1 = visible
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'navbar_items'
});

export const NavbarItems = models.NavbarItems || model('NavbarItems', navbarItemsSchema);

// Backward compatibility exports (camelCase for existing API code)
export const navbarItems = NavbarItems;
