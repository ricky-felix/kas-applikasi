import { AuthenticatedUser } from '../../auth/interfaces/authenticated-user.interface';
export declare function resolveOrgId(user: AuthenticatedUser, requestedOrgId?: string): string;
export declare function assertOrgAdmin(user: AuthenticatedUser, organizationId: string): void;
export declare function assertOrgOwner(user: AuthenticatedUser, organizationId: string): void;
export declare function isSuperAdmin(user: AuthenticatedUser): boolean;
export declare function getOrgRole(user: AuthenticatedUser, organizationId: string): string | null;
