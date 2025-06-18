'use server'

export async function generatePDFReport(pdfData: any) {
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!apiUrl) {
            throw new Error('NEXT_PUBLIC_API_URL is not defined');
        }

        console.log('Using API URL:', apiUrl);

        const response = await fetch(`${apiUrl}/generate-pdf-report`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/pdf'
            } as HeadersInit,
            body: JSON.stringify(pdfData)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.error || `HTTP error! status: ${response.status}`);
        }

        return await response.blob();
    } catch (error) {
        console.error('Error generating PDF:', error);
        throw error;
    }
} 