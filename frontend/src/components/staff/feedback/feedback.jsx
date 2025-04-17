import { useState } from "react";

const FeedbackSystem = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [feedbackName, setFeedbackName] = useState("");
  const [recipient, setRecipient] = useState("");
  const [messages, setMessages] = useState([]);

  // Hàm thêm phản hồi mới
  const handleAddFeedback = () => {
    if (!feedbackName || !recipient) {
      alert("Vui lòng nhập tên phản hồi và chọn người nhận!");
      return;
    }
    const newFeedback = {
      id: Date.now(),
      name: feedbackName,
      recipient,
      chats: [],
    };
    setFeedbacks([...feedbacks, newFeedback]);
    setFeedbackName("");
    setRecipient("");
  };

  // Hàm chọn phản hồi
  const handleSelectFeedback = (feedback) => {
    setSelectedFeedback(feedback);
    setMessages(feedback.chats);
  };

  // Hàm gửi tin nhắn trong đoạn chat
  const handleSendMessage = (message) => {
    const updatedFeedbacks = feedbacks.map((fb) =>
      fb.id === selectedFeedback.id
        ? {
            ...fb,
            chats: [...fb.chats, message],
          }
        : fb
    );
    setFeedbacks(updatedFeedbacks);
    setMessages([...messages, message]);
  };

  return (
    <div className="p-4">
      {/* Nhập thông tin phản hồi */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Tên phản hồi"
          value={feedbackName}
          onChange={(e) => setFeedbackName(e.target.value)}
          className="border p-2 rounded mr-4"
        />
        <select
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">Chọn người nhận</option>
          <option value="Nguyễn">Nguyễn</option>
          <option value="Trần">Trần</option>
          <option value="Lê">Lê</option>
        </select>
        <button
          onClick={handleAddFeedback}
          className="bg-blue-500 text-white px-4 py-2 rounded ml-4"
        >
          Thêm phản hồi
        </button>
      </div>

      {/* Danh sách phản hồi */}
      <div className="border border-gray-300 p-4 rounded">
        {feedbacks.map((feedback) => (
          <div key={feedback.id} className="mb-2">
            <button
              className="text-left w-full bg-gray-100 p-2 rounded hover:bg-gray-200"
              onClick={() =>
                setSelectedFeedback(
                  selectedFeedback?.id === feedback.id ? null : feedback
                )
              }
            >
              {feedback.name} - Người nhận: {feedback.recipient}
            </button>
            {selectedFeedback?.id === feedback.id && (
              <div className="bg-white p-4 border mt-2 rounded shadow-sm">
                {/* Hiển thị các đoạn chat */}
                <ul>
                  {feedback.chats.map((msg, index) => (
                    <li key={index}>{msg}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Hiển thị đoạn chat */}
      {selectedFeedback && (
        <div className="border border-gray-300 p-4 rounded">
          <h2 className="text-xl font-bold">
            Đoạn chat: {selectedFeedback.name}
          </h2>
          <ul className="mb-4">
            {messages.map((msg, index) => (
              <li key={index} className="p-2 border-b">
                {msg}
              </li>
            ))}
          </ul>
          <textarea
            rows="4"
            className="border p-2 rounded w-full mb-2"
            placeholder="Nhập tin nhắn"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e.target.value);
                e.target.value = ""; // Reset input
              }
            }}
          ></textarea>
        </div>
      )}
    </div>
  );
};

export default FeedbackSystem;
