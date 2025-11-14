# Modal and Toast Usage Examples

## Modal Component

The Modal component is a reusable, customizable modal dialog that matches your current theme.

### Basic Usage

```jsx
import { useState } from 'react';
import Modal from '../components/Modal';

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Open Modal</button>
      
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="My Modal Title"
      >
        <p>Modal content goes here</p>
        <button onClick={() => setIsOpen(false)}>Close</button>
      </Modal>
    </>
  );
}
```

### Custom Sizes

```jsx
<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  size="sm"  // Options: 'sm', 'md', 'lg', 'xl', 'full'
  title="Small Modal"
>
  Small modal content
</Modal>

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  maxWidth="1200px"  // Custom width override
  maxHeight="80vh"
>
  Custom sized modal
</Modal>
```

### Advanced Options

```jsx
<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Advanced Modal"
  showCloseButton={true}          // Show/hide close button
  closeOnOverlayClick={true}      // Close when clicking outside
  closeOnEscape={true}            // Close on Escape key
  className="my-custom-modal"     // Additional CSS classes
  style={{ backgroundColor: '#f0f0f0' }}  // Custom inline styles
>
  <div>
    <h3>Custom styled content</h3>
    <form>
      {/* Form content */}
    </form>
  </div>
</Modal>
```

### Without Header

```jsx
<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  showCloseButton={false}
  title={null}
>
  Full control over header
</Modal>
```

## Toast Notifications

The Toast system provides easy-to-use notifications that match your theme.

### Setup

The `ToastProvider` is already added to `_app.js`, so toasts are available throughout your app.

### Basic Usage

```jsx
import { useToast } from '../components/ToastProvider';

function MyComponent() {
  const toast = useToast();

  const handleSuccess = () => {
    toast.success('Operation completed successfully!');
  };

  const handleError = () => {
    toast.error('Something went wrong!');
  };

  const handleWarning = () => {
    toast.warning('Please check your input');
  };

  const handleInfo = () => {
    toast.info('Here is some information');
  };

  return (
    <div>
      <button onClick={handleSuccess}>Show Success</button>
      <button onClick={handleError}>Show Error</button>
      <button onClick={handleWarning}>Show Warning</button>
      <button onClick={handleInfo}>Show Info</button>
    </div>
  );
}
```

### With Title and Message

```jsx
const toast = useToast();

toast.success({
  title: 'Profile Updated',
  message: 'Your profile has been successfully updated.',
  duration: 5000  // Duration in milliseconds (default: 5000)
});
```

### Custom Duration

```jsx
const toast = useToast();

// Show for 10 seconds
toast.info('This message will stay longer', { duration: 10000 });

// Show until manually closed
toast.error('Critical error!', { duration: 0 });
```

### Toast Types

- `toast.success(message, options)` - Green, checkmark icon
- `toast.error(message, options)` - Red, error icon
- `toast.warning(message, options)` - Yellow/Orange, warning icon
- `toast.info(message, options)` - Blue, info icon

### Examples in Different Scenarios

#### After Form Submission

```jsx
const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const response = await fetch('/api/endpoint', {
      method: 'POST',
      body: JSON.stringify(formData),
    });
    
    if (response.ok) {
      toast.success('Form submitted successfully!');
    } else {
      toast.error('Failed to submit form');
    }
  } catch (error) {
    toast.error('An error occurred: ' + error.message);
  }
};
```

#### With API Calls

```jsx
const loadData = async () => {
  try {
    toast.info('Loading data...', { duration: 2000 });
    const response = await fetch('/api/data');
    const data = await response.json();
    toast.success('Data loaded successfully!');
    setData(data);
  } catch (error) {
    toast.error({
      title: 'Failed to load data',
      message: error.message,
      duration: 7000
    });
  }
};
```

#### Confirmation Modals

```jsx
import { useState } from 'react';
import Modal from '../components/Modal';
import { useToast } from '../components/ToastProvider';

function DeleteButton({ itemId, onDelete }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const toast = useToast();

  const handleDelete = async () => {
    try {
      await onDelete(itemId);
      toast.success('Item deleted successfully');
      setShowConfirm(false);
    } catch (error) {
      toast.error('Failed to delete item');
    }
  };

  return (
    <>
      <button onClick={() => setShowConfirm(true)}>Delete</button>
      
      <Modal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        title="Confirm Deletion"
        size="sm"
      >
        <p>Are you sure you want to delete this item?</p>
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
          <button onClick={() => setShowConfirm(false)}>Cancel</button>
          <button onClick={handleDelete}>Delete</button>
        </div>
      </Modal>
    </>
  );
}
```

## Styling Notes

Both components use styled-jsx and match your current theme:
- Modern border-radius (12px-16px)
- Smooth transitions and animations
- Consistent color scheme
- Mobile responsive
- Dark overlay with blur effect
- Accessible (keyboard navigation, ARIA attributes)

The Modal and Toast components are fully customizable and ready to use throughout your application!

