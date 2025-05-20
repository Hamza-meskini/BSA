'use server'

export async function generatePDFReport(pdfData: any) {
    try {
        if (!process.env.API_KEY) {
            throw new Error('API_KEY is not defined');
        }

        const response = await fetch(`${process.env.API_URL}/generate-pdf-report`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/pdf',
                'X-API-Key': process.env.API_KEY
            } as HeadersInit,
            body: JSON.stringify(pdfData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.blob();
    } catch (error) {
        console.error('Error generating PDF:', error);
        throw error;
    }
} 