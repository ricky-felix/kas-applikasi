import { ChangeOrderStatus } from '@prisma/client';
export declare class CreateChangeOrderDto {
    projectId: string;
    title: string;
    description?: string;
    amount: number;
    status?: ChangeOrderStatus;
}
