import { PlaceholderPage } from "./PlaceholderPage";

export function AboutPage() {
  return (
    <PlaceholderPage
      title="About CVSaathi"
      description="Empowering Tier-2 India professionals with AI-powered career growth tools."
      content={
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600">
            CVSaathi is an AI-powered career growth platform designed specifically for professionals in Tier-2 cities across India. 
            We understand the unique challenges faced by job seekers in smaller cities and have built a comprehensive suite of tools 
            to help you succeed in your career journey.
          </p>
          <p className="text-gray-600">
            Our mission is to democratize access to world-class career development tools, making professional growth accessible to 
            everyone, regardless of their location or background.
          </p>
        </div>
      }
    />
  );
}

