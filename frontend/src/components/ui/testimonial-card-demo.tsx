import { ClientsSection, Stat, Testimonial } from "@/components/ui/testimonial-card";

const statsData: Stat[] = [
  { value: "100+", label: "Happy clients" },
  { value: "$250M", label: "revenue added" },
  { value: "4.8", label: "Average Rating" },
];

const testimonialsData: Testimonial[] = [
  {
    name: "Will Smith",
    title: "Harper Education",
    quote:
      "Collaborating on this project was seamless. The vision was clearly understood, and the designs genuinely reflect my brand identity.",
    avatarSrc:
      "https://images.unsplash.com/photo-1752496906365-d5c662900cc1?w=1800&auto=format&fit=crop&q=100&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHx0b3BpYy1mZWVkfDQwfHRvd0paRnNrcEdnfHxlbnwwfHx8fHw%3D",
    rating: 5.0,
  },
  {
    name: "Ikta Sollork",
    title: "PARAL CEO",
    quote:
      "Working with this process was effortless. The vision was understood perfectly, and the designs truly represent my brand.",
    avatarSrc:
      "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fHBlb3BsZXxlbnwwfDJ8MHx8fDA%3D",
    rating: 4.7,
  },
  {
    name: "Alex Johnson",
    title: "Innovate Tech",
    quote:
      "A truly transformative partnership. The end result exceeded all of our expectations and has set a new standard in our industry.",
    avatarSrc:
      "https://images.unsplash.com/photo-1584308972272-9e4e7685e80f?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8ODZ8fHBlb3BsZXxlbnwwfDJ8MHx8fDA%3D",
    rating: 4.9,
  },
];

export default function ClientsSectionDemo() {
  return (
    <ClientsSection
      tagLabel="Happy Clients"
      title="Clients Love Me"
      description="Trusted by 100+ happy clients, adding $250M+ in revenue."
      stats={statsData}
      testimonials={testimonialsData}
      primaryActionLabel="Contact Now"
      secondaryActionLabel="See All Projects"
    />
  );
}
