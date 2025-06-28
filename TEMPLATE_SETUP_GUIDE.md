# Certificate Template Setup Guide

## Overview

This system allows you to use your custom Canva letter headers for generating certificates, Letters of Recommendation (LOR), and Offer Letters. The system uses placeholders that are automatically replaced with student data.

## How It Works

1. **Upload Your Canva Header**: Upload your custom-designed letter header from Canva
2. **Set Placeholders**: Define text positions and content that will be filled with student data
3. **Generate Certificates**: When students are eligible, their certificates are generated using your template

## Setup Process

### Step 1: Access Admin Dashboard
1. Login to the admin dashboard
2. Navigate to the "Certificates" tab
3. You'll see three template types: Certificate of Completion, LOR, and Offer Letter

### Step 2: Upload Your Canva Header
1. Select the template type you want to configure
2. Click "Choose File" to upload your Canva letter header
3. Supported formats: PNG, JPG, PDF
4. The image will be automatically scaled to fit the page width

### Step 3: Configure Document Settings
1. **Orientation**: Choose Portrait or Landscape (A4 size)
2. **Placeholders**: Add text elements that will be filled with student data

### Step 4: Add Text Placeholders
Click "Add Placeholder" to add text elements. For each placeholder, you can set:

- **Text**: The content with placeholders (e.g., "This certificate is awarded to {student_name}")
- **Font Size**: Size of the text (8-72)
- **X Position**: Horizontal position in millimeters from left edge
- **Y Position**: Vertical position in millimeters from top edge
- **Color**: Text color (hex format)

### Step 5: Available Placeholders
Use these variables in your text:
- `{student_name}` - Student's full name
- `{track_name}` - Internship track name
- `{completion_date}` - Completion date
- `{current_date}` - Current date
- `{manager_name}` - Manager's name
- `{company_name}` - Company name (VEDARC TECHNOLOGIES)

### Step 6: Save Template
1. Click "Save Template" to store your configuration
2. The system will validate that you have uploaded an image and added placeholders
3. You can preview the template with sample data

## Example Template Setup

### Certificate of Completion
```
Text: "This certificate is awarded to {student_name} for successfully completing the {track_name} internship program on {completion_date}."
Position: X: 50mm, Y: 150mm
Font Size: 16
Color: #000000
```

### Letter of Recommendation
```
Text: "To Whom It May Concern,\n\nI am pleased to recommend {student_name} for their outstanding performance during the {track_name} internship at {company_name}."
Position: X: 30mm, Y: 100mm
Font Size: 12
Color: #333333
```

### Offer Letter
```
Text: "Dear {student_name},\n\nWe are pleased to offer you a position at {company_name} based on your excellent performance during the {track_name} internship."
Position: X: 30mm, Y: 120mm
Font Size: 14
Color: #000000
```

## Tips for Canva Design

1. **Export as PNG**: For best quality, export your Canva design as PNG
2. **High Resolution**: Use at least 300 DPI for crisp printing
3. **Leave Space**: Leave areas in your design for text placeholders
4. **Test Positioning**: Use the preview feature to test text positioning
5. **Consistent Branding**: Use your company colors and fonts

## Student Experience

Once templates are set up:
1. Students complete their internship requirements
2. Managers unlock certificates for eligible students
3. Students can download their certificates with your custom header
4. All student data is automatically filled in the placeholders

## Troubleshooting

### Image Not Loading
- Check file format (PNG, JPG, PDF)
- Ensure file size is reasonable (< 10MB)
- Try re-uploading the image

### Text Positioning Issues
- Use millimeters for positioning (1 inch = 25.4mm)
- Test with preview feature
- Adjust X and Y coordinates as needed

### Color Issues
- Use hex color format (#000000 for black)
- Test colors in preview mode
- Default to black if color conversion fails

## File Structure

```
backend/
├── templates/          # Uploaded template images
├── app.py             # Main application with template logic
└── requirements.txt   # Python dependencies

frontend/
├── src/
│   ├── components/
│   │   └── AdminDashboard/
│   │       └── AdminDashboard.jsx  # Template management UI
│   └── services/
│       └── apiService.js           # API calls for templates
```

## API Endpoints

- `POST /api/admin/certificate-template/upload` - Upload template image
- `POST /api/admin/certificate-template` - Save template configuration
- `GET /api/admin/certificate-template?type=<type>` - Get template
- `GET /api/student/certificates/<type>` - Download student certificate
- `GET /templates/<filename>` - Serve template images

## Security Notes

- Only admins can upload and configure templates
- Template images are stored securely
- Student data is validated before certificate generation
- All downloads require proper authentication

## Support

If you encounter issues:
1. Check the browser console for errors
2. Verify all required fields are filled
3. Test with the preview feature
4. Contact system administrator for technical support 