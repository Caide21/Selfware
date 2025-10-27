import { TextInput, TextAreaAuto } from '@/components/Form';
import { usePageHeading } from '@/components/Layout/PageShell';

const PAGE_HEADING = {
  emoji: 'dY"c',
  title: 'Start a Scroll',
  subtitle:
    'If you resonate with what I build, let�?Ts begin a conversation. Tell me what you�?Tre creating �?" or what you want to feel.',
};

export default function Contact() {
  usePageHeading(PAGE_HEADING);

  return (
    <form className="mt-10 w-full max-w-xl space-y-6 mx-auto">
      <div>
        <label className="block text-sm mb-1" htmlFor="name">
          Your Name
        </label>
        <TextInput id="name" type="text" placeholder="You are..." />
      </div>

      <div>
        <label className="block text-sm mb-1" htmlFor="email">
          Email
        </label>
        <TextInput id="email" type="email" placeholder="Where can I reach you?" />
      </div>

      <div>
        <label className="block text-sm mb-1" htmlFor="message">
          Message / What are you building?
        </label>
        <TextAreaAuto id="message" placeholder="Speak your intent..." maxRows={10} />
      </div>

      <button type="submit" className="w-full py-3 rounded-xl bg-white text-black font-semibold hover:scale-105 transition">
        Cast the Scroll
      </button>
    </form>
  );
}
