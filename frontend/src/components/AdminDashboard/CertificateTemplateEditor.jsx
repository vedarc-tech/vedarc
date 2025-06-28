import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUpload, FaEye, FaSave, FaTrash, FaPlus, FaFont, FaPalette, FaArrowsAlt, FaDownload, FaSpinner } from 'react-icons/fa';
import { SketchPicker } from 'react-color';
import './CertificateTemplateEditor.css';

const CertificateTemplateEditor = ({ 
  templateType, 
  onSave, 
  onPreview, 
  initialTemplate = null,
  onClose 
}) => {
  const [template, setTemplate] = useState({
    background_image: '',
    orientation: 'portrait',
    placeholders: {},
    defaultText: '',
    backgroundColor: '#ffffff',
    textColor: '#000000',
    borderColor: '#cccccc',
    fontFamily: 'Arial',
    fontSize: '16px'
  });

  const [selectedElement, setSelectedElement] = useState(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [colorPickerTarget, setColorPickerTarget] = useState(null);
  const [previewData, setPreviewData] = useState({
    studentName: 'John Doe',
    trackName: 'Full Stack Development',
    completionDate: '2024-06-01',
    managerName: 'Sarah Johnson'
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const signatureInputRef = useRef(null);
  const [resizingElement, setResizingElement] = useState(null);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });

  // Available fonts
  const fontOptions = [
    'Inter', 'Rajdhani', 'Orbitron', 'Montserrat', 'Pinyon Script', 'Arial', 'sans-serif'
  ];

  // Available placeholders
  const placeholderOptions = [
    { key: 'student_name', label: 'Student Name', example: 'John Doe' },
    { key: 'track_name', label: 'Track Name', example: 'Full Stack Development' },
    { key: 'completion_date', label: 'Completion Date', example: '15 December 2024' },
    { key: 'current_date', label: 'Current Date', example: '27 June 2025' },
    { key: 'company_name', label: 'Company Name', example: 'VEDARC TECHNOLOGIES' },
    { key: 'user_id', label: 'User ID', example: 'VEDARC-12345' }
  ];

  useEffect(() => {
    const initializeTemplate = () => {
      try {
        if (initialTemplate) {
          // Ensure placeholders is always an object and add defaults for missing fields
          const safeTemplate = {
            fontSize: '16px',
            ...initialTemplate,
            placeholders: initialTemplate.placeholders || {}
          };
          setTemplate(safeTemplate);
        } else {
          // Set default template if none provided
          setTemplate({
            orientation: 'portrait',
            placeholders: {},
            backgroundColor: '#ffffff',
            borderColor: '#cccccc',
            background_image: '',
            textColor: '#000000',
            fontFamily: 'Arial',
            fontSize: '16px'
          });
        }
      } catch (error) {
        console.error('Error initializing template:', error);
        // Set safe default template
        setTemplate({
          orientation: 'portrait',
          placeholders: {},
          backgroundColor: '#ffffff',
          borderColor: '#cccccc',
          background_image: '',
          textColor: '#000000',
          fontFamily: 'Arial',
          fontSize: '16px'
        });
      } finally {
        setIsLoading(false);
      }
    };

    initializeTemplate();
  }, [initialTemplate]);

  // Add body class when component mounts and remove when it unmounts
  useEffect(() => {
    document.body.classList.add('certificate-editor-open');
    
    return () => {
      document.body.classList.remove('certificate-editor-open');
    };
  }, []);

  const handleBackgroundUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setTemplate(prev => ({
          ...prev,
          background_image: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const addTextElement = () => {
    const newId = `text_${Date.now()}`;
    const newElement = {
      id: newId,
      type: 'text',
      text: 'Enter text here',
      x: 50,
      y: 100,
      fontSize: 16,
      fontFamily: 'Arial',
      color: '#000000',
      placeholder: null
    };

    setTemplate(prev => ({
      ...prev,
      placeholders: {
        ...(prev.placeholders || {}),
        [newId]: newElement
      }
    }));

    setSelectedElement(newId);
  };

  const addSignatureElement = () => {
    const newId = `signature_${Date.now()}`;
    const newElement = {
      id: newId,
      type: 'signature',
      image: '', // base64
      x: 100,
      y: 200,
      width: 120,
      height: 40
    };
    setTemplate(prev => ({
      ...prev,
      placeholders: {
        ...(prev.placeholders || {}),
        [newId]: newElement
      }
    }));
    setSelectedElement(newId);
  };

  const updateElement = (elementId, updates) => {
    setTemplate(prev => ({
      ...prev,
      placeholders: {
        ...(prev.placeholders || {}),
        [elementId]: {
          ...(prev.placeholders?.[elementId] || {}),
          ...updates
        }
      }
    }));
  };

  const deleteElement = (elementId) => {
    setTemplate(prev => {
      const newPlaceholders = { ...(prev.placeholders || {}) };
      delete newPlaceholders[elementId];
      return {
        ...prev,
        placeholders: newPlaceholders
      };
    });
    setSelectedElement(null);
  };

  const handleMouseDown = (e, elementId) => {
    e.preventDefault();
    setSelectedElement(elementId);
    setIsDragging(true);
    
    const rect = canvasRef.current.getBoundingClientRect();
    const element = template.placeholders?.[elementId];
    if (!element) return;
    
    setDragOffset({
      x: e.clientX - rect.left - element.x,
      y: e.clientY - rect.top - element.y
    });
  };

  const handleMouseMove = useCallback((e) => {
    if (!isDragging || !selectedElement) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const newX = e.clientX - rect.left - dragOffset.x;
    const newY = e.clientY - rect.top - dragOffset.y;

    // Constrain to canvas bounds
    const constrainedX = Math.max(0, Math.min(newX, rect.width - 100));
    const constrainedY = Math.max(0, Math.min(newY, rect.height - 50));

    updateElement(selectedElement, {
      x: constrainedX,
      y: constrainedY
    });
  }, [isDragging, selectedElement, dragOffset]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const openColorPicker = (target, currentColor) => {
    setColorPickerTarget(target);
    setShowColorPicker(true);
  };

  const handleColorChange = (color) => {
    if (colorPickerTarget === 'background') {
      setTemplate(prev => ({ ...prev, backgroundColor: color.hex }));
    } else if (colorPickerTarget === 'text') {
      setTemplate(prev => ({ ...prev, textColor: color.hex }));
    } else if (colorPickerTarget === 'border') {
      setTemplate(prev => ({ ...prev, borderColor: color.hex }));
    } else if (colorPickerTarget === 'element' && selectedElement) {
      updateElement(selectedElement, { color: color.hex });
    }
  };

  const replacePlaceholders = (text) => {
    if (!text) return '';
    return text
      .replace(/{student_name}/g, previewData.studentName)
      .replace(/{track_name}/g, previewData.trackName)
      .replace(/{completion_date}/g, previewData.completionDate)
      .replace(/{current_date}/g, new Date().toLocaleDateString('en-US', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      }))
      .replace(/{manager_name}/g, previewData.managerName)
      .replace(/{company_name}/g, 'VEDARC TECHNOLOGIES')
      .replace(/{user_id}/g, 'VEDARC-12345');
  };

  const getCanvasDimensions = () => {
    const isPortrait = template.orientation === 'portrait';
    return {
      width: isPortrait ? 500 : 700,
      height: isPortrait ? 700 : 500
    };
  };

  const handleSave = () => {
    // Ensure template has all required fields before saving
    const validatedTemplate = {
      orientation: template.orientation || 'portrait',
      placeholders: template.placeholders || {},
      backgroundColor: template.backgroundColor || '#ffffff',
      borderColor: template.borderColor || '#cccccc',
      background_image: template.background_image || '',
      textColor: template.textColor || '#000000',
      fontFamily: template.fontFamily || 'Arial',
      fontSize: template.fontSize || '16px',
      ...template // Include any other fields
    }

    // Validate before calling onSave
    if (!validatedTemplate.orientation) {
      alert('Please select an orientation')
      return
    }

    if (!validatedTemplate.placeholders || Object.keys(validatedTemplate.placeholders).length === 0) {
      alert('Please add at least one text element or signature')
      return
    }

    // Additional check: ensure at least one text element has content
    const hasValidContent = Object.values(validatedTemplate.placeholders).some(element => {
      if (element.type === 'signature') {
        return element.image && element.image.trim() !== ''
      } else {
        return element.text && element.text.trim() !== ''
      }
    })

    if (!hasValidContent) {
      alert('Please add content to at least one text element or signature')
      return
    }

    onSave(validatedTemplate)
  }

  // Check if template is ready to save
  const isTemplateReady = () => {
    if (!template.orientation) return false
    if (!template.placeholders || Object.keys(template.placeholders).length === 0) return false
    
    return Object.values(template.placeholders).some(element => {
      if (element.type === 'signature') {
        return element.image && element.image.trim() !== ''
      } else {
        return element.text && element.text.trim() !== ''
      }
    })
  }

  const handlePreview = () => {
    onPreview(template, previewData);
  };

  const canvasDimensions = getCanvasDimensions();

  // Ensure placeholders is always an object
  const safePlaceholders = template.placeholders || {};

  // Add a helper function to parse markdown-like syntax for bold, italic, underline
  function renderStyledText(text) {
    if (!text) return null;
    // Replace **bold**
    let parts = [];
    let regex = /\*\*(.*?)\*\*|\*(.*?)\*|__(.*?)__/g;
    let lastIndex = 0;
    let match;
    let key = 0;
    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      if (match[1]) {
        parts.push(<span key={key++} style={{ fontWeight: 'bold' }}>{match[1]}</span>);
      } else if (match[2]) {
        parts.push(<span key={key++} style={{ fontStyle: 'italic' }}>{match[2]}</span>);
      } else if (match[3]) {
        parts.push(<span key={key++} style={{ textDecoration: 'underline' }}>{match[3]}</span>);
      }
      lastIndex = regex.lastIndex;
    }
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }
    return parts;
  }

  // Add handler for signature image upload
  const handleSignatureUpload = (event, elementId) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        updateElement(elementId, { image: e.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  // Add resizing logic for signature images
  const handleResizeMouseDown = (e, elementId) => {
    e.stopPropagation();
    setResizingElement(elementId);
    const element = template.placeholders[elementId];
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: element.width,
      height: element.height
    });
  };

  useEffect(() => {
    if (resizingElement) {
      const onMouseMove = (e) => {
        const dx = e.clientX - resizeStart.x;
        const dy = e.clientY - resizeStart.y;
        const newWidth = Math.max(30, resizeStart.width + dx);
        const newHeight = Math.max(10, resizeStart.height + dy);
        updateElement(resizingElement, { width: newWidth, height: newHeight });
      };
      const onMouseUp = () => {
        setResizingElement(null);
      };
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
      return () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      };
    }
  }, [resizingElement, resizeStart]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="certificate-template-editor">
        <div className="editor-header">
          <h2>Certificate Template Editor - {templateType}</h2>
        </div>
        <div className="editor-content" style={{ justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ textAlign: 'center', color: 'var(--text-primary)' }}>
            <FaSpinner className="spinner" style={{ fontSize: '2rem', marginBottom: '1rem' }} />
            <p>Loading template editor...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="certificate-template-editor">
      <div className="editor-header">
        <h2>Certificate Template Editor - {templateType}</h2>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          <button className="btn btn-primary" onClick={handlePreview}>
            <FaEye /> Preview
          </button>
          <button 
            className={`btn ${isTemplateReady() ? 'btn-success' : 'btn-secondary'}`} 
            onClick={handleSave}
            disabled={!isTemplateReady()}
          >
            <FaSave /> {isTemplateReady() ? 'Save Template' : 'Add Content to Save'}
          </button>
        </div>
      </div>

      <div className="editor-content">
        {/* Left Panel - Tools */}
        <div className="editor-panel tools-panel">
          <div className="panel-section">
            <h3>Background</h3>
            <div className="upload-section">
              <button 
                className="btn btn-outline" 
                onClick={() => fileInputRef.current?.click()}
              >
                <FaUpload /> Upload Background
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleBackgroundUpload}
                style={{ display: 'none' }}
              />
            </div>
            
            <div className="color-section">
              <label>Background Color:</label>
              <div 
                className="color-preview"
                style={{ backgroundColor: template.backgroundColor }}
                onClick={() => openColorPicker('background', template.backgroundColor)}
              />
            </div>

            <div className="orientation-section">
              <label>Orientation:</label>
              <select
                value={template.orientation}
                onChange={(e) => setTemplate(prev => ({ ...prev, orientation: e.target.value }))}
              >
                <option value="portrait">Portrait</option>
                <option value="landscape">Landscape</option>
              </select>
            </div>
          </div>

          <div className="panel-section">
            <h3>Text Elements</h3>
            <button className="btn btn-primary" onClick={addTextElement}>
              <FaPlus /> Add Text
            </button>
            
            <div className="panel-section">
              <h3>Signature</h3>
              <button className="btn btn-primary" onClick={addSignatureElement}>
                + Add Signature Image
              </button>
            </div>
            
            {Object.entries(safePlaceholders).map(([id, element]) => (
              <div 
                key={id} 
                className={`element-item ${selectedElement === id ? 'selected' : ''}`}
                onClick={() => setSelectedElement(id)}
              >
                <div className="element-header">
                  <span>{element.type === 'signature' ? 'Signature Image' : 'Text Element'}</span>
                  <button 
                    className="btn-icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteElement(id);
                    }}
                  >
                    <FaTrash />
                  </button>
                </div>
                {element.type === 'signature' ? (
                  <>
                    <button
                      className="btn btn-outline"
                      onClick={() => signatureInputRef.current && signatureInputRef.current[id] && signatureInputRef.current[id].click()}
                    >Upload Signature Image</button>
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      ref={el => {
                        if (!signatureInputRef.current) signatureInputRef.current = {};
                        signatureInputRef.current[id] = el;
                      }}
                      onChange={e => handleSignatureUpload(e, id)}
                    />
                    {element.image && (
                      <img src={element.image} alt="Signature Preview" style={{ width: '100%', maxHeight: 60, marginTop: 8, objectFit: 'contain', background: '#fff', border: '1px solid #eee', borderRadius: 4 }} />
                    )}
                  </>
                ) : (
                  <>
                    {/* Formatting buttons */}
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                      <button type="button" title="Bold" onClick={(e) => {
                        e.stopPropagation();
                        const textarea = e.target.parentNode.nextSibling;
                        if (!textarea) return;
                        const start = textarea.selectionStart;
                        const end = textarea.selectionEnd;
                        const value = textarea.value;
                        const selected = value.substring(start, end);
                        const newValue = value.substring(0, start) + '**' + selected + '**' + value.substring(end);
                        updateElement(id, { text: newValue });
                        setTimeout(() => {
                          textarea.focus();
                          textarea.setSelectionRange(start + 2, end + 2);
                        }, 0);
                      }} style={{ fontWeight: 'bold', fontSize: '1.1em' }}>B</button>
                      <button type="button" title="Italic" onClick={(e) => {
                        e.stopPropagation();
                        const textarea = e.target.parentNode.nextSibling;
                        if (!textarea) return;
                        const start = textarea.selectionStart;
                        const end = textarea.selectionEnd;
                        const value = textarea.value;
                        const selected = value.substring(start, end);
                        const newValue = value.substring(0, start) + '*' + selected + '*' + value.substring(end);
                        updateElement(id, { text: newValue });
                        setTimeout(() => {
                          textarea.focus();
                          textarea.setSelectionRange(start + 1, end + 1);
                        }, 0);
                      }} style={{ fontStyle: 'italic', fontSize: '1.1em' }}>I</button>
                      <button type="button" title="Underline" onClick={(e) => {
                        e.stopPropagation();
                        const textarea = e.target.parentNode.nextSibling;
                        if (!textarea) return;
                        const start = textarea.selectionStart;
                        const end = textarea.selectionEnd;
                        const value = textarea.value;
                        const selected = value.substring(start, end);
                        const newValue = value.substring(0, start) + '__' + selected + '__' + value.substring(end);
                        updateElement(id, { text: newValue });
                        setTimeout(() => {
                          textarea.focus();
                          textarea.setSelectionRange(start + 2, end + 2);
                        }, 0);
                      }} style={{ textDecoration: 'underline', fontSize: '1.1em' }}>U</button>
                    </div>
                    <textarea
                      value={element.text || ''}
                      onChange={(e) => updateElement(id, { text: e.target.value })}
                      placeholder="Enter text..."
                      rows={2}
                      style={{ resize: 'vertical', width: '100%' }}
                    />
                  </>
                )}
              </div>
            ))}
          </div>

          {selectedElement && safePlaceholders[selectedElement] && (
            <div className="panel-section">
              <h3>Element Properties</h3>
              <div className="property-group">
                <label>Font Family:</label>
                <select
                  value={safePlaceholders[selectedElement].fontFamily || 'Arial'}
                  onChange={(e) => updateElement(selectedElement, { fontFamily: e.target.value })}
                >
                  {fontOptions.map(font => (
                    <option key={font} value={font}>{font}</option>
                  ))}
                </select>
              </div>

              <div className="property-group">
                <label>Font Size:</label>
                <input
                  type="number"
                  value={safePlaceholders[selectedElement].fontSize || 16}
                  onChange={(e) => updateElement(selectedElement, { fontSize: parseInt(e.target.value) })}
                  min="8"
                  max="72"
                />
              </div>

              <div className="property-group">
                <label>Color:</label>
                <div 
                  className="color-preview"
                  style={{ backgroundColor: safePlaceholders[selectedElement].color || '#000000' }}
                  onClick={() => openColorPicker('element', safePlaceholders[selectedElement].color || '#000000')}
                />
              </div>

              <div className="property-group">
                <label>Position X:</label>
                <input
                  type="number"
                  value={safePlaceholders[selectedElement].x || 0}
                  onChange={(e) => updateElement(selectedElement, { x: parseInt(e.target.value) })}
                  min="0"
                  max={canvasDimensions.width}
                />
              </div>

              <div className="property-group">
                <label>Position Y:</label>
                <input
                  type="number"
                  value={safePlaceholders[selectedElement].y || 0}
                  onChange={(e) => updateElement(selectedElement, { y: parseInt(e.target.value) })}
                  min="0"
                  max={canvasDimensions.height}
                />
              </div>
            </div>
          )}

          <div className="panel-section">
            <h3>Preview Data</h3>
            <div className="preview-data">
              <div className="property-group">
                <label>Student Name:</label>
                <input
                  type="text"
                  value={previewData.studentName}
                  onChange={(e) => setPreviewData(prev => ({ ...prev, studentName: e.target.value }))}
                />
              </div>
              <div className="property-group">
                <label>Track Name:</label>
                <input
                  type="text"
                  value={previewData.trackName}
                  onChange={(e) => setPreviewData(prev => ({ ...prev, trackName: e.target.value }))}
                />
              </div>
              <div className="property-group">
                <label>Completion Date:</label>
                <input
                  type="text"
                  value={previewData.completionDate}
                  onChange={(e) => setPreviewData(prev => ({ ...prev, completionDate: e.target.value }))}
                />
              </div>
              <div className="property-group">
                <label>Manager Name:</label>
                <input
                  type="text"
                  value={previewData.managerName}
                  onChange={(e) => setPreviewData(prev => ({ ...prev, managerName: e.target.value }))}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Center Panel - Canvas */}
        <div className="editor-panel canvas-panel">
          <div className="canvas-container">
            <div
              ref={canvasRef}
              className="certificate-canvas"
              style={{
                width: canvasDimensions.width,
                height: canvasDimensions.height,
                backgroundColor: template.backgroundColor,
                backgroundImage: template.background_image ? `url(${template.background_image})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                border: `2px solid ${template.borderColor}`,
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {Object.entries(safePlaceholders).map(([id, element]) => (
                element.type === 'signature' ? (
                  <div
                    key={id}
                    className={`signature-element ${selectedElement === id ? 'selected' : ''}`}
                    style={{
                      position: 'absolute',
                      left: element.x || 0,
                      top: element.y || 0,
                      width: element.width,
                      height: element.height,
                      cursor: 'move',
                      userSelect: 'none',
                      border: selectedElement === id ? '2px dashed #007bff' : 'none',
                      background: 'transparent',
                      zIndex: selectedElement === id ? 20 : 10
                    }}
                    onMouseDown={(e) => handleMouseDown(e, id)}
                  >
                    {element.image && (
                      <img
                        src={element.image}
                        alt="Signature"
                        style={{ width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'none' }}
                      />
                    )}
                    {/* Resize handle */}
                    <div
                      style={{
                        position: 'absolute',
                        right: -8,
                        bottom: -8,
                        width: 16,
                        height: 16,
                        background: '#fff',
                        border: '2px solid #007bff',
                        borderRadius: 8,
                        cursor: 'nwse-resize',
                        zIndex: 30
                      }}
                      onMouseDown={e => handleResizeMouseDown(e, id)}
                    />
                  </div>
                ) : (
                  <motion.div
                    key={id}
                    className={`text-element ${selectedElement === id ? 'selected' : ''}`}
                    style={{
                      position: 'absolute',
                      left: element.x || 0,
                      top: element.y || 0,
                      fontSize: element.fontSize || 16,
                      fontFamily: element.fontFamily || 'Arial',
                      color: element.color || '#000000',
                      cursor: 'move',
                      userSelect: 'none',
                      padding: '2px',
                      borderRadius: '4px',
                      backgroundColor: selectedElement === id ? 'rgba(0, 123, 255, 0.1)' : 'transparent',
                      border: selectedElement === id ? '2px dashed #007bff' : 'none'
                    }}
                    onMouseDown={(e) => handleMouseDown(e, id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Render styled text with line breaks */}
                    {replacePlaceholders(element.text || '').split('\n').map((line, idx) => (
                      <div key={idx} style={{ display: 'block', width: '100%', whiteSpace: 'pre-wrap' }}>{renderStyledText(line)}</div>
                    ))}
                  </motion.div>
                )
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel - Placeholders */}
        <div className="editor-panel placeholders-panel">
          <div className="panel-section">
            <h3>Available Placeholders</h3>
            <p className="placeholder-help">
              Click on any placeholder to insert it into the selected text element.
            </p>
            <div className="placeholder-list">
              {placeholderOptions.map(placeholder => (
                <button
                  key={placeholder.key}
                  className="placeholder-item"
                  onClick={() => {
                    if (selectedElement && safePlaceholders[selectedElement]) {
                      const currentText = safePlaceholders[selectedElement].text || '';
                      const newText = currentText + `{${placeholder.key}}`;
                      updateElement(selectedElement, { text: newText });
                    }
                  }}
                >
                  <div className="placeholder-key">{placeholder.key}</div>
                  <div className="placeholder-label">{placeholder.label}</div>
                  <div className="placeholder-example">{placeholder.example}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Color Picker Modal */}
      <AnimatePresence>
        {showColorPicker && (
          <motion.div
            className="color-picker-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowColorPicker(false)}
          >
            <motion.div
              className="color-picker-container"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <SketchPicker
                color={colorPickerTarget === 'background' ? template.backgroundColor :
                       colorPickerTarget === 'text' ? template.textColor :
                       colorPickerTarget === 'border' ? template.borderColor :
                       selectedElement && safePlaceholders[selectedElement] ? safePlaceholders[selectedElement].color : '#000000'}
                onChange={handleColorChange}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CertificateTemplateEditor; 