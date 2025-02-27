"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Mail, Phone, MapPin, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { z } from "zod";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(20, "Message must be at least 20 characters"),
});

export default function ContactPage() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.user_metadata?.full_name || "",
    email: user?.email || "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = (field: keyof typeof formData, value: string) => {
    try {
      contactSchema.shape[field].parse(value);
      setErrors(prev => ({ ...prev, [field]: "" }));
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors(prev => ({ ...prev, [field]: error.errors[0].message }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      contactSchema.parse(formData);
      setIsSubmitting(true);

      const { error } = await supabase
        .from('contact_messages')
        .insert({
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
          user_id: user?.id || null,
        });

      if (error) throw error;

      toast.success("Message sent successfully! We'll get back to you soon.", {
        description: "Thank you for contacting us. We typically respond within 24 hours.",
      });
      
      // Only clear subject and message if successful
      setFormData(prev => ({
        ...prev,
        subject: "",
        message: "",
      }));
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
        toast.error("Please fix the errors in the form", {
          description: "Some fields need your attention before submitting.",
        });
      } else {
        console.error('Error submitting contact form:', error);
        toast.error("Failed to send message", {
          description: error.message || "Please try again later.",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      title: "Email",
      content: "support@resumecoach.com",
      description: "Send us an email anytime!",
      action: "mailto:support@resumecoach.com",
    },
    {
      icon: Phone,
      title: "Phone",
      content: "+1 (555) 123-4567",
      description: "Mon-Fri from 9am to 5pm EST",
      action: "tel:+15551234567",
    },
    {
      icon: MapPin,
      title: "Office",
      content: "123 Resume Street",
      description: "New York, NY 10001",
      action: "https://maps.google.com/?q=123+Resume+Street+New+York+NY+10001",
    },
  ];

  return (
    <div className="container max-w-6xl mx-auto px-4 py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 mb-4 border border-primary/20">
          <Mail className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-primary">Contact Us</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70 mb-4">
          Get in Touch
        </h1>
        <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
          Have questions about ResumeCoach? We're here to help! Fill out the form
          below and we'll get back to you as soon as possible.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-8 mb-12">
        {contactInfo.map((info, index) => (
          <motion.a
            href={info.action}
            target={info.icon === MapPin ? "_blank" : undefined}
            rel={info.icon === MapPin ? "noopener noreferrer" : undefined}
            key={info.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="group relative block"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg blur" />
            <div className="relative p-6 rounded-lg border bg-card text-card-foreground shadow-sm transition-transform duration-300 group-hover:scale-[1.02] group-hover:shadow-lg group-hover:shadow-primary/5">
              <div className="mb-4 p-3 rounded-full bg-primary/10 w-fit group-hover:bg-primary/20 transition-colors">
                <info.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{info.title}</h3>
              <p className="font-medium text-foreground/90">{info.content}</p>
              <p className="text-sm text-muted-foreground mt-1">{info.description}</p>
            </div>
          </motion.a>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="max-w-2xl mx-auto relative"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent opacity-20 rounded-lg blur-xl" />
        <div className="relative rounded-lg border bg-card/50 backdrop-blur-sm p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
                  Name
                  {errors.name && (
                    <span className="text-destructive text-xs flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.name}
                    </span>
                  )}
                </label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData(prev => ({ ...prev, name: value }));
                    validateField("name", value);
                  }}
                  placeholder="Your name"
                  className={`h-11 transition-colors ${errors.name ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                  disabled={isSubmitting}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                  Email
                  {errors.email && (
                    <span className="text-destructive text-xs flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.email}
                    </span>
                  )}
                </label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData(prev => ({ ...prev, email: value }));
                    validateField("email", value);
                  }}
                  placeholder="your@email.com"
                  className={`h-11 transition-colors ${errors.email ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="subject" className="text-sm font-medium flex items-center gap-2">
                Subject
                {errors.subject && (
                  <span className="text-destructive text-xs flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.subject}
                  </span>
                )}
              </label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData(prev => ({ ...prev, subject: value }));
                  validateField("subject", value);
                }}
                placeholder="What's this about?"
                className={`h-11 transition-colors ${errors.subject ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                disabled={isSubmitting}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="message" className="text-sm font-medium flex items-center gap-2">
                Message
                {errors.message && (
                  <span className="text-destructive text-xs flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.message}
                  </span>
                )}
              </label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData(prev => ({ ...prev, message: value }));
                  validateField("message", value);
                }}
                placeholder="Your message..."
                className={`min-h-[150px] transition-colors ${errors.message ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                disabled={isSubmitting}
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full h-11 text-base font-medium relative group"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending message...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  Send Message
                </>
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity rounded-md" />
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
} 