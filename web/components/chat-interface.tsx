"use client";

import { useState, useRef, useEffect } from "react";
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
			const userMessage: Message = {
				id: messages.length + 1,
				text: input,
				sender: "user",
			};
			// Add the user message and clear the input
			setMessages((prev) => [...prev, userMessage]);
			const messageToSend = input;
			setInput("");
			setIsWaitingForResponse(true);

			const a = {
				"agent_title": "factory foreman",
				"agent_description": "As the Factory Manager, your job is to interpret and explain key factory metrics in plain language to the team.",
				"scenario_setting": "factory",
				"scenario": {
					"description": "A factory produces widgets with varying efficiency based on worker skill, machine condition, and raw material quality. The factory has been operating for 5 years and has recently experienced some changes in production patterns.",
					"metrics": {
						"production_rate": 120,
						"defect_rate": 8,
						"worker_productivity": 25
					},
					"targets": {
						"production_rate_target": 150
					},
					"modifiers": {}
				},
				"metrics_description": {
					"production_rate": "The production rate is the number of widgets produced per hour.",
					"defect_rate": "The defect rate is the percentage of defective widgets produced.",
					"worker_productivity": "Worker productivity is the average number of widgets produced per worker per hour."
				},
				"target_description": {
					"production_rate_target": "The production rate target is the desired number of widgets to be produced per hour."
				},
				"question": "What is the current production rate and target?"
			}

			// Send the user message to the backend
			fetch("http://192.168.74.18:5000/discover", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ ...a, question: messageToSend }),
			})
				.then((response) => {
					if (!response.ok) {
						throw new Error("Network response was not ok");
					}
					return response.json();
				})
				.then((data) => {
					console.log(data)
					const botResponseText = data.response || "No response from backend";
					const botResponse: Message = {
						id: messages.length + 2, // ensure a unique id
						text: botResponseText,
						sender: "bot",
					};
					setMessages((prevMessages) => [...prevMessages, botResponse]);
					setIsWaitingForResponse(false);
				})
				.catch((error) => {
					console.error("Error sending message:", error);
					const errorResponse: Message = {
						id: messages.length + 2, // ensure a unique id
						text: "Error communicating with the server.",
						sender: "bot",
					};
					setMessages((prevMessages) => [...prevMessages, errorResponse]);
					setIsWaitingForResponse(false);
				});
		}
	};

	const startRecording = async () => {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
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
			alert("Could not access microphone. Please check your permissions.");
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

		fetch("http://192.168.74.18:5000/transcribe-discover", {
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
				console.log(data)
				const responseMessage =
					data.transcription || "Audio file uploaded successfully.";
				setMessages((prev) => [
					...prev,
					{
						id: prev.length + 1,
						text: responseMessage,
						sender: "user",
					},
					{
						id: prev.length + 2,
						text: data.response,
						sender: "bot",
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
		return `${mins.toString().padStart(2, "0")}:${secs
			.toString()
			.padStart(2, "0")}`;
	};

	return (
		<div className="">
			<div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md overflow-hidden mb-6">
				{/* Gradient Header */}
				<div className="bg-gradient-to-r from-indigo-600 to-purple-600 py-3 px-4 flex items-center justify-between">
					<h2 className="text-white font-bold text-lg">Chat Interface</h2>
					{isWaitingForResponse && (
						<span className="text-sm text-white animate-pulse">
              Waiting for response...
            </span>
					)}
				</div>

				{/* Chat Body */}
				<div className="p-4 h-[600px] flex flex-col">
					{/* Messages */}
					<div className="flex-1 overflow-y-auto mb-4 space-y-4">
						{messages.map((message) => {
							const isUser = message.sender === "user";
							return (
								<div
									key={message.id}
									className={`flex ${
										isUser ? "justify-end" : "justify-start"
									}`}
								>
									{!isUser && (
										<div className="flex items-center mr-2">
											<User className="h-5 w-5 text-gray-500" />
										</div>
									)}
									<div
										className={`max-w-[80%] rounded-lg p-3 
                      ${
											isUser
												? "bg-emerald-50 text-emerald-800"
												: "bg-purple-50 text-purple-800"
										}`}
									>
										{message.text}
									</div>
								</div>
							);
						})}
					</div>

					{/* Input & Controls */}
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

						{/* Mic Button */}
						<Button
							size="icon"
							variant={isRecording ? "destructive" : "outline"}
							onClick={isRecording ? stopRecording : startRecording}
							className={`transition-all duration-300 ${
								isRecording ? "animate-pulse" : ""
							}`}
							disabled={isWaitingForResponse}
						>
							{isRecording ? (
								<Square className="h-4 w-4" />
							) : (
								<Mic className="h-4 w-4" />
							)}
						</Button>

						{/* Send Button */}
						<Button
							size="icon"
							onClick={handleSendMessage}
							disabled={isRecording || isWaitingForResponse}
						>
							<Send className="h-4 w-4" />
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
