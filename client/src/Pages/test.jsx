import React from "react";
import axios from "axios";

function test() {
  const handle = async () => {
    const formData = new FormData();
    formData.append(
      "attachment",
      "C:/Users/Wimukthi/Documents/GitHub/system-development/client/src/assets/allermine.png"
    );
    formData.append("pramodpinimal@gmail.com");
    formData.append("Test");
    formData.append("This is a test email");

    const response = axios.post(
      "http://localhost:3001/api/mail/send",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
  };

  return (
    <div>
      <button onClick={handle}>ok</button>
    </div>
  );
}

export default test;
