"use client";

import { useState } from "react";

interface ContactFormProps {
  defaultSubject?: string;
}

export default function ContactForm({ defaultSubject }: ContactFormProps = {}) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [status, setStatus] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMessage(""); // Clear error when user types
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const payload = {
        ...formData,
        subject: formData.subject.trim() || defaultSubject || "",
      };

      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      let data: { success?: boolean; message?: string } = {};
      try {
        data = await res.json();
      } catch {
        data = {};
      }

      if (res.ok && data.success) {
        setStatus("success");
        setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
      } else {
        setStatus("error");
        setErrorMessage(data.message || "Something went wrong. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setStatus("error");
      setErrorMessage("Failed to send message. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="default-form">
        <div className="row clearfix">
            <div className="col-lg-6 col-md-6 col-sm-12 form-group">
                <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Your Name"
                />
            </div>
            <div className="col-lg-6 col-md-6 col-sm-12 form-group">
                <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="Your Email"
                />
            </div>
            <div className="col-lg-6 col-md-6 col-sm-12 form-group">
                <input 
                  type="text" 
                  name="phone" 
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Phone" 
                />
            </div>
            <div className="col-lg-6 col-md-6 col-sm-12 form-group">
                <input 
                  type="text" 
                  name="subject" 
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Subject" 
                />
            </div>
            <div className="col-lg-12 col-md-12 col-sm-12 form-group">
                <textarea
                name="message"
                required
                rows={4}
                value={formData.message}
                onChange={handleChange}
                placeholder="Type Comment Here..."
                />
            </div>
            <div className="col-lg-12 col-md-12 col-sm-12 form-group message-btn">
                <button
                type="submit"
                className="theme-btn btn-two"
                disabled={status === "loading"}
            >
                <span>{status === "loading" ? "Sending..." : "Send Message"}</span>
            </button>
            </div>
        </div>

      {status === "success" && (
        <p className="contact-form-feedback success">Message sent successfully!</p>
      )}
      {status === "error" && (
        <p className="contact-form-feedback error">
          {errorMessage || "Something went wrong. Please try again."}
        </p>
      )}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .contact-form-feedback {
          margin-top: 12px;
          margin-bottom: 0;
          font-size: 14px;
        }
        .contact-form-feedback.success {
          color: #1e8e3e;
        }
        .contact-form-feedback.error {
          color: #d93025;
        }
      `,
        }}
      />
    </form>
  );
}
