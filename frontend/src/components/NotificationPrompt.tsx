import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface NotificationPromptProps {
  open: boolean;
  onEnable: () => void | Promise<void>;
  onClose: () => void;
}

const NotificationPrompt = ({ open, onEnable, onClose }: NotificationPromptProps) => (
  <Dialog open={open} onOpenChange={onClose}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Enable Notifications</DialogTitle>
        <DialogDescription>
          Stay up to date with reminders and rewards by enabling notifications.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Maybe Later</Button>
        <Button onClick={onEnable}>Enable</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export default NotificationPrompt;
