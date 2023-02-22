export default interface AuthProvider {
    addAuthHeaders(headers: any): Promise<any>;
    isAuthorized(): Promise<boolean>;
    addWsConnectionParams(params: any): any;
}