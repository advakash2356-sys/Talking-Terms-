import React from 'react';
import {
  AudioWaveform,
  Copy,
  Sparkles,
  Sliders,
  Cpu,
  Bot,
  Code,
  ShieldCheck,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { MockFeatureCard } from './types';

interface ShowcaseGridProps {
  features: MockFeatureCard[];
  onSelectFeature?: (feature: MockFeatureCard) => void;
  className?: string;
}

export const ShowcaseGrid: React.FC<ShowcaseGridProps> = ({
  features,
  onSelectFeature,
  className = '',
}) => {
  const getIcon = (iconName: MockFeatureCard['iconName']) => {
    const iconClass = 'w-5 h-5 text-gray-900';
    switch (iconName) {
      case 'waveform':
        return <AudioWaveform className={iconClass} />;
      case 'copy':
        return <Copy className={iconClass} />;
      case 'sparkles':
        return <Sparkles className={iconClass} />;
      case 'sliders':
        return <Sliders className={iconClass} />;
      case 'cpu':
        return <Cpu className={iconClass} />;
      case 'bot':
        return <Bot className={iconClass} />;
      case 'code':
        return <Code className={iconClass} />;
      case 'shield':
        return <ShieldCheck className={iconClass} />;
      default:
        return <Sparkles className={iconClass} />;
    }
  };

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`} id="showcase-grid">
      {features.map((feature) => (
        <div
          key={feature.id}
          onClick={() => onSelectFeature?.(feature)}
          className="bg-white rounded-2xl p-5 border border-gray-200/90 shadow-sm hover:shadow-md hover:border-gray-400 transition-all duration-200 flex flex-col justify-between group cursor-pointer"
        >
          <div>
            {/* CARD TOP ROW */}
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-gray-100 group-hover:bg-black group-hover:text-white transition-colors flex items-center justify-center">
                <span className="group-hover:text-white transition-colors">
                  {getIcon(feature.iconName)}
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                {feature.tag}
              </span>
            </div>

            {/* TITLE & DESCRIPTION */}
            <h4 className="text-base font-bold text-gray-900 mb-1.5 group-hover:text-black">
              {feature.title}
            </h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              {feature.description}
            </p>
          </div>

          {/* FOOTER ACTION */}
          <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 font-medium group-hover:text-black transition-colors">
            <span>Explore tool</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      ))}
    </div>
  );
};
