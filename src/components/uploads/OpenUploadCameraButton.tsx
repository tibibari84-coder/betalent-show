'use client';

export function OpenUploadCameraButton() {
  function openCamera() {
    window.location.hash = 'upload-panel';
    window.dispatchEvent(new Event('betalent:open-upload-camera'));
  }

  return (
    <button type="button" onClick={openCamera} className="foundation-hero-cta-primary">
      Open camera
    </button>
  );
}
