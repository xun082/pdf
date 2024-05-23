import MarkdownEditor from "@/pages/home";
import ChatBox from "@/pages/chat";
import ChatDoc from "@/pages/pdf";

export default function Home() {
  return (
    <div
      style={{
        display: "flex",
      }}
    >
      <ChatDoc />
      <ChatBox></ChatBox>
    </div>
  );
}
