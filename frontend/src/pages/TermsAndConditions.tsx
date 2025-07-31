import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const TermsAndConditions = () => {
  return (
    <div className="min-h-screen gradient-secondary py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-6">
          <Link to="/register">
            <Button variant="ghost" className="text-blue-600 hover:text-blue-700 hover-glow">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Registration
            </Button>
          </Link>
        </div>

        <Card className="glass-card hover-glow">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-gradient text-center">
              Terms and Conditions
            </CardTitle>
            <p className="text-center text-muted-foreground">
              NaijaSnackTrack - Food Consumption Tracking App
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-blue-700 mb-3">1. Introduction</h2>
              <p className="text-gray-700 leading-relaxed">
                Welcome to NaijaSnackTrack ("we," "our," or "us"). These Terms and Conditions ("Terms") govern your use of our food consumption tracking application and related services. By accessing or using our app, you agree to be bound by these Terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-blue-700 mb-3">2. User Accounts</h2>
              <p className="text-gray-700 leading-relaxed mb-2">
                To use our services, you must create an account and provide accurate, complete information. You are responsible for:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                <li>Maintaining the security of your account credentials</li>
                <li>All activities that occur under your account</li>
                <li>Notifying us immediately of any unauthorized access</li>
                <li>Providing truthful information about your food consumption</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-blue-700 mb-3">3. Data Collection and Privacy</h2>
              <p className="text-gray-700 leading-relaxed mb-2">
                We collect and process the following types of data:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                <li>Personal information (name, email, phone number)</li>
                <li>Food consumption data (meals, snacks, beverages)</li>
                <li>Media files (photos, audio, video recordings)</li>
                <li>Location data (when permission is granted)</li>
                <li>Usage analytics and app performance data</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-2">
                We use this data to provide our services, improve user experience, and generate personalized insights. Your data is stored securely and is not shared with third parties without your consent.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-blue-700 mb-3">4. AI-Powered Features</h2>
              <p className="text-gray-700 leading-relaxed">
                Our app uses artificial intelligence to analyze your food consumption patterns and media uploads. AI analysis results are automated and may not always be 100% accurate. Users should review and verify AI-generated insights before relying on them for dietary decisions.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-blue-700 mb-3">5. Points and Rewards System</h2>
              <p className="text-gray-700 leading-relaxed mb-2">
                Our app includes a points-based reward system where users earn points for logging consumption data. Please note:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                <li>Points have no monetary value and cannot be exchanged for cash</li>
                <li>Rewards are subject to availability and may change without notice</li>
                <li>We reserve the right to modify or discontinue the rewards program</li>
                <li>Fraudulent activity to earn points may result in account suspension</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-blue-700 mb-3">6. Media Content</h2>
              <p className="text-gray-700 leading-relaxed">
                When you upload photos, audio, or video content to our app, you grant us a license to process, store, and analyze this content for service provision. You retain ownership of your content, but you must ensure you have the right to upload and share any content you submit.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-blue-700 mb-3">7. Prohibited Conduct</h2>
              <p className="text-gray-700 leading-relaxed mb-2">
                You agree not to:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                <li>Use the app for any illegal or unauthorized purpose</li>
                <li>Upload harmful, offensive, or inappropriate content</li>
                <li>Attempt to reverse engineer or hack the application</li>
                <li>Create fake accounts or provide false information</li>
                <li>Interfere with the app's security features</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-blue-700 mb-3">8. Disclaimer of Warranties</h2>
              <p className="text-gray-700 leading-relaxed">
                Our app is provided "as is" without warranties of any kind. We do not guarantee that the app will be error-free, uninterrupted, or meet your specific requirements. Any dietary or health insights provided by the app should not replace professional medical advice.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-blue-700 mb-3">9. Limitation of Liability</h2>
              <p className="text-gray-700 leading-relaxed">
                To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the app, including but not limited to loss of data, business interruption, or personal injury.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-blue-700 mb-3">10. Termination</h2>
              <p className="text-gray-700 leading-relaxed">
                We may terminate or suspend your account at any time for violations of these Terms. Upon termination, your right to use the app ceases immediately, and we may delete your account data in accordance with our data retention policies.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-blue-700 mb-3">11. Changes to Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to modify these Terms at any time. We will notify users of significant changes through the app or via email. Continued use of the app after changes constitutes acceptance of the new Terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-blue-700 mb-3">12. Contact Information</h2>
              <p className="text-gray-700 leading-relaxed">
                If you have questions about these Terms, please contact us at:
              </p>
              <div className="mt-2 text-gray-700">
                <p>Email: support@naijasnacktrack.com</p>
                <p>Phone: +234 (0) 123 456 7890</p>
                <p>Address: Lagos, Nigeria</p>
              </div>
            </section>

            <section className="pt-4 border-t border-blue-200">
              <p className="text-sm text-muted-foreground text-center">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TermsAndConditions;