import React from 'react';
import * as LucideIcons from 'lucide-react';
import type { LucideProps } from 'lucide-react';

interface DynamicIconProps extends LucideProps {
  name: string;
  className?: string;
  glowColor?: string;
  color?: string;
}

const DynamicIcon: React.FC<DynamicIconProps> = ({ name, className = "", glowColor, color, ...props }) => {
  const IconComponent = (LucideIcons as any)[name];

  if (!IconComponent) {
    return <span className={className}>{name}</span>;
  }

  const iconColor = color || (props as any).color || 'currentColor';

  return (
    <div className={`dynamic-icon-wrapper ${className}`} style={{ 
      display: 'inline-flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      position: 'relative'
    }}>
      {glowColor && (
        <div 
          className="icon-glow-effect" 
          style={{ 
            position: 'absolute',
            width: '100%',
            height: '100%',
            background: glowColor,
            filter: 'blur(12px)',
            opacity: 0.4,
            borderRadius: '50%',
            zIndex: -1
          }} 
        />
      )}
      <IconComponent 
        {...props} 
        color={iconColor}
        className="realistic-icon"
      />
    </div>
  );
};

export default DynamicIcon;
