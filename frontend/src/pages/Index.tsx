
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, Gift, TrendingUp, Users, MapPin, Smartphone } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen gradient-secondary">
      {/* Header */}
      <header className="glass-effect border-b border-blue-200/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 nigeria-accent rounded-full"></div>
            <h1 className="text-2xl font-bold text-gradient">SnacksTrack</h1>
          </div>
          <div className="flex space-x-3">
            <Link to="/login">
              <Button variant="outline" className="border-blue-300 text-blue-600 hover:bg-blue-50 glass-effect">
                Login
              </Button>
            </Link>
            <Link to="/register">
              <Button className="gradient-primary hover-glow text-white">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 sm:px-6 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-800 mb-6 leading-tight">
            Track Your <span className="text-gradient">SNACKS</span> Consumption
          </h2>
          <p className="text-base sm:text-xl text-gray-600 mb-8 leading-relaxed">
            Capture your snacking moments with audio and video. Get rewarded for sharing your  snacking experiences and gain valuable insights into your consumption patterns.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="gradient-primary hover-glow text-white px-8 py-3 text-lg">
                Start Tracking Now
              </Button>
            </Link>
            {/* <Button variant="outline" size="lg" className="border-2 border-blue-300 text-blue-600 hover:bg-blue-50 glass-effect px-8 py-3 text-lg">
              Watch Demo
            </Button> */}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 sm:px-6 py-16">
        <h3 className="text-3xl font-bold text-center text-gray-800 mb-12">Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="glass-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover-glow">
            <CardHeader>
              <div className="w-12 h-12 gradient-primary rounded-lg flex items-center justify-center mb-4">
                <Camera className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-gray-800">AI-Powered Media Analysis</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <p className="text-gray-600">Record audio or video of your meals. Our AI automatically extracts consumption details and context from your snacking experiences.</p>
            </CardContent>
          </Card>

          <Card className="glass-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover-glow">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg flex items-center justify-center mb-4">
                <Gift className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-gray-800">Rewards</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <p className="text-gray-600">Earn points for every log entry. Redeem for MTN/Airtel airtime, Jumia vouchers, and other Nigerian rewards.</p>
            </CardContent>
          </Card>

          <Card className="glass-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover-glow">
            <CardHeader>
              <div className="w-12 h-12 gradient-primary rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-gray-800">Local Insights</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <p className="text-gray-600">Get detailed insights into your consumption patterns, spending habits, and favorite Nigerian brands and foods.</p>
            </CardContent>
          </Card>

          <Card className="glass-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover-glow">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-gray-800">Social Context</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <p className="text-gray-600">Track who you ate with, what combinations you enjoyed, and your social dining experiences across Nigeria.</p>
            </CardContent>
          </Card>

          <Card className="glass-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover-glow">
            <CardHeader>
              <div className="w-12 h-12 gradient-primary rounded-lg flex items-center justify-center mb-4">
                <MapPin className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-gray-800">Location Tracking</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <p className="text-gray-600">Automatically capture location data to understand your consumption patterns across different Nigerian cities and states.</p>
            </CardContent>
          </Card>

          <Card className="glass-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover-glow">
            <CardHeader>
              <div className="w-12 h-12 gradient-primary rounded-lg flex items-center justify-center mb-4">
                <Smartphone className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-gray-800">Mobile First</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <p className="text-gray-600">Designed for mobile with offline support and push notifications to keep you engaged wherever you are in Nigeria.</p>
            </CardContent>
          </Card>
        </div>
      </section>


      {/* Footer */}
      <footer className="bg-blue-900 text-white py-8">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-6 h-6 nigeria-accent rounded-full"></div>
            <span className="text-xl font-bold">SnacksTrack</span>
          </div>
          <p className="text-blue-200">© 2025 Inicio Insights Tech Team.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
