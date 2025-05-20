from weasyprint import HTML, CSS
from jinja2 import Environment, FileSystemLoader
import os
from datetime import datetime
import json
from pathlib import Path
import logging
import base64
from io import BytesIO
from PIL import Image
import tempfile
import shutil

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class PDFGenerator:
    def __init__(self):
        try:
            self.template_dir = Path(__file__).parent / 'templates'
            # Create a temporary directory for PDF generation
            self.temp_dir = Path(tempfile.mkdtemp())
            logger.info(f"Template directory: {self.template_dir}")
            logger.info(f"Temporary directory: {self.temp_dir}")
            
            # Create template directory if it doesn't exist
            self.template_dir.mkdir(exist_ok=True)
            
            # Initialize Jinja2 environment
            self.env = Environment(loader=FileSystemLoader(str(self.template_dir)))
            logger.info("PDFGenerator initialized successfully")
        except Exception as e:
            logger.error(f"Error initializing PDFGenerator: {str(e)}", exc_info=True)
            raise

    def __del__(self):
        """Clean up temporary directory when the object is destroyed"""
        try:
            if hasattr(self, 'temp_dir') and self.temp_dir.exists():
                shutil.rmtree(self.temp_dir)
                logger.info(f"Cleaned up temporary directory: {self.temp_dir}")
        except Exception as e:
            logger.error(f"Error cleaning up temporary directory: {str(e)}")

    def generate_pdf(self, analysis_data, sentiment_data, emotion_data, topic_data, charts=None, ai_analysis=None, platform_stats=None):
        """
        Generate a PDF report using the provided data
        """
        logger.info("Starting PDF generation")
        logger.info(f"Template directory exists: {self.template_dir.exists()}")
        logger.info(f"Template directory contents: {list(self.template_dir.glob('*.html'))}")
        
        # Get the template path
        template_path = self.template_dir / 'report_template.html'
        logger.info(f"Template path: {template_path}")
        logger.info(f"Template exists: {template_path.exists()}")
        
        # Load the template
        template = self.env.get_template('report_template.html')
        logger.info("Template loaded successfully")
        
        # Process charts if provided
        processed_charts = []
        if charts:
            logger.info(f"Processing {len(charts)} charts")
            for chart in charts:
                try:
                    logger.info(f"Processing chart: {chart['title']}")
                    # Remove the data URL prefix if present
                    image_data = chart['data']
                    if image_data.startswith('data:image/png;base64,'):
                        image_data = image_data.replace('data:image/png;base64,', '')
                    
                    # Decode base64 data
                    image_bytes = base64.b64decode(image_data)
                    
                    # Create a BytesIO object
                    image_stream = BytesIO(image_bytes)
                    
                    # Open the image using PIL
                    image = Image.open(image_stream)
                    
                    # Save to a temporary file with a unique name
                    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
                    chart_filename = f"temp_chart_{timestamp}_{len(processed_charts)}.png"
                    chart_path = self.temp_dir / chart_filename
                    
                    # Save the image
                    image.save(chart_path)
                    logger.info(f"Saved chart to: {chart_path}")
                    
                    # Use a relative path for the template
                    relative_path = chart_path.relative_to(self.temp_dir)
                    logger.info(f"Using relative path: {relative_path}")
                    
                    processed_charts.append({
                        'title': chart['title'],
                        'data': str(relative_path)
                    })
                except Exception as e:
                    logger.error(f"Error processing chart: {str(e)}")
                    continue
        
        # Calculate engagement statistics
        total_sentiment = sum(data['count'] for data in sentiment_data.values())
        total_emotion = sum(data['count'] for data in emotion_data.values())
        
        engagement_stats = {
            'total_sentiment': total_sentiment,
            'total_emotion': total_emotion
        }
        
        # Use platform_stats parameter instead of data.get()
        logger.info(f"Received platform stats: {platform_stats}")
        
        # Prepare the context for the template
        context = {
            'analysis_data': analysis_data,
            'sentiment_data': sentiment_data,
            'emotion_data': emotion_data,
            'topic_data': topic_data,
            'charts': processed_charts,
            'ai_analysis': ai_analysis,
            'generation_date': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'engagement_stats': engagement_stats,
            'platform_stats': platform_stats or {}
        }
        
        logger.info("Context prepared successfully")
        logger.info(f"Platform stats in context: {context['platform_stats']}")
        logger.info(f"Number of processed charts: {len(processed_charts)}")
        
        # Render the template
        html_content = template.render(**context)
        logger.info("Template rendered successfully")
        
        # Generate PDF in temporary directory
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        pdf_path = self.temp_dir / f"report_{timestamp}.pdf"
        logger.info(f"Generating PDF at: {pdf_path}")
        
        # Create PDF with base_url set to the temporary directory
        HTML(string=html_content, base_url=str(self.temp_dir)).write_pdf(str(pdf_path))
        logger.info("PDF generated successfully")
        
        # Clean up temporary chart files but keep the PDF
        for chart in processed_charts:
            try:
                chart_path = self.temp_dir / chart['data']
                if chart_path.exists():
                    chart_path.unlink()
                    logger.info(f"Removed temporary chart file: {chart_path}")
            except Exception as e:
                logger.error(f"Error removing temporary chart file {chart_path}: {str(e)}")
        
        # Return both the PDF path and the temporary directory
        return str(pdf_path), self.temp_dir

# Example usage:
if __name__ == "__main__":
    pdf_gen = PDFGenerator() 