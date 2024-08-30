import { UploadButton } from '@/utils/uploadthing';

export default function CreateListingPage() {
  return (
    <div>
      <h1>Create Listing</h1>
      <UploadButton
        endpoint='imageUploader'
        onClientUploadComplete={(res) => {
          // Do something with the response
          // eslint-disable-next-line no-console
          console.log('Files: ', res);
          alert('Upload Completed');
        }}
        onUploadError={(error: Error) => {
          // Do something with the error.
          alert(`ERROR! ${error.message}`);
        }}
      />
    </div>
  );
}
