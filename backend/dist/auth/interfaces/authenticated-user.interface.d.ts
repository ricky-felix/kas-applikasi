export interface OrgMembership {
    organizationId: string;
    role: string;
}
export interface AuthenticatedUser {
    id: string;
    globalRole: string | null;
    organizations: OrgMembership[];
}
