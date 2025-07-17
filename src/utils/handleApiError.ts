export const handleApiError = (error: any): string => {
    if (error.response) {
        //CONSOLE.error('API Error:', error.response.data);
        return error.response.data?.message || error.response.data?.error || 'API Error occurred';
    } else if (error.request) {
        //CONSOLE.error('No response:', error.request);
        return 'No response from server';
    } else {
        //CONSOLE.error('Error:', error.message);
        return error.message || 'An error occurred';
    }
};
