"use client";

import { useState } from "react";

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [status, setStatus] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setStatus("success");
        setFormData({ name: "", email: "", message: "" });
      } else {
        setStatus("error");
      }
    } catch (err) {
      console.error(err);
      setStatus("error");
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
                <input type="text" name="phone" placeholder="Phone" />
            </div>
            <div className="col-lg-6 col-md-6 col-sm-12 form-group">
                <input type="text" name="subject" placeholder="Subject" />
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
            >
                <span>Send Message</span>
            </button>
            </div>
        </div>

      {status === "loading" && <p className="text-gray-600">Sending...</p>}
      {status === "success" && <p className="text-green-600">Message sent successfully ✅</p>}
      {status === "error" && <p className="text-red-600">Something went wrong ❌</p>}
    </form>
  );
}
