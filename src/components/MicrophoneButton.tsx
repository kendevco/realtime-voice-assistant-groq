import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from "@/components/ui/textarea";

interface MicrophoneButtonProps {
  onTranscript: (transcript: string) => void;
  onStateChange: (isRecording: boolean, isTranscribing: boolean) => void;
  instructions: string;
  isDisabled: boolean;
}

export default function MicrophoneButton({ onTranscript, onStateChange, instructions, isDisabled }: MicrophoneButtonProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const { toast } = useToast();

  const startRecording = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsRecording(true);
    onStateChange(true, false);
    onTranscript(''); // Clear instructions when recording starts
    toast({ title: "Recording started", duration: 2000 });
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        mediaRecorder.start();

        const audioChunks: BlobPart[] = [];
        mediaRecorder.addEventListener("dataavailable", event => {
          audioChunks.push(event.data);
        });

        mediaRecorder.addEventListener("stop", () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
          sendAudioToWhisper(audioBlob);
        });
      })
      .catch(error => {
        console.error("Error accessing the microphone:", error);
        toast({
          title: "Error",
          description: "Unable to access the microphone. Please make sure you've granted the necessary permissions.",
          variant: "destructive",
        });
        setIsRecording(false);
        onStateChange(false, false);
      });
  };

  const stopRecording = (e: React.MouseEvent) => {
    e.preventDefault();
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsTranscribing(true);
      onStateChange(false, true);
      toast({ title: "Recording stopped", duration: 2000 });
    }
  };

  const sendAudioToWhisper = async (audioBlob: Blob) => {
    const formData = new FormData();
    formData.append('file', audioBlob, 'recording.wav');

    try {
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        throw new Error('Transcription failed');
      }
      const result = await response.json();
      onTranscript(result.transcription);
      toast({
        title: "Success",
        description: "Audio transcribed successfully.",
      });
    } catch (error) {
      console.error('Error during transcription:', error);
      toast({
        title: "Error",
        description: "An error occurred during transcription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsTranscribing(false);
      onStateChange(false, false);
    }
  };

  return (
    <div className="flex flex-col w-full gap-2">
      <Textarea
        value={instructions}
        onChange={(e) => onTranscript(e.target.value)}
        placeholder="Enter instructions or use voice input"
        className="flex-grow"
        rows={3}
        disabled={isDisabled || isRecording || isTranscribing}
      />
      <Button
        onClick={isRecording ? stopRecording : startRecording}
        className={`ml-2 ${isRecording ? 'bg-red-500 text-white font-bold py-3 px-6 text-lg' : isTranscribing ? 'bg-yellow-500' : 'bg-blue-500'}`}
        disabled={isDisabled && !isRecording} // Only disable if isDisabled is true and not recording
      >
        {isRecording ? (
          <>
            <MicOff className="mr-2 h-6 w-6" />
            Stop Recording
          </>
        ) : isTranscribing ? (
          <>
            <Loader2 className="mr-2 animate-spin h-5 w-5" />
            Transcribing...
          </>
        ) : (
          <>
            <Mic className="mr-2 h-5 w-5" />
            Start Recording
          </>
        )}
      </Button>
    </div>
  );
}