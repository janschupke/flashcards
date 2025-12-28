import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { CharacterInfoColumn } from './CharacterInfoColumn';

describe('CharacterInfoColumn', () => {
  it('renders label and value', () => {
    render(<CharacterInfoColumn label="Test Label" value="Test Value" />);

    expect(screen.getByText('Test Label')).toBeInTheDocument();
    expect(screen.getByText('Test Value')).toBeInTheDocument();
  });

  it('applies default value className', () => {
    const { container } = render(<CharacterInfoColumn label="Label" value="Value" />);

    const valueElement = container.querySelector('.text-text-secondary');
    expect(valueElement).toBeInTheDocument();
    expect(valueElement).toHaveTextContent('Value');
  });

  it('applies custom value className', () => {
    const { container } = render(
      <CharacterInfoColumn label="Label" value="Value" valueClassName="text-success" />
    );

    const valueElement = container.querySelector('.text-success');
    expect(valueElement).toBeInTheDocument();
    expect(valueElement).toHaveTextContent('Value');
  });

  it('renders with correct structure', () => {
    const { container } = render(<CharacterInfoColumn label="Label" value="Value" />);

    const column = container.querySelector('.flex.flex-col.items-center.flex-1');
    expect(column).toBeInTheDocument();

    const label = column?.querySelector('.text-xs');
    expect(label).toHaveTextContent('Label');

    const value = column?.querySelector('.text-lg');
    expect(value).toHaveTextContent('Value');
  });
});
