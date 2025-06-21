import { VerticalTimeline, VerticalTimelineElement } from 'react-vertical-timeline-component';
import 'react-vertical-timeline-component/style.min.css';
import { ShieldAlert, CheckCircle, User } from "lucide-react";


const steps = [
  {
    id: 1,
    title: "Civic Auth Verification",
    description:
      "Verified white-hat hackers and security experts join our trusted network through Civic identity verification.",
    icon: <User size={24} />,
    bgColor: "var(--cyber-accent)",
  },
  {
    id: 2,
    title: "Agent AI Detection",
    description:
      "Our agentic AI continuously monitors Web3 protocols, analyzing smart contracts and detecting threats in real-time.",
    icon: <ShieldAlert size={24} />,
    bgColor: "var(--cyber-neon)",
  },
  {
    id: 3,
    title: "Human Approval",
    description:
      "Verified experts review AI findings, approve responses, and execute mitigation strategies for maximum accuracy.",
    icon: <CheckCircle size={24} />,
    bgColor: "var(--cyber-purple)",
  },
];

export default function TimelinePage() {
  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-12 sm:px-6 lg:px-8">
      <h2 className="text-3xl font-bold glow-text text-center mb-2">How It Works</h2>
      <p className="text-slate-400 text-center tracking-tight mb-12">A simple 3-step process that combines human expertise with AI precision</p>

      {/* <VerticalTimeline >
        {steps.map((step) => (
          <VerticalTimelineElement
            key={step.id}
            className="vertical-timeline-element--work "
            contentStyle={{ background: '#FBD9ED', color: '#000' }}
            contentArrowStyle={{ borderRight: `7px solid #FBD9ED` }}
            date={`Step 0${step.id}`}
            iconStyle={{ background: step.bgColor, color: '#fff' }}
            icon={step.icon}
          >
            <h3 className="text-lg font-semibold text-cyber-accent">{step.title}</h3>
            <p className="text-slate-600 text-sm mt-2">{step.description}</p>
          </VerticalTimelineElement>
        ))}
      </VerticalTimeline> */}

      <VerticalTimeline>
        {steps.map((step) => (
          <VerticalTimelineElement
            key={step.id}
            className="vertical-timeline-element--work"
            // contentStyle={{ background: step.bgColor, color: '#fff' }}
            contentStyle={{
              background: 'color-mix(in srgb, var(--cyber-blue) 50%, transparent)',
              backdropFilter: 'blur(12px)',
              border: '1px solid color-mix(in srgb, var(--cyber-accent) 20%, transparent)',
              borderRadius: 'var(--radius)',
              color: '#fff',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
            contentArrowStyle={{ borderRight: `7px solid ${step.bgColor}` }}
            date={`Step 0${step.id}`}
            iconStyle={{ background: step.bgColor, color: '#fff' }}
            icon={step.icon}
          >
            <h3 className="text-lg font-semibold">{step.title}</h3>
            <p className="text-sm mt-2">{step.description}</p>
          </VerticalTimelineElement>
        ))}
      </VerticalTimeline>

    </div>
  );
}
