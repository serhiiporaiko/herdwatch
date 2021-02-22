export interface UserModel {
    id?: number;
    firstName: string;
    lastName: string;
    email: string;
    dateOfBirth: string; //"1985-10-02"
    emailVerified?: boolean;
    createDate?: string; //"2019-08-24"
    updateMethod?: string;
    syncFailed?: boolean;
}