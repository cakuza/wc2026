import { Mail, Twitter } from "lucide-react";

const channels = [
  { label: "X/Twitter", env: "NEXT_PUBLIC_X_URL", icon: Twitter },
  { label: "Email", env: "NEXT_PUBLIC_NEWSLETTER_URL", icon: Mail }
];

export function FollowUpdatesBox() {
  return (
    <section className="rounded-lg border border-[rgba(14,12,10,.10)] bg-white p-5">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-[#B48A00]">Social links</p>
      <h2 className="mt-2 text-2xl font-black text-[#0E0C0A]">Optional links for later.</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {channels.map((channel) => {
          const href = process.env[channel.env];
          const Icon = channel.icon;
          return href ? (
            <a key={channel.label} href={href} className="rounded-md border border-[rgba(14,12,10,.10)] bg-[#F6F4F1] px-4 py-3 font-bold text-[#0E0C0A]">
              <Icon className="mb-2 text-[#B48A00]" size={18} />
              {channel.label}
            </a>
          ) : (
            <div key={channel.label} className="rounded-md border border-[rgba(14,12,10,.10)] bg-[#F6F4F1] px-4 py-3 text-[#0E0C0A]/55">
              <Icon className="mb-2 text-[#B48A00]" size={18} />
              <p className="font-bold text-[#0E0C0A]">{channel.label}</p>
              <p className="text-sm">Not active in MVP</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
