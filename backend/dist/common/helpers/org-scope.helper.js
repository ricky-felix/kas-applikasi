"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveOrgId = resolveOrgId;
exports.assertOrgAdmin = assertOrgAdmin;
exports.assertOrgOwner = assertOrgOwner;
exports.isSuperAdmin = isSuperAdmin;
exports.getOrgRole = getOrgRole;
const common_1 = require("@nestjs/common");
function resolveOrgId(user, requestedOrgId) {
    if (user.globalRole === 'super_admin') {
        if (!requestedOrgId) {
            throw new common_1.ForbiddenException('super_admin must provide organizationId query param');
        }
        return requestedOrgId;
    }
    const membership = requestedOrgId
        ? user.organizations.find((o) => o.organizationId === requestedOrgId)
        : user.organizations[0];
    if (!membership) {
        throw new common_1.ForbiddenException('Not a member of this organization');
    }
    return membership.organizationId;
}
function assertOrgAdmin(user, organizationId) {
    if (user.globalRole === 'super_admin')
        return;
    const membership = user.organizations.find((o) => o.organizationId === organizationId);
    if (!membership) {
        throw new common_1.ForbiddenException('Not a member of this organization');
    }
    if (!['owner', 'admin'].includes(membership.role)) {
        throw new common_1.ForbiddenException('Requires owner or admin role');
    }
}
function assertOrgOwner(user, organizationId) {
    if (user.globalRole === 'super_admin')
        return;
    const membership = user.organizations.find((o) => o.organizationId === organizationId);
    if (!membership || membership.role !== 'owner') {
        throw new common_1.ForbiddenException('Requires owner role');
    }
}
function isSuperAdmin(user) {
    return user.globalRole === 'super_admin';
}
function getOrgRole(user, organizationId) {
    if (user.globalRole === 'super_admin')
        return 'super_admin';
    const membership = user.organizations.find((o) => o.organizationId === organizationId);
    return membership?.role ?? null;
}
//# sourceMappingURL=org-scope.helper.js.map