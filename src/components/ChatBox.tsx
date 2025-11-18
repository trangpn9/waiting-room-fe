import { FormEvent, useEffect, useState } from "react";
import { createPusherClient } from "../hooks/usePusher";
import { useDoctorChat, usePatientChat } from "../hooks/usePatient";

type ChatBoxProps = {
    patientId: string;
    role: "doctor" | "patient";
};

type ChatMessage = {
    patientId: string;
    senderType: "doctor" | "patient";
    message: string;
};

export default function ChatBox({ patientId, role }: ChatBoxProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");

    const doctorChatMutation = useDoctorChat();
    const patientChatMutation = usePatientChat();

    useEffect(() => {
        const pusher = createPusherClient();
        const channelName = `private-chat.${patientId}`;
        const channel = pusher.subscribe(channelName);

        channel.bind("chat-message", (data: ChatMessage) => {
            setMessages((prev) => [...prev, data]);
        });

        return () => {
            pusher.unsubscribe(channelName);
            pusher.disconnect();
        };
    }, [patientId]);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        const trimmed = input.trim();
        if (!trimmed) return;

        const payload = { patientId, message: trimmed };

        if (role === "doctor") {
            doctorChatMutation.mutate(payload);
        } else {
            patientChatMutation.mutate(payload);
        }

        // Optimistic update
        setMessages((prev) => [
            ...prev,
            { patientId, senderType: role, message: trimmed },
        ]);
        setInput("");
    };

    return (
        <div className="card">
            <div className="card-body" style={{ maxHeight: 200, overflowY: "auto" }}>
                {messages.length === 0 && (
                    <p className="text-muted mb-2">Chưa có tin nhắn nào.</p>
                )}
                {messages.map((m, idx) => (
                    <div
                        key={idx}
                        className={
                            "mb-1 " +
                            (m.senderType === role ? "text-end" : "text-start")
                        }
                    >
                        <span className="badge text-bg-light">
                            {m.senderType === "doctor" ? "Bác sĩ" : "Bệnh nhân"}:{" "}
                            {m.message}
                        </span>
                    </div>
                ))}
            </div>
            <form onSubmit={handleSubmit} className="card-footer d-flex gap-2">
                <input
                    className="form-control"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Nhập tin nhắn..."
                />
                <button className="btn btn-primary" type="submit">
                    Gửi
                </button>
            </form>
        </div>
    );
}
