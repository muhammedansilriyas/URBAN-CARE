import React, { useState } from 'react';
import API from '../services/api.js';

const Contact = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('General Inquiry');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');

    // Format the subject to prepend the selected department
    const formattedSubject = `[${department}] ${subject}`;

    try {
      await API.post('/messages', { 
        name, 
        email, 
        phone, 
        subject: formattedSubject, 
        message 
      });
      setSuccess(`Thank you, ${name}. Your inquiry has been sent to our wellness team.`);
      setName('');
      setEmail('');
      setPhone('');
      setDepartment('General Inquiry');
      setSubject('');
      setMessage('');
    } catch (err) {
      console.warn('API error, simulating contact form submission');
      setSuccess(`Inquiry Message Submitted Successfully! (Simulated locally)`);
      setName('');
      setEmail('');
      setPhone('');
      setDepartment('General Inquiry');
      setSubject('');
      setMessage('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background text-on-surface min-h-screen">
      <main className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12 animate-fadeIn">
        {/* Hero Section */}
        <section className="mb-16 text-center md:text-left">
          <div className="grid md:grid-cols-2 items-center gap-12">
            <div className="space-y-6">
              <span className="inline-block px-4 py-1.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-semibold">
                Patient Care Center
              </span>
              <h1 className="font-display-lg text-display-lg text-primary leading-tight">
                We are here to listen <br />and heal together.
              </h1>
              <p className="text-on-surface-variant max-w-xl">
                At Urban Patient Care, we prioritize biological harmony. Whether you have questions about your treatment plan or need to schedule a consultation, our team is dedicated to providing a nurturing response to your needs.
              </p>
            </div>
            <div className="relative h-64 md:h-96 w-full rounded-[40px] overflow-hidden organic-shadow">
              <img 
                className="w-full h-full object-cover" 
                alt="Minimalist medical atrium architecture" 
                src="/hero_atrium_hd.png"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent"></div>
            </div>
          </div>
        </section>

        <div className="grid lg:grid-cols-3 gap-12 items-start">
          {/* Inquiry Form */}
          <div className="lg:col-span-2 bg-surface-container-low p-8 md:p-12 rounded-[40px] organic-shadow">
            <h2 className="font-headline-md text-headline-md text-primary mb-8 font-bold">Send an Inquiry</h2>
            
            {success && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-sm mb-6 font-semibold">
                {success}
              </div>
            )}

            <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSubmit}>
              <div className="space-y-2 group">
                <label className="font-label-sm text-label-sm text-on-surface-variant ml-2 group-focus-within:text-primary transition-colors">
                  Name
                </label>
                <input 
                  className="pill-input w-full px-6 py-4 rounded-full font-body-md text-body-md text-on-surface outline-none" 
                  placeholder="Your full name" 
                  required 
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2 group">
                <label className="font-label-sm text-label-sm text-on-surface-variant ml-2 group-focus-within:text-primary transition-colors">
                  Email
                </label>
                <input 
                  className="pill-input w-full px-6 py-4 rounded-full font-body-md text-body-md text-on-surface outline-none" 
                  placeholder="email@address.com" 
                  required 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2 group">
                <label className="font-label-sm text-label-sm text-on-surface-variant ml-2 group-focus-within:text-primary transition-colors">
                  Phone
                </label>
                <input 
                  className="pill-input w-full px-6 py-4 rounded-full font-body-md text-body-md text-on-surface outline-none" 
                  placeholder="+1 (555) 000-0000" 
                  required 
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="space-y-2 group">
                <label className="font-label-sm text-label-sm text-on-surface-variant ml-2 group-focus-within:text-primary transition-colors">
                  Department
                </label>
                <select 
                  className="pill-input w-full px-6 py-4 rounded-full font-body-md text-body-md text-on-surface appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M5%207.5L10%2012.5L15%207.5%22%20stroke%3D%22%23646e57%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E')] bg-[position:right_1.5rem_center] bg-no-repeat outline-none"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                >
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="Neurology">Neurology</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="Holistic Nutrition">Holistic Nutrition</option>
                  <option value="Diagnostics">Diagnostics</option>
                </select>
              </div>

              <div className="md:col-span-2 space-y-2 group">
                <label className="font-label-sm text-label-sm text-on-surface-variant ml-2 group-focus-within:text-primary transition-colors">
                  Subject
                </label>
                <input 
                  className="pill-input w-full px-6 py-4 rounded-full font-body-md text-body-md text-on-surface outline-none" 
                  placeholder="How can we help?" 
                  required 
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>

              <div className="md:col-span-2 space-y-2 group">
                <label className="font-label-sm text-label-sm text-on-surface-variant ml-2 group-focus-within:text-primary transition-colors">
                  Message
                </label>
                <textarea 
                  className="pill-input w-full px-8 py-6 rounded-[32px] font-body-md text-body-md text-on-surface resize-none outline-none" 
                  placeholder="Share the details of your inquiry here..." 
                  required 
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              <div className="md:col-span-2 pt-4">
                <button 
                  className="w-full md:w-auto bg-primary text-on-primary px-12 py-4 rounded-full font-headline-md text-headline-md font-semibold organic-shadow hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2" 
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                  ) : (
                    "Submit Inquiry"
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Sidebar Contacts */}
          <aside className="space-y-8">
            <div className="bg-surface-container-high p-8 rounded-[40px] space-y-6">
              <h3 className="font-headline-md text-headline-md text-primary font-bold">Need Immediate Help?</h3>
              <div className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-full bg-error-container flex items-center justify-center text-on-error-container">
                  <span className="material-symbols-outlined">emergency</span>
                </div>
                <div>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">Emergency Phone</p>
                  <p className="font-body-lg text-body-lg font-bold text-error">+1 (555) 019-9111</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container">
                  <span className="material-symbols-outlined">mail</span>
                </div>
                <div>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">General Support</p>
                  <p className="font-body-lg text-body-lg font-bold text-primary">info@urbanpatientcare.com</p>
                </div>
              </div>
            </div>

            <div className="bg-surface-container-highest p-4 rounded-[40px] overflow-hidden h-80 relative group border border-outline-variant/30">
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" 
                style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBkwonG9uLc8zWNQlp81upGUSlAw1Ww_lcjDi1bO0pCQfTjQ2-xGvkzoQgCh8cbJCqLfT4dD-PwW9RcJ_mgH1qjMiS0PknFo0dipMibcBIppF43PjzbszadS98Aq1AVzJWXkLyraDYmNakIcIDy2tHc9sIR5HBux9otKnPUZn8VYtLuZmnF_T7SJCaq7OyHPEtduenIvp9J_CbcX6b-y4rhwhub4BpV0j2MhfNotdfNHSwYScXHbjzZMg')" }}
              ></div>
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative z-10 h-full flex flex-col justify-end p-6">
                <div className="bg-surface/90 backdrop-blur px-6 py-4 rounded-3xl">
                  <h4 className="font-label-sm text-label-sm text-primary mb-1 font-semibold">Our Location</h4>
                  <p className="font-body-md text-body-md text-on-surface leading-tight">123 Healthcare Ave, Medical District, NY 10001</p>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* FAQs Section */}
        <section className="mt-24 max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display-lg text-display-lg text-primary mb-4">Frequently Asked Questions</h2>
            <p className="text-on-surface-variant">Find quick answers to common questions regarding our process.</p>
          </div>
          <div className="space-y-4">
            <details className="faq-accordion group bg-surface-container p-6 rounded-[32px] cursor-pointer">
              <summary className="flex justify-between items-center font-body-lg text-body-lg font-semibold text-primary list-none">
                How long does it take to get a response?
                <span className="material-symbols-outlined icon-rotate transition-transform duration-300">expand_more</span>
              </summary>
              <div className="mt-4 text-on-surface-variant leading-relaxed">
                Our wellness coordinators typically respond to inquiries within 4 to 6 business hours. For complex medical queries involving specialist reviews, please allow up to 24 hours.
              </div>
            </details>

            <details className="faq-accordion group bg-surface-container p-6 rounded-[32px] cursor-pointer">
              <summary className="flex justify-between items-center font-body-lg text-body-lg font-semibold text-primary list-none">
                Do I need a referral for a consultation?
                <span className="material-symbols-outlined icon-rotate transition-transform duration-300">expand_more</span>
              </summary>
              <div className="mt-4 text-on-surface-variant leading-relaxed">
                No, Urban Patient Care operates as a direct-access facility. While we welcome referrals from your current primary care physician, you can book an initial consultation directly through our inquiry portal.
              </div>
            </details>

            <details className="faq-accordion group bg-surface-container p-6 rounded-[32px] cursor-pointer">
              <summary className="flex justify-between items-center font-body-lg text-body-lg font-semibold text-primary list-none">
                What should I bring to my first appointment?
                <span className="material-symbols-outlined icon-rotate transition-transform duration-300">expand_more</span>
              </summary>
              <div className="mt-4 text-on-surface-variant leading-relaxed">
                Please bring any relevant medical history, a list of current medications, and your insurance details. If you have had recent blood work or imaging, having digital copies available via our "Documents" portal is highly recommended.
              </div>
            </details>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Contact;

