// Legacy redirect removed - pages now perform redirects to keep routing consistent.
// This file intentionally does not export route handlers to avoid conflicts with the existing page at /admin/blog/add/page.
export const legacyAdminBlogAddRedirectDisabled = true;
// Add a placeholder 'GET' export (undefined) so the validator finds a shared property name with RouteHandlerConfig
// We intentionally keep it undefined to avoid providing a real handler here.
export const GET = undefined as any;
