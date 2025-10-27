import { useState } from "react";
import { TextInput, TextAreaAuto } from '@/components/Form';

export default function RegistrationModal({ isOpen, onClose, onSubmit }) {
  if (!isOpen) return null;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    focusAreas: [],
    project: "",
    phone: "",
    address: "",
    vat_number: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    setFormData((prev) => {
      const updated = checked
        ? [...prev.focusAreas, value]
        : prev.focusAreas.filter((f) => f !== value);
      return { ...prev, focusAreas: updated };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="bg-white/5 border border-white/10 text-white p-4 sm:p-8 rounded-2xl w-full max-w-lg shadow-xl relative backdrop-blur-md overflow-y-auto max-h-[90vh]">
        <button className="absolute top-4 right-5 text-white text-xl" onClick={onClose}>×</button>
        <h2 className="text-xl sm:text-2xl font-bold mb-6">📜 Register Before Booking</h2>
        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <TextInput name="name" type="text" placeholder="Your Name" required onChange={handleChange} />
          <TextInput name="email" type="email" placeholder="Email Address" required onChange={handleChange} />
          <select name="role" required onChange={handleChange}
            className="w-full p-3 rounded-xl bg-black/30 border border-white/10 text-white">
            <option value="">Your Role</option>
            <option value="Student">Student</option>
            <option value="Founder">Founder</option>
            <option value="Architect">Architect</option>
            <option value="Coach">Coach</option>
            <option value="Other">Other</option>
          </select>

          <fieldset>
            <legend className="font-semibold mb-1">Focus Areas</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {["GPT", "Notion", "Automation", "Symbolic System Design"].map((option) => (
                <label key={option} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    value={option}
                    checked={formData.focusAreas.includes(option)}
                    onChange={handleCheckboxChange}
                    className="accent-white"
                  />
                  {option}
                </label>
              ))}
            </div>
          </fieldset>

          <TextAreaAuto name="project" placeholder="Describe your project or goal..." onChange={handleChange} maxRows={8} />

          <TextInput name="phone" type="tel" placeholder="Phone Number (e.g. +27...)" onChange={handleChange} />

          <TextInput name="address" type="text" placeholder="Address (for invoice / records)" onChange={handleChange} />

          <TextInput name="vat_number" type="text" placeholder="VAT Number (optional)" onChange={handleChange} />

          <button
            type="submit"
            className="bg-white text-black font-semibold px-6 py-3 rounded-xl hover:bg-gray-100 transition w-full"
          >
            Book a Slot 📅
          </button>
        </form>
      </div>
    </div>
  );
}
