export default interface AuthProvider {
    addAuthHeaders(headers: any): Promise<any>;
    isAuthorized(): Promise<boolean>;
}