
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mic, Video, Sparkles, Zap, Upload } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { localDbOperations as dbOperations } from "@/lib/local-db";
import { authUtils } from "@/lib/auth";
import { azureAI, AzureAIAnalysis } from "@/lib/azure-ai";
import { getLocalStorage } from "@/lib/local-storage";
import { MediaCompressor } from "@/lib/media-compression";
import { LocationService, LocationData } from "@/lib/location";

const LogConsumption = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    product: "",
    brand: "",
    category: "",
    spend: "",
    companions: "",
    location: "",
    notes: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [aiAnalysis, setAiAnalysis] = useState<AzureAIAnalysis | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordingType, setRecordingType] = useState<'audio' | 'video'>('audio');
  const [captureMethod, setCaptureMethod] = useState<'manual' | 'ai'>('ai');
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);

  const categories = ["Jollof Rice", "Suya", "Pounded Yam", "Egusi", "Pepper Soup", "Chin Chin", "Plantain", "Akara", "Moi Moi", "Other"];
  const companionOptions = ["Alone", "With friends", "With family", "With colleagues", "With partner"];

  useEffect(() => {
    getCurrentLocation();
  }, []);

  useEffect(() => {
    if (captureMethod === 'manual') {
      setSelectedFile(null);
      setAiAnalysis(null);
    }
  }, [captureMethod]);

  const getCurrentLocation = async () => {
    try {
      const location = await LocationService.getCurrentLocation();
      setCurrentLocation(location);
    } catch (error) {
      console.warn('Could not get location:', error);
      // Continue without location
    }
  };

  const startRecording = async () => {
    try {
      const constraints = {
        audio: true,
        video: recordingType === 'video'
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      recorder.onstop = async () => {
        const blob = new Blob(chunks, { 
          type: recordingType === 'video' ? 'video/webm' : 'audio/webm' 
        });
        const file = new File([blob], `naija-meal-${Date.now()}.${recordingType === 'video' ? 'webm' : 'wav'}`, {
          type: blob.type
        });
        
        setSelectedFile(file);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
        
        // Analyze with Azure AI
        await analyzeWithAzureAI(file);
      };

      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);

      toast({
        title: "Recording started",
        description: `Recording ${recordingType}... Talk about your Nigerian meal experience!`,
      });
    } catch (error) {
      toast({
        title: "Recording failed",
        description: "Unable to access camera/microphone.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
    }
  };

  const analyzeWithAzureAI = async (file: File) => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    try {
      let transcription = '';

      // Transcribe audio/video
      if (file.type.includes('audio') || file.type.includes('video')) {
        transcription = await azureAI.transcribeAudio(file, (p) => {
          setAnalysisProgress(p / 2);
        });
      }

      // Analyze consumption data
      const analysis = await azureAI.analyzeConsumption(
        transcription,
        file.type.includes('video') ? 'video' : 'audio',
        (p) => {
          setAnalysisProgress(50 + p / 2);
        }
      );
      
      setAiAnalysis(analysis);
      
      // Auto-fill form with AI analysis
      setFormData(prev => ({
        ...prev,
        product: analysis.detectedProducts?.[0] || '',
        brand: analysis.brands?.[0] || '',
        category: analysis.categories?.[0] || '',
        spend: analysis.estimatedSpend?.replace('$', '₦') || '',
        location: analysis.location || '',
        notes: analysis.transcription || ''
      }));

      toast({
        title: "AI Analysis Complete! 🍲",
        description: `Analyzed your Naija meal with ${Math.round((analysis.confidence || 0) * 100)}% confidence`,
      });
    } catch (error) {
      console.error('AI Analysis error:', error);
      toast({
        title: "Analysis failed",
        description: "Unable to analyze the media.",
        variant: "destructive",
      });
    } finally {
      setAnalysisProgress(100);
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const currentUser = await authUtils.getCurrentUser();
      if (!currentUser) {
        toast({
          title: "Authentication required",
          description: "Please log in to continue.",
          variant: "destructive",
        });
        navigate('/login');
        return;
      }

      let mediaUrl = '';

      // Compress and upload locally if a file was recorded
      if (captureMethod === 'ai' && selectedFile) {
        let fileToUpload = selectedFile;
          
          // Compress media before upload
          if (selectedFile.type.startsWith('image/')) {
            if (MediaCompressor.needsCompression(selectedFile, 2)) {
              fileToUpload = await MediaCompressor.compressImage(selectedFile, 0.7, 800);
            }
          } else if (selectedFile.type.startsWith('video/')) {
            if (MediaCompressor.needsCompression(selectedFile, 10)) {
              fileToUpload = await MediaCompressor.compressVideo(selectedFile);
            }
          }
          
          const localStorageService = getLocalStorage();
          const uploadResult = await localStorageService.uploadFile(fileToUpload);
          if (uploadResult.success) {
            mediaUrl = uploadResult.url;
          }
      }

      // Calculate points based on submission
      let points = captureMethod === 'ai' ? 15 : 10; // Base points
      if (captureMethod === 'ai' && selectedFile) {
        points += recordingType === 'video' ? 25 : 20; // Video bonus
      }
      if (formData.notes.length > 50) points += 10; // Detailed description bonus

      // Create consumption log
      const logData = {
        userId: currentUser.id,
        product: formData.product,
        brand: formData.brand,
        category: formData.category,
        spend: formData.spend ? parseFloat(formData.spend.replace('₦', '')) : undefined,
        companions: formData.companions,
        location: currentLocation ? LocationService.formatLocation(currentLocation) : formData.location,
        notes: formData.notes,
        mediaUrl,
        mediaType: captureMethod === 'ai' && selectedFile ? (selectedFile.type.startsWith('video/') ? 'video' as const : 'audio' as const) : undefined,
        captureMethod,
        aiAnalysis: captureMethod === 'ai' ? aiAnalysis : undefined,
        points
      };

      await dbOperations.createConsumptionLog(logData);
      await dbOperations.updateUserPoints(currentUser.id, points);

      toast({
        title: "Naija meal logged successfully! 🎉",
        description: `You earned ${points} points for this entry.`,
      });
      
      navigate("/dashboard");
    } catch (error) {
      console.error('Submit error:', error);
      toast({
        title: "Submission failed",
        description: "Unable to save your consumption log.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen gradient-secondary pb-20 lg:pb-0">
      <Navigation />
      
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gradient mb-2">Share your snacking experience</h1>
            <p className="text-muted-foreground">Record your Snacks experience and earn points!</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-center space-x-4">
              <Button
                type="button"
                variant={captureMethod === 'manual' ? 'default' : 'outline'}
                onClick={() => setCaptureMethod('manual')}
                className={captureMethod === 'manual' ? 'gradient-primary text-white' : ''}
              >
                Manual Entry
              </Button>
              <Button
                type="button"
                variant={captureMethod === 'ai' ? 'default' : 'outline'}
                onClick={() => setCaptureMethod('ai')}
                className={captureMethod === 'ai' ? 'gradient-primary text-white' : ''}
              >
                AI Capture
              </Button>
            </div>

            {/* AI Media Capture Section */}
            {captureMethod === 'ai' && (
            <Card className="glass-card hover-glow">
              <CardHeader>
                <CardTitle className="flex items-center text-gradient">
                  <Sparkles className="h-5 w-5 mr-2" />
                  AI-Powered Media Capture
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!selectedFile ? (
                  <div className="space-y-4">
                    <div className="flex justify-center space-x-4 mb-6">
                      <Button
                        type="button"
                        variant={recordingType === 'audio' ? 'default' : 'outline'}
                        onClick={() => setRecordingType('audio')}
                        className={recordingType === 'audio' ? 'gradient-primary text-white' : ''}
                      >
                        <Mic className="h-4 w-4 mr-2" />
                        Audio Only
                      </Button>
                      <Button
                        type="button"
                        variant={recordingType === 'video' ? 'default' : 'outline'}
                        onClick={() => setRecordingType('video')}
                        className={recordingType === 'video' ? 'gradient-primary text-white' : ''}
                      >
                        <Video className="h-4 w-4 mr-2" />
                        Audio + Video
                      </Button>
                    </div>

                    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center glass-effect">
                      <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 animated-gradient rounded-lg flex items-center justify-center">
                          {recordingType === 'video' ? (
                            <Video className="h-8 w-8 text-white" />
                          ) : (
                            <Mic className="h-8 w-8 text-white" />
                          )}
                        </div>
                      </div>
                      <p className="text-muted-foreground mb-6">
                        Record yourself talking about your Snacks experience. 
                        Mention what you're eating, where you are, who you're with, and how it tastes!
                      </p>
                      {!isRecording ? (
                        <Button
                          type="button"
                          onClick={startRecording}
                          className="animated-gradient hover-glow text-white"
                        >
                          <Zap className="h-4 w-4 mr-2" />
                          Start {recordingType === 'video' ? 'Video' : 'Audio'} Recording
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          onClick={stopRecording}
                          variant="destructive"
                          className="hover-glow"
                        >
                          <Mic className="h-4 w-4 mr-2" />
                          Stop Recording
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg glass-effect">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                          {recordingType === 'video' ? (
                            <Video className="h-5 w-5 text-white" />
                          ) : (
                            <Mic className="h-5 w-5 text-white" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-green-800">{selectedFile.name}</p>
                          <p className="text-sm text-green-600">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                          setSelectedFile(null);
                          setAiAnalysis(null);
                        }}
                        className="text-green-600 hover:text-green-700"
                      >
                        Remove
                      </Button>
                    </div>

                    {isAnalyzing && (
                      <div className="text-center py-6 space-y-2">
                        <div className="inline-flex items-center space-x-2 text-primary">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                          <span>AI is analyzing your snack experience...</span>
                        </div>
                        <Progress value={analysisProgress} className="h-2 w-full" />
                        <p className="text-sm text-muted-foreground">{Math.round(analysisProgress)}%</p>
                      </div>
                    )}

                    {aiAnalysis && (
                      <div className="glass-effect rounded-lg p-4">
                        <h4 className="font-semibold text-primary mb-3">Azure AI Analysis Results</h4>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          {aiAnalysis.detectedProducts && (
                            <div>
                              <span className="text-primary font-medium">Snacks:</span>
                              <span className="ml-2 text-foreground">{aiAnalysis.detectedProducts.join(', ')}</span>
                            </div>
                          )}
                          {aiAnalysis.confidence && (
                            <div>
                              <span className="text-primary font-medium">Confidence:</span>
                              <span className="ml-2 text-foreground">{Math.round(aiAnalysis.confidence * 100)}%</span>
                            </div>
                          )}
                          {aiAnalysis.sentiment && (
                            <div>
                              <span className="text-primary font-medium">Mood:</span>
                              <span className="ml-2 text-foreground">{aiAnalysis.sentiment}</span>
                            </div>
                          )}
                          {aiAnalysis.estimatedSpend && (
                            <div>
                              <span className="text-primary font-medium">Est. Spend:</span>
                              <span className="ml-2 text-foreground">₦{aiAnalysis.estimatedSpend?.replace('$', '')}</span>
                            </div>
                          )}
                        </div>
                        {aiAnalysis.transcription && (
                          <div className="mt-3">
                            <span className="text-primary font-medium text-sm">What you said:</span>
                            <p className="text-foreground text-sm mt-1">{aiAnalysis.transcription}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Submit Button - Only shown after AI analysis */}
                    <Button
                      type="submit"
                      className="w-full gradient-primary hover-glow text-white shadow-lg"
                      disabled={isSubmitting || isAnalyzing || !aiAnalysis}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Uploading & Saving...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Submit my experience👍
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
            )}

            {/* Manual Entry Section */}
            {captureMethod === 'manual' && (
            <Card className="glass-card hover-glow">
              <CardHeader>
                <CardTitle className="flex items-center text-gradient">
                  <Sparkles className="h-5 w-5 mr-2" />
                  Meal Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="product">Product Name</Label>
                  <Input
                    id="product"
                    value={formData.product}
                    onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                    className="glass-effect"
                  />
                </div>
                <div>
                  <Label htmlFor="brand">Brand</Label>
                  <Input
                    id="brand"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="glass-effect"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger id="category" className="glass-effect">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="spend">Amount Spent</Label>
                  <Input
                    id="spend"
                    value={formData.spend}
                    onChange={(e) => setFormData({ ...formData, spend: e.target.value })}
                    className="glass-effect"
                  />
                </div>
                <div>
                  <Label htmlFor="companions">Companion(s)</Label>
                  <Select
                    value={formData.companions}
                    onValueChange={(value) => setFormData({ ...formData, companions: value })}
                  >
                    <SelectTrigger id="companions" className="glass-effect">
                      <SelectValue placeholder="Who were you with?" />
                    </SelectTrigger>
                    <SelectContent>
                      {companionOptions.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="glass-effect"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full gradient-primary hover-glow text-white shadow-lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Submit my experience👍
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default LogConsumption;
