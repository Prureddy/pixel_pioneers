import { useEffect } from "react";

export const Chatbox = () => {
  useEffect(() => {
    if (document.getElementById("chatbase-script")) return;

    const script = document.createElement("script");
    script.id = "chatbase-script";
    script.src = "https://www.chatbase.co/embed.min.js";
    script.async = true;
    script.dataset.id = "6qJi4KpsuUDkXM45FHh4u"; // Your bot ID
    script.dataset.secret = "niwge1xmqgxt8kgac3hg7j3haiktr744"; // Your secret
    script.onload = () => {
      console.log("Chatbase loaded successfully");
    };
    script.onerror = () => {
      console.error("Failed to load Chatbase script. Check your ID and network.");
    };

    document.body.appendChild(script);
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div id="chatbase-widget" />
    </div>
  );
};
