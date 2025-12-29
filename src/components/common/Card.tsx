import React from 'react';
import { CardVariant, CardPadding } from '../../types/components';

interface CardProps {
  variant?: CardVariant;
  padding?: CardPadding;
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  variant = CardVariant.DEFAULT,
  padding = CardPadding.MD,
  children,
  className = '',
}) => {
  const variantClass =
    variant === CardVariant.ELEVATED
      ? 'card-elevated'
      : variant === CardVariant.OUTLINED
        ? 'card-outlined'
        : 'card-default';

  const paddingClass = `card-padding-${padding}`;

  return <div className={`card ${variantClass} ${paddingClass} ${className}`}>{children}</div>;
};

