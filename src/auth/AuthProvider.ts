export default interface AuthProvider {
    addAuthHeaders(headers: any): Promise<any>;
}