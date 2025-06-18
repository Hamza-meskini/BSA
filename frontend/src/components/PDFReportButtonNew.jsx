import React, { useState } from 'react';
import axios from 'axios';
import { Button, CircularProgress } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';

const PDFReportButtonNew = ({ brandName, daysAgo }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleGeneratePDF = async () => {
        setLoading(true);
        setError(null);
        
        try {
            console.log('Attempting to generate PDF for:', brandName, daysAgo);
            const apiUrl = process.env.NEXT_PUBLIC_API_URL;
            if (!apiUrl) {
                throw new Error('NEXT_PUBLIC_API_URL is not defined');
            }

            const endpoint = `${apiUrl}/generate-pdf-report`;
            console.log('Using endpoint:', endpoint);

            const response = await axios.post(
                endpoint,
                {
                    brand_name: brandName,
                    days_ago: daysAgo
                },
                {
                    responseType: 'blob',
                    headers: {
                        'Accept': 'application/pdf'
                    }
                }
            );

            console.log('PDF generation response received');
            
            // Create a blob from the PDF data
            const blob = new Blob([response.data], { type: 'application/pdf' });
            
            // Create a URL for the blob
            const url = window.URL.createObjectURL(blob);
            
            // Create a temporary link element
            const link = document.createElement('a');
            link.href = url;
            link.download = `analysis_report_${brandName}_${new Date().toISOString().slice(0,19).replace(/[:]/g, '')}.pdf`;
            
            // Append to body, click, and remove
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Clean up the URL
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Detailed error:', err);
            setError('Error generating PDF report. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <Button
                variant="contained"
                color="primary"
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <DownloadIcon />}
                onClick={handleGeneratePDF}
                disabled={loading || !brandName || !daysAgo}
                sx={{ mt: 2 }}
            >
                {loading ? 'Generating Report...' : 'Generate Full Report (PDF)'}
            </Button>
            {error && (
                <div style={{ color: 'red', marginTop: '10px' }}>
                    {error}
                </div>
            )}
        </div>
    );
};

export default PDFReportButtonNew; 