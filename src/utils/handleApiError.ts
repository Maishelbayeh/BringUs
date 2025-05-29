export  const handleApiError = (error: any) => {
    if (error.response) {
        console.error('API Error:', error.response.data);
    } else if (error.request) {
        console.error('No response:', error.request);
    } else {
        console.error('Error:', error.message);
    }
};
