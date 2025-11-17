import { PlaceholderPage } from "./PlaceholderPage";

export function ContactPage() {
  return (
    <PlaceholderPage
      title="Contact Us"
      description="Get in touch with the CVSaathi team"
      content={
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600 mb-6">
            We'd love to hear from you! Reach out to us through any of the following channels:
          </p>
          <div className="space-y-4">
            <div>
              <strong className="text-gray-900">Email:</strong>
              <p className="text-gray-600">support@cvsaathi.com</p>
            </div>
            <div>
              <strong className="text-gray-900">For Partnerships:</strong>
              <p className="text-gray-600">partners@cvsaathi.com</p>
            </div>
            <div>
              <strong className="text-gray-900">For Career Coaching Opportunities:</strong>
              <p className="text-gray-600">careers@cvsaathi.com</p>
            </div>
          </div>
        </div>
      }
    />
  );
}

