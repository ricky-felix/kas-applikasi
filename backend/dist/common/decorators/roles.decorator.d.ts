export type OrgRole = 'owner' | 'admin' | 'member';
export type GlobalRole = 'super_admin';
export declare const ROLES_KEY = "roles";
export declare const Roles: (...roles: OrgRole[]) => import("@nestjs/common").CustomDecorator<string>;
export declare const GLOBAL_ROLES_KEY = "globalRoles";
export declare const GlobalRoles: (...roles: GlobalRole[]) => import("@nestjs/common").CustomDecorator<string>;
