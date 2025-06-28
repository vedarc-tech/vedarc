# Auto Project Assignment Feature Guide

## Overview

The Auto Project Assignment feature automatically assigns a final project to students when they achieve 100% completion in their weekly tasks. This eliminates the need for managers to manually assign projects to each student.

## How It Works

### 1. **100% Completion Detection**
- The system monitors student progress in real-time
- When a student reaches 100% completion (all weekly tasks approved/completed), the auto-assignment process is triggered
- Progress is calculated based on approved/completed submissions across all weeks

### 2. **Project Template Availability Check**
- The system checks if there are project templates available for the student's internship track
- Project templates must be created by managers beforehand for each internship track
- If no templates are available, the auto-assignment is skipped

### 3. **Automatic Assignment Process**
- A congratulatory modal appears when 100% completion is achieved
- The modal shows the available project template details
- Student can choose to accept the project assignment or defer it
- Upon acceptance, the project is automatically assigned from the template

## Feature Flags

### Frontend Control
```javascript
// In StudentDashboard.jsx
const AUTO_PROJECT_ASSIGNMENT_ENABLED = true  // Enable/disable the feature
```

### Backend Endpoints
- `GET /api/student/project/templates?internship_id=<id>` - Get available templates
- `POST /api/student/project/auto-assign` - Auto-assign project to student

## Manager Setup Required

### 1. **Create Project Templates**
Managers must create project templates for each internship track:

1. Go to Manager Dashboard
2. Navigate to Project Management
3. Create project templates with:
   - Title
   - Description
   - Upload link (optional)
   - Associated internship track

### 2. **Template Structure**
```json
{
  "internship_id": "track_id",
  "title": "Project Title",
  "description": "Project Description",
  "upload_link": "https://example.com/requirements",
  "is_template": true
}
```

## Student Experience

### 1. **Progress Tracking**
- Students can see their progress percentage in the dashboard
- Progress updates in real-time as assignments are approved

### 2. **Auto-Assignment Modal**
When 100% completion is achieved:
- Congratulations message appears
- Project template details are shown
- Student can view project requirements
- Option to accept or defer assignment

### 3. **Project Workflow**
After assignment:
- Project appears in the "Final Project" section
- Student can submit their project
- Manager can review and provide feedback
- Project status updates accordingly

## Benefits

1. **Automated Workflow**: No manual intervention required
2. **Consistent Experience**: All students get projects when eligible
3. **Manager Efficiency**: Reduces manual assignment workload
4. **Student Motivation**: Immediate reward for completing all tasks
5. **Scalable**: Works for any number of students

## Configuration

### Enable/Disable Feature
```javascript
// To disable auto-assignment
const AUTO_PROJECT_ASSIGNMENT_ENABLED = false

// To enable auto-assignment
const AUTO_PROJECT_ASSIGNMENT_ENABLED = true
```

### Customization Options
- Modify the auto-assignment logic in `checkAndHandleAutoProjectAssignment()`
- Change the modal content and styling
- Add additional validation rules
- Implement different project selection algorithms

## Troubleshooting

### Common Issues

1. **No Project Templates Available**
   - Ensure managers have created templates for the internship track
   - Check that templates are marked as `is_template: true`

2. **Auto-Assignment Not Triggering**
   - Verify progress calculation is correct
   - Check that all weekly submissions are approved
   - Ensure feature flag is enabled

3. **Project Assignment Fails**
   - Check backend logs for errors
   - Verify student doesn't already have a project assigned
   - Ensure internship_id is valid

### Debug Information
- Check browser console for auto-assignment logs
- Monitor backend API responses
- Verify project template availability

## Future Enhancements

1. **Multiple Template Selection**: Allow students to choose from multiple templates
2. **Smart Assignment**: Implement algorithms to match students with suitable projects
3. **Notification System**: Send email notifications for auto-assignments
4. **Analytics**: Track auto-assignment success rates and student preferences
5. **Custom Rules**: Allow managers to set custom completion criteria 