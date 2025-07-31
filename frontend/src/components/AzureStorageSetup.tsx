
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { initializeAzureStorage } from "@/lib/azure-storage";
import { Save, ExternalLink } from "lucide-react";

interface AzureStorageSetupProps {
  onConfigured: () => void;
}

const AzureStorageSetup = ({ onConfigured }: AzureStorageSetupProps) => {
  const [config, setConfig] = useState({
    accountName: "",
    containerName: "naijasnack-media",
    sasToken: ""
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = () => {
    if (!config.accountName || !config.sasToken) {
      toast({
        title: "Missing Configuration",
        description: "Please provide both Account Name and SAS Token.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      initializeAzureStorage(config);
      
      // Store config in localStorage for persistence
      localStorage.setItem('azureStorageConfig', JSON.stringify(config));
      
      toast({
        title: "Azure Storage Configured! 🎉",
        description: "Your media files will now be stored in Azure Blob Storage.",
      });
      
      onConfigured();
    } catch (error) {
      toast({
        title: "Configuration Failed",
        description: "Please check your Azure Storage credentials.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="glass-card hover-glow max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-gradient flex items-center">
          <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center mr-3">
            <Save className="h-4 w-4 text-white" />
          </div>
          Azure Storage Setup
        </CardTitle>
        <p className="text-muted-foreground">
          Configure Azure Blob Storage to securely store your media files (audio, video, images).
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 mb-2">Setup Instructions:</h4>
          <ol className="list-decimal list-inside space-y-1 text-sm text-blue-700">
            <li>Create an Azure Storage Account</li>
            <li>Create a container named "naijasnack-media" (or your preferred name)</li>
            <li>Generate a SAS token with read/write permissions</li>
            <li>Enter your credentials below</li>
          </ol>
          <Button
            variant="outline"
            size="sm"
            className="mt-3 border-blue-300 text-blue-600"
            onClick={() => window.open('https://portal.azure.com/#create/Microsoft.StorageAccount', '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Open Azure Portal
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <Label htmlFor="accountName">Storage Account Name *</Label>
            <Input
              id="accountName"
              value={config.accountName}
              onChange={(e) => setConfig({ ...config, accountName: e.target.value })}
              placeholder="mystorageaccount"
              className="border-blue-200 focus:border-blue-400 glass-effect"
            />
            <p className="text-xs text-gray-500 mt-1">
              The name of your Azure Storage Account (without .blob.core.windows.net)
            </p>
          </div>

          <div>
            <Label htmlFor="containerName">Container Name</Label>
            <Input
              id="containerName"
              value={config.containerName}
              onChange={(e) => setConfig({ ...config, containerName: e.target.value })}
              placeholder="naijasnack-media"
              className="border-blue-200 focus:border-blue-400 glass-effect"
            />
            <p className="text-xs text-gray-500 mt-1">
              The container where your media files will be stored
            </p>
          </div>

          <div>
            <Label htmlFor="sasToken">SAS Token *</Label>
            <Input
              id="sasToken"
              type="password"
              value={config.sasToken}
              onChange={(e) => setConfig({ ...config, sasToken: e.target.value })}
              placeholder="?sv=2022-11-02&ss=b&srt=sco&sp=rwdlac&se=..."
              className="border-blue-200 focus:border-blue-400 glass-effect"
            />
            <p className="text-xs text-gray-500 mt-1">
              SAS token with read/write permissions (should start with "?")
            </p>
          </div>
        </div>

        <Button
          onClick={handleSave}
          disabled={isLoading}
          className="w-full gradient-primary hover-glow text-white"
        >
          {isLoading ? "Configuring..." : "Save Configuration"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default AzureStorageSetup;
