# Certificate Template System Guide

## Overview

The certificate template system has been enhanced to support PDF template uploads with automatic placeholder detection and customization options. This allows admins to upload PDF templates and customize text placement, fonts, colors, and other styling options.

## New Features

### 1. PDF Template Upload
- **File Types Supported**: PDF, PNG, JPG, JPEG, GIF
- **Automatic Placeholder Detection**: The system automatically detects `{placeholder}` patterns in PDF files
- **Backward Compatibility**: Still supports image uploads for header images

### 2. Placeholder System
- **Automatic Detection**: Placeholders in curly braces `{placeholder_name}` are automatically detected
- **Customizable Properties**: Each placeholder can be customized with:
  - Position (x, y coordinates)
  - Font size
  - Font family
  - Color (hex format)
  - Text content

### 3. Available Placeholders

| Placeholder | Description | Example |
|-------------|-------------|---------|
| `{student_name}` | Student's full name | "John Doe" |
| `{track_name}` | Internship track name | "Full Stack Development" |
| `{completion_date}` | Course completion date | "15 December 2024" |
| `{current_date}` | Current date when generated | "27 June 2025" |
| `{manager_name}` | Manager's name | "Sarah Johnson" |
| `{company_name}` | Company name | "VEDARC TECHNOLOGIES" |
| `{user_id}` | Student's user ID | "VEDARC-12345" |
| `{fullName}` | Student's full name (alternative) | "John Doe" |
| `{track}` | Internship track (alternative) | "Full Stack Development" |

## API Endpoints

### 1. Upload Template File
```javascript
// Upload PDF or image template
const formData = new FormData()
formData.append('file', file) // or 'image' for backward compatibility

const response = await adminAPI.uploadTemplateFile(formData)
// Returns: { success: true, file_path: "/templates/filename.pdf", detected_placeholders: {...} }
```

### 2. Get Available Placeholders
```javascript
// Get list of available placeholder options
const response = await adminAPI.getCertificatePlaceholders()
// Returns: { placeholders: {...}, usage_instructions: "..." }
```

### 3. Save Certificate Template
```javascript
// Save template with customizations
const template = {
  template_file: "/templates/filename.pdf",
  placeholders: {
    "placeholder_1": {
      text: "This certificate is awarded to {student_name}",
      x: 50,
      y: 100,
      font_size: 16,
      font_name: "Helvetica",
      color: "#000000"
    }
  },
  orientation: "portrait" // or "landscape"
}

await adminAPI.setCertificateTemplate('completion', template)
```

### 4. Get Certificate Template
```javascript
// Retrieve existing template
const template = await adminAPI.getCertificateTemplate('completion')
```

## Frontend Implementation Guide

### 1. File Upload Component

```jsx
const handleFileUpload = async (file) => {
  try {
    setProcessing(true)
    const formData = new FormData()
    formData.append('file', file)

    const response = await adminAPI.uploadTemplateFile(formData)
    
    // Update template editor with uploaded file and detected placeholders
    setTemplateEditor(prev => ({
      ...prev,
      template_file: response.file_path,
      placeholders: response.detected_placeholders || {}
    }))

    setMessage('Template uploaded successfully!')
  } catch (error) {
    setMessage(`Error uploading template: ${error.message}`)
  } finally {
    setProcessing(false)
  }
}
```

### 2. Placeholder Customization Interface

```jsx
const PlaceholderEditor = ({ placeholderId, placeholder, onUpdate }) => {
  return (
    <div className="placeholder-editor">
      <h4>Placeholder: {placeholder.placeholder}</h4>
      
      <div className="form-group">
        <label>Text Content:</label>
        <textarea
          value={placeholder.text}
          onChange={(e) => onUpdate(placeholderId, 'text', e.target.value)}
          placeholder="Enter text with placeholders like {student_name}"
        />
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label>X Position (mm):</label>
          <input
            type="number"
            value={placeholder.x}
            onChange={(e) => onUpdate(placeholderId, 'x', parseFloat(e.target.value))}
          />
        </div>
        <div className="form-group">
          <label>Y Position (mm):</label>
          <input
            type="number"
            value={placeholder.y}
            onChange={(e) => onUpdate(placeholderId, 'y', parseFloat(e.target.value))}
          />
        </div>
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label>Font Size:</label>
          <input
            type="number"
            value={placeholder.font_size}
            onChange={(e) => onUpdate(placeholderId, 'font_size', parseInt(e.target.value))}
          />
        </div>
        <div className="form-group">
          <label>Font Family:</label>
          <select
            value={placeholder.font_name}
            onChange={(e) => onUpdate(placeholderId, 'font_name', e.target.value)}
          >
            <option value="Helvetica">Helvetica</option>
            <option value="Times-Roman">Times Roman</option>
            <option value="Courier">Courier</option>
          </select>
        </div>
      </div>
      
      <div className="form-group">
        <label>Color:</label>
        <input
          type="color"
          value={placeholder.color}
          onChange={(e) => onUpdate(placeholderId, 'color', e.target.value)}
        />
      </div>
    </div>
  )
}
```

