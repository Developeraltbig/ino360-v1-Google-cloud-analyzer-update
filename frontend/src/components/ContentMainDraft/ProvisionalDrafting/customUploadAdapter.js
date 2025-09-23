class CustomUploadAdapter {
  constructor(loader) {
    this.loader = loader;
  }

  // Starts the upload process.
  upload() {
    return new Promise((resolve, reject) => {
      const data = new FormData();

      this.loader.file.then((file) => {
        data.append("upload", file); // This key should match with what your server expects

        // Use your own upload URL here.
        fetch("/upload", {
          // Make sure this URL points to your server
          method: "POST",
          body: data,
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error("Upload failed");
            }
            return response.json();
          })
          .then((result) => {
            // Assuming the server responds with a JSON object that contains a 'url' field
            resolve({ default: result.url });
          })
          .catch((error) => {
            reject(error);
          });
      });
    });
  }

  // Aborts the upload process if needed.
  abort() {
    // Implement abort logic if necessary.
  }
}

// The following function is used to create an instance of the custom upload adapter.
export default function CustomUploadAdapterPlugin(editor) {
  editor.plugins.get("FileRepository").createUploadAdapter = (loader) => {
    return new CustomUploadAdapter(loader);
  };
}
