"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Mic, User, Square } from "lucide-react";

type Message = {
	id: number;
	text: string;
	sender: "user" | "bot";
};

export default function ChatInterface() {
	const [messages, setMessages] = useState<Message[]>([]);
	const [input, setInput] = useState("");
	const [isRecording, setIsRecording] = useState(false);
	const [recordingTime, setRecordingTime] = useState(0);
	const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
	const mediaRecorderRef = useRef<MediaRecorder | null>(null);
	const audioChunksRef = useRef<Blob[]>([]);
	const timerRef = useRef<NodeJS.Timeout | null>(null);
	const hasLoadedRef = useRef(false);

	// Load saved messages from localStorage on mount
	useEffect(() => {
		if (!hasLoadedRef.current) {
			const saved = localStorage.getItem("chatMessages");
			if (saved && saved !== "[]") {
				setMessages(JSON.parse(saved));
			} else {
				setMessages([
					{
						id: 1,
						text: "Hello! How can I help you today?",
						sender: "bot",
					},
				]);
			}
			hasLoadedRef.current = true;
		}
	}, []);

	// Save messages to localStorage every time they change
	useEffect(() => {
		localStorage.setItem("chatMessages", JSON.stringify(messages));
	}, [messages]);

	const handleSendMessage = () => {
		if (input.trim()) {
			const newMessage: Message = {
				id: messages.length + 1,
				text: input,
				sender: "user",
			};
			setMessages([...messages, newMessage]);
			setInput("");
			setIsWaitingForResponse(true);
			// Simulate bot response
			setTimeout(() => {
				const botResponse: Message = {
					id: messages.length + 2, // ensure a unique id
					text: "Thanks for your message! This is a simulated response.",
					sender: "bot",
				};
				setMessages((prevMessages) => [...prevMessages, botResponse]);
				setIsWaitingForResponse(false);
			}, 1000);
		}
	};

	const startRecording = async () => {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({
				audio: true,
			});

			const mediaRecorder = new MediaRecorder(stream);
			mediaRecorderRef.current = mediaRecorder;
			audioChunksRef.current = [];

			mediaRecorder.ondataavailable = (event) => {
				if (event.data.size > 0) {
					audioChunksRef.current.push(event.data);
				}
			};

			mediaRecorder.onstop = () => {
				const audioBlob = new Blob(audioChunksRef.current, {
					type: "audio/wav",
				});
				// Directly send the audio blob to the backend
				sendAudioToBackend(audioBlob);
				stream.getTracks().forEach((track) => track.stop());
			};

			mediaRecorder.start();
			setIsRecording(true);

			let seconds = 0;
			timerRef.current = setInterval(() => {
				seconds++;
				setRecordingTime(seconds);
			}, 1000);
		} catch (error) {
			console.error("Error accessing microphone:", error);
			alert(
				"Could not access microphone. Please check your permissions.",
			);
		}
	};

	const stopRecording = () => {
		if (mediaRecorderRef.current && isRecording) {
			mediaRecorderRef.current.stop();
			setIsRecording(false);
			if (timerRef.current) {
				clearInterval(timerRef.current);
				timerRef.current = null;
				setRecordingTime(0);
			}
		}
	};

	const sendAudioToBackend = (audioBlob: Blob) => {
		const filename = `recording-${new Date().toISOString()}.wav`;
		const formData = new FormData();
		formData.append("audio", audioBlob, filename);

		setIsWaitingForResponse(true);

		fetch("http://localhost:5000/transcribe", {
			method: "POST",
			body: formData,
		})
			.then((response) => {
				if (!response.ok) {
					throw new Error("Network response was not ok");
				}
				return response.json();
			})
			.then((data) => {
				const responseMessage =
					data.transcription || "Audio file uploaded successfully.";
				setMessages((prev) => [
					...prev,
					{
						id: prev.length + 1,
						text: responseMessage,
						sender: "user",
					},
				]);
				setIsWaitingForResponse(false);
			})
			.catch((error) => {
				console.error("Error uploading audio file:", error);
				setMessages((prev) => [
					...prev,
					{
						id: prev.length + 1,
						text: "Error uploading audio file.",
						sender: "bot",
					},
				]);
				setIsWaitingForResponse(false);
			});
	};

	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
	};

	return (
		<Card className="h-full flex flex-col">
			<CardContent className="p-4 flex-grow flex flex-col">
				<div className="flex flex-col h-full">
					<div className="flex-1 overflow-y-auto mb-4 space-y-4">
						{messages.map((message) => (
							<div
								key={message.id}
								className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
							>
								{message.sender === "bot" && (
									<div className="flex items-center mr-2">
										<User className="h-5 w-5 text-gray-500" />
									</div>
								)}
								<div
									className={`max-w-[80%] rounded-lg p-3 ${message.sender === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
								>
									{message.text}
								</div>
							</div>
						))}
					</div>
					<div className="flex gap-2">
						<Input
							value={input}
							onChange={(e) => setInput(e.target.value)}
							placeholder={
								isRecording
									? `Recording... ${formatTime(recordingTime)}`
									: "Type your message..."
							}
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									handleSendMessage();
								}
							}}
							className="flex-1"
							disabled={isRecording || isWaitingForResponse}
						/>
						<Button
							size="icon"
							variant={isRecording ? "destructive" : "outline"}
							onClick={
								isRecording ? stopRecording : startRecording
							}
							className={`transition-all duration-300 ${isRecording ? "animate-pulse" : ""}`}
							disabled={isWaitingForResponse}
						>
							{isRecording ? (
								<Square className="h-4 w-4" />
							) : (
								<Mic className="h-4 w-4" />
							)}
						</Button>
						<Button
							size="icon"
							onClick={handleSendMessage}
							disabled={isRecording || isWaitingForResponse}
						>
							<Send className="h-4 w-4" />
						</Button>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
