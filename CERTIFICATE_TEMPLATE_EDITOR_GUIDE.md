# Advanced Certificate Template Editor Guide

## Overview

The Advanced Certificate Template Editor is a comprehensive tool that allows administrators to create, customize, and manage professional certificate templates with drag-and-drop functionality, live preview, and advanced styling options. This feature supports three types of certificates:

1. **Certificate of Completion** - For students who complete their internship
2. **Letter of Recommendation (LOR)** - Professional recommendation letters
3. **Offer Letter** - Employment offer letters

## Key Features

### 🎨 Visual Design Tools
- **Background Image Upload** - Upload custom background images (PNG, JPG, JPEG, GIF)
- **Background Color Picker** - Choose custom background colors with color picker
- **Border Customization** - Set custom border colors and styles
- **Orientation Selection** - Choose between portrait and landscape layouts

### 📝 Text Element Management
- **Drag & Drop Interface** - Click and drag text elements to position them anywhere on the canvas
- **Live Text Editing** - Edit text content in real-time with live preview
- **Font Customization** - Choose from 15+ professional fonts
- **Font Size Control** - Adjust font sizes from 8px to 72px
- **Color Picker** - Select custom colors for each text element
- **Precise Positioning** - Use numeric inputs for exact positioning

### 🔧 Advanced Features
- **Placeholder System** - Use dynamic placeholders that auto-replace with student data
- **Live Preview** - See changes instantly as you make them
- **Sample Data Testing** - Test templates with sample student data
- **PDF Export** - Generate and download PDF previews
- **Template Management** - Save, edit, and manage multiple templates

## Available Placeholders

The system supports the following dynamic placeholders that automatically replace with actual student data:

| Placeholder | Description | Example Output |
|-------------|-------------|----------------|
| `{student_name}` | Student's full name | "John Doe" |
| `{track_name}` | Internship track name | "Full Stack Development" |
| `{completion_date}` | Course completion date | "15 December 2024" |
| `{current_date}` | Current date when generated | "27 June 2025" |
| `{manager_name}` | Manager's name | "Sarah Johnson" |
| `{company_name}` | Company name | "VEDARC TECHNOLOGIES" |
| `{user_id}` | Student's user ID | "VEDARC-12345" |

## How to Use the Template Editor

### 1. Accessing the Editor

1. Log in to the Admin Dashboard
2. Navigate to the "Certificates" tab
3. Click "Create Template" or "Edit Template" for your desired certificate type

### 2. Setting Up Your Template

#### Step 1: Background Setup
- **Upload Background Image**: Click "Upload Background" to add a custom background image
- **Set Background Color**: Click the color preview to open the color picker
- **Choose Orientation**: Select portrait or landscape layout

#### Step 2: Adding Text Elements
- Click "Add Text" to create a new text element
- The element will appear on the canvas and in the left panel
- Click on any element to select it and edit its properties

#### Step 3: Customizing Text Elements
When a text element is selected, you can customize:

- **Text Content**: Type your text and use placeholders like `{student_name}`
- **Font Family**: Choose from professional fonts (Arial, Times New Roman, etc.)
- **Font Size**: Set size from 8px to 72px
- **Color**: Use the color picker to select custom colors
- **Position**: Drag the element or use X/Y coordinates for precise positioning

#### Step 4: Using Placeholders
- Click on any placeholder in the right panel to insert it into the selected text element
- Placeholders will show as `{placeholder_name}` in the text
- They will be replaced with actual data when certificates are generated

### 3. Preview and Testing

#### Live Preview
- All changes are reflected immediately on the canvas
- Text elements show placeholder replacements in real-time
- Background changes are applied instantly

#### Sample Data Testing
- Use the "Preview Data" section to test with sample information
- Enter test names, dates, and other data
- See how your template looks with realistic content

#### PDF Preview
- Click "Preview" to generate a downloadable PDF
- Test the final output before saving

### 4. Saving Your Template

- Click "Save Template" to store your design
- The template will be available for generating certificates
- You can edit it anytime by clicking "Edit Template"

## Template Examples

### Certificate of Completion Template
```
Text Element 1: "Certificate of Completion"
Position: Center top
Font: Times New Roman, 24px, Bold
Color: #2c3e50

Text Element 2: "This is to certify that {student_name} has successfully completed the {track_name} internship program."
Position: Center middle
Font: Arial, 16px
Color: #34495e

Text Element 3: "Completed on {completion_date}"
Position: Center bottom
Font: Arial, 14px
Color: #7f8c8d
```

### Letter of Recommendation Template
```
Text Element 1: "Letter of Recommendation"
Position: Top left
Font: Georgia, 20px, Bold
Color: #2c3e50

Text Element 2: "To Whom It May Concern,"
Position: Left margin
Font: Times New Roman, 14px
Color: #34495e

Text Element 3: "I am pleased to recommend {student_name} for their outstanding performance during the {track_name} internship program."
Position: Body text area
Font: Times New Roman, 12px
Color: #2c3e50
```

## Best Practices

### Design Tips
1. **Use High-Quality Backgrounds**: Upload high-resolution images for professional results
2. **Choose Readable Fonts**: Stick to professional fonts like Arial, Times New Roman, or Georgia
3. **Maintain Contrast**: Ensure text is readable against the background
4. **Test with Long Names**: Some students may have longer names, test your layout accordingly
5. **Use Consistent Spacing**: Maintain proper spacing between elements

### Technical Tips
1. **Save Frequently**: Save your work regularly to avoid losing changes
2. **Test Placeholders**: Always test with sample data to ensure placeholders work correctly
3. **Check PDF Output**: Generate PDF previews to verify the final result
4. **Backup Templates**: Keep backups of important templates

## Troubleshooting

### Common Issues

**Text Not Visible**
- Check if text color contrasts with background
- Ensure font size is large enough
- Verify text is positioned within canvas bounds

**Background Image Not Loading**
- Ensure image format is supported (PNG, JPG, JPEG, GIF)
- Check file size (recommend under 5MB)
- Try uploading a different image

**Placeholders Not Replacing**
- Verify placeholder syntax: `{placeholder_name}`
- Check that placeholder names match exactly
- Test with sample data in preview mode

**PDF Generation Fails**
- Ensure at least one text element is added
- Check that all required fields are filled
- Try refreshing the page and retry

### Performance Tips
- Use optimized images for faster loading
- Limit the number of text elements for better performance
- Close other browser tabs to free up memory

## API Integration

The template editor integrates with the backend API for:

- **Template Storage**: Templates are saved to the database
- **Certificate Generation**: Templates are used to generate actual certificates
- **PDF Creation**: Server-side PDF generation with template data
- **Image Processing**: Background image handling and optimization

## Security Features

- **Admin-Only Access**: Only authenticated admins can access the editor
- **Input Validation**: All user inputs are validated and sanitized
- **File Upload Security**: Image uploads are scanned and validated
- **Template Isolation**: Each template type is stored separately

## Future Enhancements

Planned features for future releases:

- **Template Library**: Pre-built template designs
- **Advanced Typography**: More font options and text effects
- **Image Elements**: Add logos, signatures, and other images
- **Template Sharing**: Share templates between admin accounts
- **Version Control**: Track template changes and revisions
- **Bulk Operations**: Apply templates to multiple certificates at once

## Support

For technical support or questions about the Certificate Template Editor:

1. Check this guide for common solutions
2. Review the troubleshooting section
3. Contact the development team for advanced issues
4. Report bugs through the admin dashboard

---

*This guide covers the complete functionality of the Advanced Certificate Template Editor. For additional information, refer to the main application documentation.* 