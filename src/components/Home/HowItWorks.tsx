import { VerticalTimeline, VerticalTimelineElement } from 'react-vertical-timeline-component';
import 'react-vertical-timeline-component/style.min.css';
import { LogIn, Globe, Bug, Download, Key } from "lucide-react";
import { useTheme } from 'next-themes';

const steps = [
  {
    id: 1,
    title: "Login",
    description:
      "Sign in to your Kavach.ai account using Civic Auth for secure, verified access to our security platform.",
    icon: <LogIn size={24} />,
    bgColor: "#3B82F6",
  },
  {
    id: 2,
    title: "Paste Website URL",
    description:
      "Simply paste the website URL you want to scan for vulnerabilities and security issues.",
    icon: <Globe size={24} />,
    bgColor: "#10B981",
  },
  {
    id: 3,
    title: "Vulnerabilities & Suggestions",
    description:
      "Our AI-powered system analyzes the website and provides detailed vulnerability reports with actionable security suggestions.",
    icon: <Bug size={24} />,
    bgColor: "#EF4444",
  },
  {
    id: 4,
    title: "VsCode Extension",
    description:
      "Install our VsCode extension for real-time security monitoring and instant vulnerability detection while coding.",
    icon: <Download size={24} />,
    bgColor: "#8B5CF6",
  },
  {
    id: 5,
    title: "Verify with Token",
    description:
      "Get your verification token from the dashboard and authenticate your VS Code extension for seamless integration.",
    icon: <Key size={24} />,
    bgColor: "#F59E0B",
  },
];

export default function TimelinePage() {
  const { theme } = useTheme();

  return (
    <section className={`py-16 ${theme === 'light' ? 'bg-gray-100 text-gray-900' : 'bg-black text-white'}`}>
      <style jsx>{`
        .vertical-timeline::before {
          background: #374151 !important;
          width: 2px !important;
        }
        .vertical-timeline-element-icon {
          box-shadow: 0 0 0 4px #1F2937 !important;
        }
      `}</style>

      <h2 className="text-3xl font-bold glow-text text-center mb-2">How It Works</h2>
      <p className="text-slate-400 dark:text-slate-400 text-center tracking-tight mb-12">
        A simple 5-step process for comprehensive website security scanning
      </p>

      <VerticalTimeline>
        {steps.map((step) => {
          const isLight = theme === 'light';

          return (
            <VerticalTimelineElement
              key={step.id}
              className="vertical-timeline-element--work"
              contentStyle={
                isLight
                  ? {
                      background: '#ffffff',
                      color: '#1f2937',
                      border: `1px solid ${step.bgColor}`,
                      boxShadow: '0 4px 14px rgba(0,0,0,0.05)',
                      borderRadius: '0.5rem',
                    }
                  : {
                      background: 'color-mix(in srgb, var(--cyber-blue) 50%, transparent)',
                      backdropFilter: 'blur(12px)',
                      border: '1px solid color-mix(in srgb, var(--cyber-accent) 20%, transparent)',
                      borderRadius: 'var(--radius)',
                      color: '#fff',
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    }
              }
              contentArrowStyle={{
                borderRight: `7px solid ${step.bgColor}`,
              }}
              date={`Step 0${step.id}`}
              iconStyle={{ background: step.bgColor, color: '#fff' }}
              icon={step.icon}
            >
              <h3 className={`text-lg font-semibold ${isLight ? 'text-gray-900' : ''}`}>{step.title}</h3>
              <p className={`text-sm mt-2 ${isLight ? 'text-gray-700' : ''}`}>{step.description}</p>
            </VerticalTimelineElement>
          );
        })}
      </VerticalTimeline>
    </section>
  );
}
