# Enhanced PDF Form Builder

A powerful, front-end only PDF form builder that lets users upload a PDF and overlay interactive form fields on it. Built with React, this tool provides an intuitive interface for creating professional forms with text inputs, checkboxes, and signature pads.

## ✨ Features

### 🎯 **Core Functionality**
- **PDF Upload & Rendering**: Upload any PDF file and view it in the browser
- **Interactive Form Fields**: Add text fields, checkboxes, and signature pads
- **Dual Mode Operation**: Switch between Edit Mode (for building) and Preview Mode (for testing)
- **Multi-Page Support**: Work with PDFs of any length

### 🖱️ **Enhanced User Experience**
- **Drag & Drop Interface**: Intuitive field placement with visual feedback
- **Smart Positioning**: Fields automatically snap to grid and stay within page bounds
- **Field Management**: Select, duplicate, delete, and manage fields easily
- **Visual Feedback**: Clear indicators for selected fields and drag operations

### ⌨️ **Keyboard Shortcuts**
- `Ctrl/Cmd + 1`: Add text field
- `Ctrl/Cmd + 2`: Add checkbox field  
- `Ctrl/Cmd + 3`: Add signature field
- `Ctrl/Cmd + D`: Duplicate selected field
- `Delete`: Delete selected field
- `Space`: Toggle between Edit/Preview modes
- `Esc`: Deselect field

### 🎨 **Modern UI/UX**
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Tailwind CSS**: Clean, modern styling with smooth animations
- **Visual Cues**: Clear indicators for all interactive elements
- **Loading States**: Professional loading and error handling

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation
```bash
# Clone the repository
git clone <your-repo-url>
cd pdf-form-builder

# Install dependencies
npm install

# Start development server
npm run dev
```

### Build for Production
```bash
npm run build
npm run preview
```

## 🛠️ Technology Stack

- **Framework**: React 18 with Vite
- **PDF Rendering**: react-pdf (PDF.js wrapper)
- **Styling**: Tailwind CSS
- **Drag & Drop**: react-draggable
- **Signature Capture**: react-signature-canvas
- **Build Tool**: Vite

## 📱 Usage Guide

### 1. Upload PDF
- Click the file input or drag a PDF file onto the page
- The PDF will render with page thumbnails on the left

### 2. Add Fields
- **Drag & Drop**: Drag field buttons from the toolbar onto PDF pages
- **Click to Add**: Click field buttons to add fields at default positions
- **Keyboard Shortcuts**: Use Ctrl+1/2/3 for quick field addition

### 3. Position Fields
- In Edit Mode, drag fields to position them precisely
- Fields snap to a 5px grid for alignment
- Fields automatically stay within page boundaries

### 4. Configure Fields
- **Text Fields**: Click to edit labels and content
- **Checkboxes**: Toggle between checked/unchecked states
- **Signature Fields**: Draw signatures with mouse or touch

### 5. Test Your Form
- Switch to Preview Mode to test field interactions
- Fill out the form as end users would
- Switch back to Edit Mode to make adjustments

### 6. Export/Import
- **Export**: Save your form layout as JSON
- **Import**: Load previously saved layouts
- **Clear All**: Remove all fields to start fresh

## 🎨 Field Types

### Text Field
- **Default Size**: 160×36 pixels
- **Features**: Editable text input with placeholder
- **Use Case**: Names, addresses, comments, etc.

### Checkbox Field
- **Default Size**: 24×24 pixels  
- **Features**: Toggle between checked/unchecked
- **Use Case**: Yes/No questions, agreements, etc.

### Signature Field
- **Default Size**: 200×80 pixels
- **Features**: Canvas-based signature drawing
- **Use Case**: Legal documents, contracts, approvals

## 🔧 Advanced Features

### Field Selection
- Click any field to select it
- Selected fields show blue border and controls
- Use keyboard shortcuts for quick actions

### Field Duplication
- Select a field and press Ctrl+D
- Or use the duplicate button in field controls
- Duplicated fields are offset slightly for easy identification

### Responsive Design
- Toolbar adapts to screen size
- PDF scales appropriately on mobile
- Touch-friendly interface for tablets

### Performance Optimizations
- Efficient PDF rendering with react-pdf
- Smooth animations with CSS transitions
- Optimized field positioning calculations

## 📁 Project Structure

```
src/
├── components/
│   ├── fields/
│   │   ├── TextField.jsx
│   │   ├── CheckboxField.jsx
│   │   └── SignatureField.jsx
│   ├── FieldRenderer.jsx
│   ├── PDFViewer.jsx
│   ├── Thumbnails.jsx
│   └── Toolbar.jsx
├── utils/
│   └── uuid.js
├── App.jsx
├── main.jsx
└── index.css
```

## 🎯 Best Practices

### Field Placement
- Position fields where they make logical sense
- Use consistent spacing between related fields
- Consider the final printed appearance

### Form Design
- Keep forms simple and intuitive
- Use clear labels for all fields
- Test the form flow in Preview Mode

### Performance
- Limit the number of fields per page for large PDFs
- Use appropriate field sizes for content
- Export layouts regularly to avoid losing work

## 🚧 Limitations & Considerations

- **Browser Only**: No server-side processing or storage
- **PDF Export**: Currently exports field data, not filled PDFs
- **Large Files**: Very large PDFs may impact performance
- **Field Validation**: No built-in validation rules (can be added)

## 🔮 Future Enhancements

- **Field Validation**: Add validation rules and error messages
- **PDF Export**: Generate filled PDFs with field data
- **Field Templates**: Pre-built field configurations
- **Collaboration**: Multi-user editing capabilities
- **Advanced Fields**: Date pickers, dropdowns, file uploads

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with [React](https://reactjs.org/)
- PDF rendering powered by [PDF.js](https://mozilla.github.io/pdf.js/)
- Styling with [Tailwind CSS](https://tailwindcss.com/)
- Drag & drop functionality from [react-draggable](https://github.com/react-grid-layout/react-draggable)
- Signature capture with [react-signature-canvas](https://github.com/blackjk3/react-signature-canvas)

---

**Happy Form Building! 🎉**
