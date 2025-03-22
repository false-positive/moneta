"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Mic, User, Square, MessageSquare } from "lucide-react";

type Message = {
	id: number;
	text: string;
	sender: "user" | "bot";
};

export default function ChatInterface({
	handleDiscovery,
	scenarioConfig,
}: any) {
	const [messages, setMessages] = useState<Message[]>([]);
	const [input, setInput] = useState("");
	const [isRecording, setIsRecording] = useState(false);
	const [recordingTime, setRecordingTime] = useState(0);
	const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
	const mediaRecorderRef = useRef<MediaRecorder | null>(null);
	const audioChunksRef = useRef<Blob[]>([]);
	const timerRef = useRef<NodeJS.Timeout | null>(null);
	const hasLoadedRef = useRef(false);
	const messagesEndRef = useRef<HTMLDivElement>(null);

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
						text: "Hi, I need some help with my finances. Could you help me?",
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

	// Scroll to bottom when messages change
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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

			const showNewDiscoveries = (discoveries: string[]) => {
				if (discoveries.includes("bank_account")) {
					handleDiscovery(
						`Your target bank account balance is ${scenarioConfig.scenario.targets.bank_account_target} BGN`,
						1
					);
				}
				if (discoveries.includes("joy")) {
					handleDiscovery(
						`Your target joy level is ${scenarioConfig.scenario.targets.joy_target}%`,
						2
					);
				}
				if (discoveries.includes("free_time")) {
					handleDiscovery(
						`You want to have at least ${scenarioConfig.scenario.targets.free_time_target} hours of free time per week`,
						3
					);
				}
			};

			// Send the user message to the backend
			fetch(`${process.env.NEXT_PUBLIC_API_URL}/discover`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					...scenarioConfig,
					question: messageToSend,
				}),
			})
				.then((response) => {
					if (!response.ok) {
						throw new Error("Network response was not ok");
					}
					return response.json();
				})
				.then((data) => {
					console.log(data);
					if (data.discoveries) {
						showNewDiscoveries(data.discoveries);
					}

					const botResponseText =
						data.response || "No response from backend";
					const botResponse: Message = {
						id: messages.length + 2, // ensure a unique id
						text: botResponseText,
						sender: "bot",
					};
					setMessages((prevMessages) => [
						...prevMessages,
						botResponse,
					]);
					setIsWaitingForResponse(false);
				})
				.catch((error) => {
					console.error("Error sending message:", error);
					const errorResponse: Message = {
						id: messages.length + 2, // ensure a unique id
						text: "Error communicating with the server.",
						sender: "bot",
					};
					setMessages((prevMessages) => [
						...prevMessages,
						errorResponse,
					]);
					setIsWaitingForResponse(false);
				});
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
				"Could not access microphone. Please check your permissions."
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

		fetch(`${process.env.NEXT_PUBLIC_API_URL}/transcribe-discover`, {
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
				console.log(data);
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
		<div className="h-full flex items-center justify-center">
			<div className="w-full h-2/3 bg-white rounded-xl shadow-md overflow-hidden">
				<div className="bg-gradient-to-r from-indigo-600 to-purple-600 py-3 px-4 flex items-center justify-between">
					<h2 className="text-white font-bold flex items-center gap-2">
						<MessageSquare className="h-4 w-4" />
					</h2>
					{isWaitingForResponse && (
						<span className="text-sm text-white animate-pulse">
							Waiting for response...
						</span>
					)}
				</div>

				<div className="p-4 h-[490px] flex flex-col justify-between">
					<div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2">
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
										<div className="flex items-center justify-center mr-2 w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
											<User className="h-4 w-4" />
										</div>
									)}
									<div
										className={`max-w-[80%] rounded-lg p-2.5 text-sm
                    ${
						isUser
							? "bg-indigo-50 text-indigo-800 border border-indigo-100"
							: "bg-purple-50 text-purple-800 border border-purple-100"
					}`}
									>
										{message.text}
									</div>
									{isUser && (
										<div className="flex items-center justify-center ml-2 w-8 h-8 rounded-full bg-indigo-100 text-indigo-600">
											<User className="h-4 w-4" />
										</div>
									)}
								</div>
							);
						})}
						<div ref={messagesEndRef} />
					</div>

					{/* Input & Controls */}
					<div className="flex gap-2">
						<Input
							value={input}
							onChange={(e) => setInput(e.target.value)}
							placeholder={
								isRecording
									? `Recording... ${formatTime(
											recordingTime
									  )}`
									: "Chat to discover more information..."
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
							onClick={
								isRecording ? stopRecording : startRecording
							}
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

						<Button
							size="icon"
							onClick={handleSendMessage}
							disabled={
								isRecording ||
								isWaitingForResponse ||
								!input.trim()
							}
							className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90"
						>
							<Send className="h-4 w-4" />
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