### 3. Placeholder Helper Component

```jsx
const PlaceholderHelper = () => {
  const [placeholders, setPlaceholders] = useState({})
  
  useEffect(() => {
    const fetchPlaceholders = async () => {
      try {
        const response = await adminAPI.getCertificatePlaceholders()
        setPlaceholders(response.placeholders)
      } catch (error) {
        console.error('Error fetching placeholders:', error)
      }
    }
    
    fetchPlaceholders()
  }, [])
  
  return (
    <div className="placeholder-helper">
      <h4>Available Placeholders</h4>
      <div className="placeholder-list">
        {Object.entries(placeholders).map(([key, placeholder]) => (
          <div key={key} className="placeholder-item">
            <code>{placeholder.placeholder}</code>
            <span>{placeholder.description}</span>
            <small>Example: {placeholder.example}</small>
          </div>
        ))}
      </div>
    </div>
  )
}
```

### 4. Template Preview Component

```jsx
const TemplatePreview = ({ template, previewData }) => {
  const [previewUrl, setPreviewUrl] = useState(null)
  
  const generatePreview = async () => {
    try {
      const response = await adminAPI.generateCertificate({
        user_id: 'preview',
        certificate_type: 'completion',
        template: template,
        ...previewData
      })
      
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      setPreviewUrl(url)
    } catch (error) {
      console.error('Error generating preview:', error)
    }
  }
  
  return (
    <div className="template-preview">
      <button onClick={generatePreview}>Generate Preview</button>
      {previewUrl && (
        <iframe
          src={previewUrl}
          width="100%"
          height="500px"
          title="Certificate Preview"
        />
      )}
    </div>
  )
}
```

## Template Structure

### Template Object Structure
```javascript
{
  template_file: "/templates/certificate_template.pdf", // PDF template file
  orientation: "portrait", // or "landscape"
  placeholders: {
    "placeholder_1": {
      placeholder: "student_name", // Original placeholder name
      text: "This certificate is awarded to {student_name}", // Text with placeholders
      x: 50, // X position in mm
      y: 100, // Y position in mm
      font_size: 16, // Font size
      font_name: "Helvetica", // Font family
      color: "#000000" // Color in hex format
    },
    "placeholder_2": {
      placeholder: "track_name",
      text: "for completing the {track_name} internship program",
      x: 50,
      y: 120,
      font_size: 14,
      font_name: "Times-Roman",
      color: "#333333"
    }
  }
}
```

## Best Practices

### 1. Template Design
- Use clear, readable fonts
- Ensure sufficient contrast between text and background
- Test with different placeholder lengths
- Use consistent spacing and alignment

### 2. Placeholder Usage
- Always use curly braces: `{placeholder_name}`
- Test with various student names and track names
- Consider text length variations
- Use appropriate font sizes for different content types

### 3. File Upload
- Validate file types on frontend before upload
- Show upload progress for large files
- Handle upload errors gracefully
- Provide clear feedback to users

### 4. Preview and Testing
- Always test templates with sample data
- Verify placeholder positioning
- Check font rendering across different devices
- Test with various certificate types (completion, LOR, offer)

## Error Handling

### Common Issues and Solutions

1. **File Upload Errors**
   - Check file type validation
   - Ensure file size limits
   - Verify server permissions

2. **Placeholder Detection Issues**
   - Ensure placeholders use correct syntax: `{placeholder_name}`
   - Check PDF text extraction compatibility
   - Verify placeholder names match available options

3. **Template Generation Errors**
   - Validate template structure
   - Check placeholder positioning
   - Ensure all required fields are present

## Migration from Old System

If migrating from the old image-based system:

1. **Backward Compatibility**: The system still supports header images
2. **Template Conversion**: Convert existing templates to use the new structure
3. **Placeholder Migration**: Update existing placeholders to use the new format
4. **Testing**: Thoroughly test all certificate types after migration

## Security Considerations

1. **File Upload Security**
   - Validate file types server-side
   - Scan uploaded files for malware
   - Implement file size limits
   - Use secure file storage

2. **Template Security**
   - Validate template structure
   - Sanitize placeholder content
   - Prevent template injection attacks
   - Implement access controls

## Performance Optimization

1. **File Handling**
   - Compress large PDF files
   - Cache template data
   - Optimize image processing
   - Use CDN for file delivery

2. **Generation Optimization**
   - Cache generated certificates
   - Implement background processing for bulk generation
   - Optimize PDF generation algorithms
   - Use efficient placeholder replacement

This guide provides a comprehensive overview of the new certificate template system. For specific implementation details, refer to the API documentation and code examples provided. 