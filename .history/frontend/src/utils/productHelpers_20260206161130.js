export const isDigitalCart = (cart) => {
  return cart.length > 0 && cart.every((item) => item.type === 'digital');
};

export const hasDigitalProducts = (cart) => {
  return cart.some((item) => item.type === 'digital');
};

export const getDigitalProducts = (cart) => {
  return cart.filter((item) => item.type === 'digital');
};

export const triggerDownload = (fileName, mimeType = 'application/octet-stream') => {
  // Create a dummy blob with sample content
  const dummyContent = `Sample download file: ${fileName}`;
  const blob = new Blob([dummyContent], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
